import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';

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
