/**
 * Cross-Sport Booking Validation System
 *
 * Since the ground is shared across sports (Cricket, Football, Badminton),
 * a time slot booked for any sport MUST be blocked for all other sports
 * on the same ground type (match = Main Turf, practice = Practice Turf).
 *
 * This module provides:
 * 1. Cross-sport conflict detection (checks ALL sports, not just the requested one)
 * 2. Atomic booking creation using MongoDB transactions to prevent race conditions
 * 3. Frozen slot validation across sports for the same ground
 * 4. Proper handling of multi-slot bookings stored as comma-separated strings
 */

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ConflictResult {
  hasConflict: boolean;
  conflictDetails?: {
    slot: string;
    sport: string;
    bookingId: string;
  };
}

export interface FrozenSlotResult {
  isFrozen: boolean;
  frozenSlot?: string;
  frozenSport?: string;
}

export interface AtomicBookingResult {
  success: boolean;
  booking?: any;
  error?: string;
  statusCode?: number;
}

// ─── Slot Parsing Utilities ──────────────────────────────────────────────────

/**
 * Extract individual slot strings from a booking's `slot` field.
 * Handles both single slots ("06:00-07:00") and comma-separated
 * multi-slot strings ("06:00-07:00, 07:00-08:00").
 */
export function extractSlots(slotField: string): string[] {
  return slotField
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Build a regex pattern that matches a single slot time within a
 * potentially comma-separated slot string stored in the database.
 *
 * Matches:
 *   - Exact: "06:00-07:00"
 *   - Start of list: "06:00-07:00, 07:00-08:00"
 *   - Middle: "05:00-06:00, 06:00-07:00, 07:00-08:00"
 *   - End: "05:00-06:00, 06:00-07:00"
 */
function buildSlotMatchRegex(slot: string): RegExp {
  const escaped = slot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|,\\s*)${escaped}(\\s*,|$)`);
}

// ─── Cross-Sport Conflict Detection ─────────────────────────────────────────

/**
 * Check if any of the requested slots conflict with EXISTING bookings
 * across ALL sports for the same ground type (bookingType).
 *
 * This is the core validation that enforces the shared-ground rule:
 * booking Cricket at 06:00-07:00 blocks Football and Badminton at
 * the same time on the same turf.
 *
 * @param bookingType  - 'match' (Main Turf) or 'practice' (Practice Turf)
 * @param date         - Date in YYYY-MM-DD format
 * @param slots        - Array of individual slot strings to check
 * @param excludeBookingId - Optional booking ID to exclude (for updates)
 * @param session      - Optional MongoDB session for transactional reads
 */
export async function checkCrossSportConflicts(
  bookingType: 'match' | 'practice',
  date: string,
  slots: string[],
  excludeBookingId?: string,
  session?: mongoose.ClientSession
): Promise<ConflictResult> {
  for (const singleSlot of slots) {
    const query: any = {
      date,
      bookingType,
      // Only confirmed bookings block slots (cancelled/completed do not)
      status: 'confirmed',
      // Match the slot whether it's stored as a single value or in a comma list
      $or: [
        { slot: singleSlot },
        { slot: { $regex: buildSlotMatchRegex(singleSlot) } },
      ],
      // NO sport filter → checks across ALL sports on this ground
    };

    if (excludeBookingId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }

    const findQuery = TurfBooking.findOne(query);
    if (session) {
      findQuery.session(session);
    }

    const existingBooking = await findQuery.lean();

    if (existingBooking) {
      return {
        hasConflict: true,
        conflictDetails: {
          slot: singleSlot,
          sport: (existingBooking as any).sport,
          bookingId: (existingBooking as any)._id.toString(),
        },
      };
    }
  }

  return { hasConflict: false };
}

// ─── Cross-Sport Frozen Slot Check ──────────────────────────────────────────

/**
 * Check if any of the requested slots are frozen for ANY sport on the
 * same ground type. Since the ground is shared, a frozen slot for one
 * sport effectively blocks the ground for all sports.
 *
 * @param bookingType - 'match' or 'practice'
 * @param date        - Date in YYYY-MM-DD format
 * @param slots       - Array of slot strings to check
 * @param session     - Optional MongoDB session
 */
export async function checkCrossSportFrozenSlots(
  bookingType: 'match' | 'practice',
  date: string,
  slots: string[],
  session?: mongoose.ClientSession
): Promise<FrozenSlotResult> {
  for (const singleSlot of slots) {
    const query: any = {
      bookingType,
      date,
      slot: singleSlot,
      isFrozen: true,
      // NO sport filter → any frozen sport blocks the ground
    };

    const findQuery = Slot.findOne(query);
    if (session) {
      findQuery.session(session);
    }

    const frozenSlot = await findQuery.lean();

    if (frozenSlot) {
      return {
        isFrozen: true,
        frozenSlot: singleSlot,
        frozenSport: (frozenSlot as any).sport,
      };
    }
  }

  return { isFrozen: false };
}

// ─── Get All Booked Slots for a Ground ──────────────────────────────────────

/**
 * Get ALL booked slot times for a given date and ground type, across all sports.
 * Used by the slots availability API to show cross-sport blocking.
 *
 * Returns a map of slot → booking sport for display purposes.
 *
 * @param bookingType - 'match' or 'practice'
 * @param date        - Date in YYYY-MM-DD format
 */
export async function getAllBookedSlotsForGround(
  bookingType: 'match' | 'practice',
  date: string
): Promise<{ slot: string; sport: string }[]> {
  const bookings = await TurfBooking.find({
    date,
    bookingType,
    status: { $in: ['confirmed', 'completed'] },
  })
    .select('slot sport -_id')
    .lean();

  const bookedSlots: { slot: string; sport: string }[] = [];

  for (const booking of bookings) {
    const individual = extractSlots((booking as any).slot);
    for (const s of individual) {
      bookedSlots.push({ slot: s, sport: (booking as any).sport });
    }
  }

  return bookedSlots;
}

/**
 * Get ALL frozen slots for a given date and ground type, across all sports.
 *
 * @param bookingType - 'match' or 'practice'
 * @param date        - Date in YYYY-MM-DD format
 */
export async function getAllFrozenSlotsForGround(
  bookingType: 'match' | 'practice',
  date: string
): Promise<{ slot: string; sport: string }[]> {
  const frozenSlots = await Slot.find({
    date,
    bookingType,
    isFrozen: true,
  })
    .select('slot sport -_id')
    .lean();

  return frozenSlots.map((fs) => ({
    slot: (fs as any).slot,
    sport: (fs as any).sport,
  }));
}

// ─── Atomic Booking Creation ────────────────────────────────────────────────

/**
 * Create a TurfBooking atomically using a MongoDB transaction.
 *
 * Flow:
 *   1. Start a session + transaction
 *   2. Check for cross-sport conflicts (read within txn for snapshot isolation)
 *   3. Check for frozen slots
 *   4. Insert the booking document
 *   5. Commit or abort
 *
 * If the MongoDB deployment does not support transactions (e.g. standalone),
 * falls back to a non-transactional write with a pre-check.
 *
 * @param bookingData - Full document to insert (must match TurfBooking schema)
 * @param slotsArray  - Individual slot strings being booked
 */
export async function createBookingAtomically(
  bookingData: Record<string, any>,
  slotsArray: string[]
): Promise<AtomicBookingResult> {
  await dbConnect();

  const bookingType = bookingData.bookingType as 'match' | 'practice';
  const date = bookingData.date as string;

  // ── Try transactional path first ────────────────────────────────────────
  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();
  } catch {
    // Session creation failed — standalone MongoDB; fall through to fallback
    session = null;
  }

  if (session) {
    try {
      let createdBooking: any = null;

      await session.withTransaction(async () => {
        // 1. Cross-sport conflict check (inside transaction)
        const conflict = await checkCrossSportConflicts(
          bookingType,
          date,
          slotsArray,
          undefined,
          session!
        );

        if (conflict.hasConflict) {
          const d = conflict.conflictDetails!;
          throw new ConflictError(
            `Slot ${d.slot} is already booked for ${d.sport} on this ground. ` +
              `Since it's a shared ground, this time is unavailable for all sports.`,
            d.slot,
            d.sport
          );
        }

        // 2. Frozen slot check (inside transaction)
        const frozen = await checkCrossSportFrozenSlots(
          bookingType,
          date,
          slotsArray,
          session!
        );

        if (frozen.isFrozen) {
          throw new FrozenSlotError(
            `Slot ${frozen.frozenSlot} is frozen (${frozen.frozenSport}) and unavailable for booking.`,
            frozen.frozenSlot!,
            frozen.frozenSport!
          );
        }

        // 3. Create the booking within the transaction
        const [booking] = await TurfBooking.create([bookingData], { session });
        createdBooking = booking;
      });

      return { success: true, booking: createdBooking };
    } catch (error: any) {
      if (error instanceof ConflictError) {
        return { success: false, error: error.message, statusCode: 409 };
      }
      if (error instanceof FrozenSlotError) {
        return { success: false, error: error.message, statusCode: 403 };
      }
      // Duplicate key from unique index (race condition safety net)
      if (error.code === 11000) {
        return {
          success: false,
          error:
            'This slot was just booked by someone else. Please refresh and try again.',
          statusCode: 409,
        };
      }
      throw error; // Re-throw unexpected errors
    } finally {
      await session.endSession();
    }
  }

  // ── Fallback: non-transactional (standalone MongoDB) ────────────────────
  // Still does a pre-check, but without snapshot isolation there's a small
  // window for a race condition. The unique index acts as a safety net.
  const conflict = await checkCrossSportConflicts(bookingType, date, slotsArray);

  if (conflict.hasConflict) {
    const d = conflict.conflictDetails!;
    return {
      success: false,
      error:
        `Slot ${d.slot} is already booked for ${d.sport} on this ground. ` +
        `Since it's a shared ground, this time is unavailable for all sports.`,
      statusCode: 409,
    };
  }

  const frozen = await checkCrossSportFrozenSlots(bookingType, date, slotsArray);

  if (frozen.isFrozen) {
    return {
      success: false,
      error: `Slot ${frozen.frozenSlot} is frozen (${frozen.frozenSport}) and unavailable for booking.`,
      statusCode: 403,
    };
  }

  try {
    const booking = await TurfBooking.create(bookingData);
    return { success: true, booking };
  } catch (error: any) {
    if (error.code === 11000) {
      return {
        success: false,
        error:
          'This slot was just booked by someone else. Please refresh and try again.',
        statusCode: 409,
      };
    }
    throw error;
  }
}

// ─── Custom Error Classes ───────────────────────────────────────────────────

class ConflictError extends Error {
  slot: string;
  sport: string;

  constructor(message: string, slot: string, sport: string) {
    super(message);
    this.name = 'ConflictError';
    this.slot = slot;
    this.sport = sport;
  }
}

class FrozenSlotError extends Error {
  slot: string;
  sport: string;

  constructor(message: string, slot: string, sport: string) {
    super(message);
    this.name = 'FrozenSlotError';
    this.slot = slot;
    this.sport = sport;
  }
}
