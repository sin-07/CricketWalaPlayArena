import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';

/**
 * Auto-cleanup expired frozen slots
 * Removes frozen slots for past dates and past time slots for today
 */
export async function cleanupExpiredFrozenSlots() {
  try {
    await dbConnect();

    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // Delete all frozen slots from past dates
    const pastDatesResult = await Slot.deleteMany({
      isFrozen: true,
      date: { $lt: today }
    });

    // Delete frozen slots for today that have already passed
    const pastTimeSlots: string[] = [];
    for (let hour = 0; hour <= currentHour; hour++) {
      const startHour = hour.toString().padStart(2, '0');
      const endHour = ((hour + 1) % 24).toString().padStart(2, '0');
      pastTimeSlots.push(`${startHour}:00-${endHour}:00`);
    }

    let todayResult = { deletedCount: 0 };
    if (pastTimeSlots.length > 0) {
      todayResult = await Slot.deleteMany({
        isFrozen: true,
        date: today,
        slot: { $in: pastTimeSlots }
      });
    }

    const totalDeleted = (pastDatesResult.deletedCount || 0) + (todayResult.deletedCount || 0);
    if (totalDeleted > 0) {
      console.log(`Auto-cleanup: Removed ${totalDeleted} expired frozen slots`);
    }

    return totalDeleted;
  } catch (error) {
    console.error('Error in auto-cleanup:', error);
    return 0;
  }
}

/**
 * Validate that a slot is not frozen before allowing a booking
 * @param bookingType - 'match' or 'practice'
 * @param sport - The sport being booked
 * @param date - Date in YYYY-MM-DD format
 * @param slot - Slot time (e.g., "06:00-07:00")
 * @returns Object with {isValid, message}
 */
export async function validateSlotNotFrozen(
  bookingType: string,
  sport: string,
  date: string,
  slot: string
) {
  try {
    await dbConnect();

    // Auto-cleanup expired frozen slots first
    await cleanupExpiredFrozenSlots();

    const frozenSlot = await Slot.findOne({
      bookingType,
      sport,
      date,
      slot,
      isFrozen: true,
    });

    if (frozenSlot) {
      return {
        isValid: false,
        message: `This slot (${slot}) for ${sport} on ${date} is currently frozen and unavailable for booking.`,
      };
    }

    return {
      isValid: true,
      message: 'Slot is available for booking',
    };
  } catch (error) {
    console.error('Error validating frozen slot:', error);
    return {
      isValid: false,
      message: 'Error validating slot availability',
    };
  }
}

/**
 * Check if multiple slots are frozen
 * @param bookings - Array of {bookingType, sport, date, slot}
 * @returns Array of frozen slots found
 */
export async function checkMultipleFrozenSlots(
  bookings: Array<{
    bookingType: string;
    sport: string;
    date: string;
    slot: string;
  }>
) {
  try {
    await dbConnect();

    const frozenSlots = await Slot.find({
      $or: bookings,
      isFrozen: true,
    });

    return frozenSlots;
  } catch (error) {
    console.error('Error checking multiple frozen slots:', error);
    return [];
  }
}
