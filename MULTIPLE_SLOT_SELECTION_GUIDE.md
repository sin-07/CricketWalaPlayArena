# Multiple Slot Selection Feature - Implementation Guide

## Overview
The application has been updated to allow users to select multiple time slots in a single booking transaction, enhancing the user experience and enabling longer session bookings.

## What Changed

### 1. **SlotSelectorComponent** ([SlotSelectorComponent.tsx](components/SlotSelectorComponent.tsx))
- **Before**: Users could only select one time slot at a time
- **After**: Users can now select multiple time slots simultaneously
- **UI Changes**:
  - Selected slots show with green highlight and checkmark icon
  - Button displays count: "2 slots selected: 10:00-11:00, 11:00-12:00"
  - Dropdown stays open for multi-selection (doesn't close after each selection)
  - Click on a selected slot to deselect it

### 2. **TurfBookingForm** ([TurfBookingForm.tsx](components/TurfBookingForm.tsx))
- Form state updated to handle `slot` as an array of strings
- Pricing calculation now multiplies by number of selected slots
- Visual slot count indicator in pricing display
- Confirmation modal shows all selected slots

### 3. **Pricing Utilities** ([lib/pricingUtils.ts](lib/pricingUtils.ts))
- `calculateFinalPrice()` function now accepts optional `numSlots` parameter
- Pricing logic: `totalPrice = basePricePerSlot × numSlots × (1 - discount%)`
- Example: 
  - 2 practice slots = ₹250 × 2 = ₹500 (before discount)
  - With 30% Monday discount = ₹350

### 4. **Booking Validation** ([lib/bookingValidation.ts](lib/bookingValidation.ts))
- Updated `BookingFormData` interface to support both string and array for slots
- Validation checks for empty array and validates each slot individually

### 5. **API Backend** ([app/api/turf-bookings/create/route.ts](app/api/turf-bookings/create/route.ts))
- Accepts both single slot (string) and multiple slots (array) for backward compatibility
- Validates each slot individually for:
  - Frozen status
  - Existing bookings (prevents double-booking)
- Stores slots as comma-separated string in database: "10:00-11:00, 11:00-12:00, 12:00-13:00"
- Pricing calculation includes all selected slots

## How It Works

### User Flow:
1. User selects date and sport
2. Available time slots are displayed
3. User clicks on multiple slots (e.g., 10:00-11:00, 11:00-12:00, 12:00-13:00)
4. Selected slots are highlighted in green with checkmarks
5. Pricing updates automatically: "Selected Slots: 3 slots"
6. User fills in details and confirms booking
7. Single booking is created with all slots reserved

### Database Storage:
```javascript
{
  date: "2026-01-25",
  slot: "10:00-11:00, 11:00-12:00, 12:00-13:00", // Comma-separated string
  basePrice: 750,  // ₹250 × 3 slots
  finalPrice: 525, // After 30% Monday discount
  // ... other fields
}
```

### Pricing Example (Practice Session - Monday):
- Base price per slot: ₹250
- Selected slots: 3
- Total base: ₹250 × 3 = ₹750
- Monday discount (30%): -₹225
- Final price: ₹525
- Booking charge: ₹200
- **Total to pay: ₹725**

## Benefits

1. **Convenience**: Users can book multiple consecutive hours in one transaction
2. **Better Pricing**: Clear breakdown showing per-slot pricing
3. **Flexibility**: Still supports single slot selection (backward compatible)
4. **Accurate Billing**: Automatic calculation based on number of slots
5. **Prevention**: Still prevents double-booking on any individual slot

## Testing Recommendations

1. **Single Slot**: Verify existing single-slot booking still works
2. **Multiple Slots**: Select 2-3 slots and verify pricing calculation
3. **Deselection**: Click on selected slot to deselect it
4. **Validation**: Try booking already-booked slots
5. **Edge Cases**: 
   - Select slots, change date (slots should reset)
   - Select slots, change sport (slots should reset)
   - Apply coupon with multiple slots
6. **Email/PDF**: Verify confirmation shows all selected slots correctly

## Current Pricing (as per .env.local)
- Test mode enabled: `NEXT_PUBLIC_TEST_PRICE_PER_HOUR=1`
- When testing, price per slot will be ₹1 instead of actual prices

## Notes
- Slots are stored as comma-separated strings for backward compatibility
- No database schema changes required
- Existing bookings remain compatible
- API handles both old format (string) and new format (array)
