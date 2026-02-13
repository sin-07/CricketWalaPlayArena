/**
 * Pricing utilities for turf bookings with day-based discounts
 */

// Base prices for different booking types
const BASE_PRICES = {
  match: 1200,     // ₹1200 for match bookings (Main Turf)
  practice: 250,   // ₹250 for practice bookings (Practice Turf)
} as const;

// Advance payment for match bookings (paid online, rest offline)
const ADVANCE_PAYMENT_MATCH = 200; // ₹200 advance for main turf bookings

/**
 * Get day of week from date string
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Day number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
const dayCache = new Map<string, number>();

export function getDayOfWeek(dateStr: string): number {
  // Use cache to avoid repeated date parsing
  if (dayCache.has(dateStr)) {
    return dayCache.get(dateStr)!;
  }
  
  const date = new Date(dateStr + 'T00:00:00Z');
  const day = date.getUTCDay();
  dayCache.set(dateStr, day);
  
  // Clear cache if it gets too large (> 100 entries)
  if (dayCache.size > 100) {
    const firstKey = dayCache.keys().next().value as string | undefined;
    if (firstKey) {
      dayCache.delete(firstKey);
    }
  }
  
  return day;
}

/**
 * Get day name from date
 */
export function getDayName(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getDayOfWeek(dateStr)];
}

/**
 * Calculate discount percentage based on day of week
 * Monday to Thursday (1-4): 30% off
 * Friday to Sunday (5-0): 10% off
 * @param dateStr - Date in YYYY-MM-DD format
 * @returns Discount percentage (0-30)
 */
export function getDiscountPercentage(dateStr: string): number {
  const dayOfWeek = getDayOfWeek(dateStr);

  // Monday (1) to Thursday (4): 30% discount
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    return 30;
  }

  // Friday (5) to Sunday (0, but we check 5 and 6): 10% discount
  if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
    return 10;
  }

  return 0;
}

/**
 * Calculate final price for a booking after applying discount
 * @param bookingType - Type of booking ('match' or 'practice')
 * @param dateStr - Date in YYYY-MM-DD format
 * @param numSlots - Number of slots selected (defaults to 1)
 * @returns Final price after discount
 */
export function calculateFinalPrice(
  bookingType: 'match' | 'practice',
  dateStr: string,
  numSlots: number = 1
): {
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  totalPrice: number;
  advancePayment: number;
  remainingPayment: number;
  dayName: string;
  numSlots: number;
} {
  const basePricePerSlot = BASE_PRICES[bookingType];
  const basePrice = basePricePerSlot * numSlots;
  // No discount for practice turf bookings
  const discountPercentage = bookingType === 'practice' ? 0 : getDiscountPercentage(dateStr);
  const discountAmount = (basePrice * discountPercentage) / 100;
  const finalPrice = basePrice - discountAmount;
  
  // Total price = final price after discounts (NO additional charges for either booking type)
  const totalPrice = finalPrice;
  
  // Payment split logic:
  // - Match (Main Turf): Pay ₹200 online, rest offline at turf
  // - Practice: Pay full amount online
  const advancePayment = bookingType === 'match' 
    ? Math.min(ADVANCE_PAYMENT_MATCH, totalPrice) // Don't exceed total price
    : totalPrice; // Practice pays full amount online
  const remainingPayment = bookingType === 'match' 
    ? Math.max(0, totalPrice - advancePayment)
    : 0; // Practice has no remaining payment
  
  const dayName = getDayName(dateStr);

  return {
    basePrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    totalPrice,
    advancePayment,
    remainingPayment,
    dayName,
    numSlots,
  };
}

/**
 * Get discount information for display
 */
export function getDiscountInfo(bookingType: 'match' | 'practice', dateStr: string): string {
  const { discountPercentage, dayName } = calculateFinalPrice(bookingType, dateStr);

  if (discountPercentage === 30) {
    return `30% discount on ${dayName}s (Mon-Thu)`;
  } else if (discountPercentage === 10) {
    return `10% discount on ${dayName}s (Fri-Sun)`;
  }

  return `Regular pricing on ${dayName}s`;
}

/**
 * Format price display with discount
 */
export function formatPriceDisplay(
  bookingType: 'match' | 'practice',
  dateStr: string
): string {
  const pricing = calculateFinalPrice(bookingType, dateStr);

  if (pricing.discountPercentage === 0) {
    return `₹${pricing.finalPrice}`;
  }

  return `₹${pricing.basePrice} → ₹${pricing.finalPrice} (${pricing.discountPercentage}% off)`;
}
