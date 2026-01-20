# Day-Based Pricing & Discount System

## Overview

The turf booking system now includes intelligent day-based discounts for match bookings:

- **Monday to Thursday**: 30% discount on match bookings
- **Friday to Sunday**: 10% discount on match bookings
- **Practice Bookings**: Base pricing ₹600 (no discounts applied)

## Base Prices

| Booking Type | Base Price | Mon-Thu Discount | Fri-Sun Discount |
|--------------|-----------|------------------|------------------|
| Match        | ₹1200     | 30% → ₹840       | 10% → ₹1080      |
| Practice     | ₹600      | No discount      | No discount      |

## Discount Breakdown

### Monday to Thursday (30% off for Matches)
```
Base Price: ₹1200
Discount: 30% = ₹360
Final Price: ₹840
Savings: ₹360
```

### Friday to Sunday (10% off for Matches)
```
Base Price: ₹1200
Discount: 10% = ₹120
Final Price: ₹1080
Savings: ₹120
```

## Implementation

### 1. Pricing Utility (`lib/pricingUtils.ts`)

Core functions available:

- `calculateFinalPrice(bookingType, dateStr)` - Returns full pricing breakdown
- `getDiscountPercentage(dateStr)` - Returns discount % for a date
- `getDayOfWeek(dateStr)` - Gets day of week (0-6)
- `getDayName(dateStr)` - Returns day name (Monday, Tuesday, etc.)
- `formatPriceDisplay(bookingType, dateStr)` - Formatted price string for UI
- `getDiscountInfo(bookingType, dateStr)` - Human-readable discount message

### 2. Database Schema (`models/TurfBooking.ts`)

Added fields to track pricing:
```typescript
basePrice: number;           // Price before discount
finalPrice: number;          // Price after discount
discountPercentage: number;  // Discount applied (0-100)
```

### 3. Booking Creation API (`app/api/turf-bookings/create/route.ts`)

The API automatically:
1. Calculates the appropriate discount based on booking date
2. Computes the final price
3. Stores all pricing info in the database
4. Returns pricing details in the response

### 4. Frontend Display (`components/TurfBookingForm.tsx`)

Users see:
1. **Before Slot Selection**: Base price with booking type
2. **After Date Selection**: Pricing card showing:
   - Discount percentage badge (if applicable)
   - Original price (strikethrough if discounted)
   - Final price
   - Savings amount
3. **Success Modal**: Detailed pricing breakdown showing:
   - Original price
   - Discount applied
   - Final amount
   - Total savings

## User Experience

### Example 1: Match Booking on Monday
```
User books: Monday match
Display:
  🎉 30% discount on Mondays (Mon-Thu)
  Original: ₹1200
  Final Price: ₹840
  💰 You save: ₹360
  [Discount Badge: -30%]
```

### Example 2: Match Booking on Friday
```
User books: Friday match
Display:
  ✨ 10% discount on Fridays (Fri-Sun)
  Original: ₹1200
  Final Price: ₹1080
  💰 You save: ₹120
  [Discount Badge: -10%]
```

### Example 3: Practice Booking on Monday
```
User books: Monday practice
Display:
  Regular pricing on Mondays
  Final Price: ₹600
```

## Day Mapping

| Day | Number | Discount |
|-----|--------|----------|
| Sunday | 0 | 10% |
| Monday | 1 | 30% |
| Tuesday | 2 | 30% |
| Wednesday | 3 | 30% |
| Thursday | 4 | 30% |
| Friday | 5 | 10% |
| Saturday | 6 | 10% |

## Database Response Example

```json
{
  "success": true,
  "message": "Booking confirmed successfully!",
  "data": {
    "bookingId": "xyz123",
    "bookingType": "match",
    "sport": "Cricket",
    "date": "2025-01-20",
    "slot": "06:00-07:00",
    "name": "John Doe",
    "email": "john@example.com",
    "basePrice": 1200,
    "finalPrice": 840,
    "discountPercentage": 30,
    "createdAt": "2025-01-20T10:30:00Z"
  }
}
```

## Display Components

### Pricing Card (Before Confirmation)
Shows dynamically based on selected date:
- Color-coded (green for weekday discounts)
- Discount percentage badge
- Savings amount highlighted
- Original price with strikethrough

### Success Modal
Displays final pricing with:
- Original vs final comparison
- Discount percentage
- Savings amount
- Green highlighting for discounts

## Future Enhancements

1. **Seasonal Pricing**: Add peak/off-peak pricing multipliers
2. **Bundle Discounts**: Multi-slot booking discounts
3. **Loyalty Rewards**: Repeat customer discounts
4. **Promotion Codes**: Admin-managed promotional discounts
5. **Dynamic Pricing**: Algorithm-based pricing adjustments

## Testing

### Test Cases

```javascript
// Monday Match - 30% discount
calculateFinalPrice('match', '2025-01-20')
// Returns: { basePrice: 1200, finalPrice: 840, discountPercentage: 30, dayName: 'Monday' }

// Friday Match - 10% discount
calculateFinalPrice('match', '2025-01-24')
// Returns: { basePrice: 1200, finalPrice: 1080, discountPercentage: 10, dayName: 'Friday' }

// Monday Practice - no discount
calculateFinalPrice('practice', '2025-01-20')
// Returns: { basePrice: 600, finalPrice: 600, discountPercentage: 0, dayName: 'Monday' }
```

## Configuration Changes

If you need to modify pricing:

Edit `lib/pricingUtils.ts`:
```typescript
const BASE_PRICES = {
  match: 1200,     // Change this for match pricing
  practice: 600,   // Change this for practice pricing
};

// Modify discount percentages:
if (dayOfWeek >= 1 && dayOfWeek <= 4) {
  return 30;  // Change from 30% to desired percentage
}

if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
  return 10;  // Change from 10% to desired percentage
}
```

## Files Modified

1. **Created**: `lib/pricingUtils.ts` - Core pricing logic
2. **Updated**: `models/TurfBooking.ts` - Added price fields
3. **Updated**: `app/api/turf-bookings/create/route.ts` - Calculate and store prices
4. **Updated**: `components/TurfBookingForm.tsx` - Display pricing with discounts

---

**Last Updated**: January 20, 2025
**Feature Status**: ✅ Production Ready
