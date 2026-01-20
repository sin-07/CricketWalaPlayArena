import Coupon from '@/models/Coupon';
import { calculateFinalPrice } from '@/lib/pricingUtils';

interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discount?: number;
  finalPrice?: number;
  couponData?: any;
}

/**
 * Validate if a coupon code exists and is applicable
 */
export async function validateCoupon(
  code: string,
  bookingType: 'match' | 'practice',
  sport: string,
  date: string,
  slot: string,
  basePrice: number,
  userEmail: string
): Promise<CouponValidationResult> {
  try {
    // Find coupon by code
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return {
        isValid: false,
        message: 'Invalid coupon code',
      };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return {
        isValid: false,
        message: 'This coupon is no longer active',
      };
    }

    // Check if coupon is expired
    if (new Date(coupon.expiryDate) < new Date()) {
      return {
        isValid: false,
        message: 'This coupon has expired',
      };
    }

    // Check if user is assigned to this coupon
    if (coupon.assignedUsers.length > 0 && !coupon.assignedUsers.includes(userEmail)) {
      return {
        isValid: false,
        message: 'This coupon is not assigned to you',
      };
    }

    // Check usage limit (total)
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return {
        isValid: false,
        message: 'This coupon has reached its usage limit',
      };
    }

    // Check booking type
    if (coupon.bookingType !== 'both' && coupon.bookingType !== bookingType) {
      return {
        isValid: false,
        message: `This coupon is not valid for ${bookingType} bookings`,
      };
    }

    // Check sport
    if (coupon.sport.length > 0 && !coupon.sport.includes(sport)) {
      return {
        isValid: false,
        message: `This coupon is not valid for ${sport}`,
      };
    }

    // Check applicable slots (if specified)
    if (coupon.applicableSlots.length > 0) {
      const slotMatch = coupon.applicableSlots.some(
        (s: any) => s.date === date && s.slot === slot
      );
      if (!slotMatch) {
        return {
          isValid: false,
          message: 'This coupon is not valid for the selected date and time slot',
        };
      }
    }

    // Check minimum amount
    if (basePrice < coupon.minAmount) {
      return {
        isValid: false,
        message: `Minimum booking amount of ₹${coupon.minAmount} required for this coupon`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'flat') {
      discount = coupon.discountValue;
    } else {
      discount = (basePrice * coupon.discountValue) / 100;
    }

    // Ensure discount doesn't exceed base price
    discount = Math.min(discount, basePrice);

    const finalPrice = Math.max(0, basePrice - discount);

    return {
      isValid: true,
      message: 'Coupon applied successfully',
      discount,
      finalPrice,
      couponData: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    };
  } catch (error: any) {
    return {
      isValid: false,
      message: error.message || 'Error validating coupon',
    };
  }
}

/**
 * Get available coupons for a user
 */
export async function getUserCoupons(userEmail: string): Promise<any[]> {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() },
      $or: [{ assignedUsers: userEmail }, { assignedUsers: { $size: 0 } }],
    }).select('code discountType discountValue -_id');

    return coupons;
  } catch (error: any) {
    console.error('Error fetching user coupons:', error);
    return [];
  }
}

/**
 * Get coupons for a specific slot
 */
export async function getSlotCoupons(
  date: string,
  slot: string,
  sport: string,
  bookingType: 'match' | 'practice',
  userEmail: string
): Promise<any[]> {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() },
      $and: [
        {
          $or: [
            {
              applicableSlots: {
                $elemMatch: { date, slot },
              },
            },
            { applicableSlots: { $size: 0 } },
          ],
        },
        {
          $or: [
            { sport: sport },
            { sport: { $size: 0 } },
          ],
        },
        {
          $or: [{ assignedUsers: userEmail }, { assignedUsers: { $size: 0 } }],
        },
      ],
      bookingType: { $in: [bookingType, 'both'] },
    }).select('code discountType discountValue -_id');

    return coupons;
  } catch (error: any) {
    console.error('Error fetching slot coupons:', error);
    return [];
  }
}

/**
 * Increment coupon usage
 */
export async function incrementCouponUsage(couponCode: string): Promise<boolean> {
  try {
    const result = await Coupon.updateOne(
      { code: couponCode.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    return result.modifiedCount > 0;
  } catch (error: any) {
    console.error('Error incrementing coupon usage:', error);
    return false;
  }
}

/**
 * Calculate final price with coupon
 */
export async function calculateFinalPriceWithCoupon(
  bookingType: 'match' | 'practice',
  date: string,
  sport: string,
  basePrice: number,
  couponCode?: string,
  userEmail?: string
): Promise<{
  basePrice: number;
  basePriceAfterDayDiscount: number;
  dayDiscount: number;
  couponDiscount: number;
  finalPrice: number;
  couponApplied?: string;
}> {
  // Calculate base price with day discount
  const dayPricing = calculateFinalPrice(bookingType, date);
  const basePriceAfterDayDiscount = dayPricing.finalPrice;
  const dayDiscount = dayPricing.discountAmount;

  let couponDiscount = 0;
  let couponApplied = undefined;

  // Validate and apply coupon if provided
  if (couponCode && userEmail) {
    const couponResult = await validateCoupon(
      couponCode,
      bookingType,
      sport,
      date,
      '',
      basePriceAfterDayDiscount,
      userEmail
    );

    if (couponResult.isValid && couponResult.discount) {
      couponDiscount = couponResult.discount;
      couponApplied = couponCode;
    }
  }

  const finalPrice = Math.max(0, basePriceAfterDayDiscount - couponDiscount);

  return {
    basePrice,
    basePriceAfterDayDiscount,
    dayDiscount,
    couponDiscount,
    finalPrice,
    couponApplied,
  };
}
