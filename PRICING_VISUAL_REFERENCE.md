# Pricing System - Visual Reference & Examples

## 💡 How The System Works (Visual Flow)

```
┌─────────────────────────────────────────────────────────────┐
│         USER SELECTS DATE IN BOOKING FORM                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Get Day of Week from Date  │
        │ e.g., Monday = Day 1       │
        └────────────────┬───────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────┐
        │ Check Discount Rules:                      │
        │ Mon-Thu (1-4)? → 30% discount             │
        │ Fri-Sun (5,6,0)? → 10% discount          │
        └────────────────┬───────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ Calculate Final Price:                    │
        │ Final = Base × (1 - Discount/100)        │
        └────────────────┬─────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │ Display to User with Savings Info        │
        └──────────────────────────────────────────┘
```

---

## 📅 Real-World Examples

### Example 1: Monday Match Booking
```
User Input:
  Date: Monday, January 20, 2025
  Booking Type: Match
  Sport: Cricket

System Calculation:
  Step 1: Day = Monday (1)
  Step 2: Check: Is Mon-Thu? YES → 30% discount
  Step 3: Base = ₹1200
  Step 4: Discount = 1200 × 0.30 = ₹360
  Step 5: Final = 1200 - 360 = ₹840

Display to User:
  ┌──────────────────────────────┐
  │ 🎉 30% discount on Mondays   │
  │                              │
  │ Original: ₹1200             │
  │ Final Price: ₹840           │
  │ 💰 You save: ₹360           │
  │ [-30%]                       │
  └──────────────────────────────┘
```

### Example 2: Saturday Match Booking
```
User Input:
  Date: Saturday, January 18, 2025
  Booking Type: Match
  Sport: Football

System Calculation:
  Step 1: Day = Saturday (6)
  Step 2: Check: Is Fri-Sun? YES → 10% discount
  Step 3: Base = ₹1200
  Step 4: Discount = 1200 × 0.10 = ₹120
  Step 5: Final = 1200 - 120 = ₹1080

Display to User:
  ┌──────────────────────────────┐
  │ ✨ 10% discount on Saturdays │
  │                              │
  │ Original: ₹1200             │
  │ Final Price: ₹1080          │
  │ 💰 You save: ₹120           │
  │ [-10%]                       │
  └──────────────────────────────┘
```

### Example 3: Tuesday Practice Booking
```
User Input:
  Date: Tuesday, January 21, 2025
  Booking Type: Practice
  Sport: Badminton

System Calculation:
  Step 1: Day = Tuesday (2)
  Step 2: Check booking type: Practice
  Step 3: Base = ₹600
  Step 4: Discount = 0% (no discounts for practice)
  Step 5: Final = ₹600

Display to User:
  ┌──────────────────────────────┐
  │ Regular pricing on Tuesdays  │
  │                              │
  │ Price: ₹600                  │
  └──────────────────────────────┘
```

---

## 🎯 Price Calculation Formula

```
MATCH BOOKINGS:
  IF (day is Monday-Thursday) THEN
    discount = 30%
    final_price = 1200 × 0.70 = ₹840
  ELSE IF (day is Friday-Sunday) THEN
    discount = 10%
    final_price = 1200 × 0.90 = ₹1080
  END

PRACTICE BOOKINGS:
  final_price = ₹600 (always)
  discount = 0%
```

---

## 💰 Earnings Comparison

### Cost Impact Analysis (Monthly)

**Assuming 30 bookings per month:**

```
Scenario A: Without Discounts
├─ 30 bookings × ₹1200 = ₹36,000
└─ Total Revenue: ₹36,000

Scenario B: With Smart Discounts
├─ Weekdays (16 bookings): 16 × ₹840 = ₹13,440
├─ Weekends (14 bookings): 14 × ₹1080 = ₹15,120
├─ Total Revenue: ₹28,560
└─ Difference: -₹7,440 (-20.7%)

Scenario B Benefit:
• Attracts more weekday bookings
• Increases customer loyalty
• Promotes off-peak utilization
• Better cash flow management
```

---

## 🗓️ Quick Day Reference

```
Calendar Layout (7 Days):

┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   SUNDAY    │   MONDAY    │  TUESDAY    │ WEDNESDAY   │ THURSDAY    │   FRIDAY    │ SATURDAY    │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│    10% OFF  │   30% OFF   │   30% OFF   │   30% OFF   │   30% OFF   │   10% OFF   │   10% OFF   │
│             │             │             │             │             │             │             │
│  ₹1080      │   ₹840      │   ₹840      │   ₹840      │   ₹840      │   ₹1080     │   ₹1080     │
│  (Save ₹120)│ (Save ₹360) │ (Save ₹360) │ (Save ₹360) │ (Save ₹360) │ (Save ₹120) │ (Save ₹120) │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📊 Data Flow

```
FRONTEND (React)
├─ User selects date
├─ TurfBookingForm imports calculateFinalPrice()
├─ Real-time price display
└─ User sees discount info

         ▼

API LAYER
├─ POST /api/turf-bookings/create
├─ Import pricingUtils
├─ Calculate final price
├─ Validate booking
└─ Save to database

         ▼

DATABASE (MongoDB)
├─ Store TurfBooking document
├─ Include: basePrice, finalPrice, discountPercentage
├─ Record created timestamp
└─ Data available for analytics

         ▼

RESPONSE TO USER
├─ Confirmation modal
├─ Show pricing breakdown
├─ Email confirmation
└─ Success message
```

---

## 🔄 API Request/Response Example

### Request
```javascript
POST /api/turf-bookings/create
Content-Type: application/json

{
  "bookingType": "match",
  "sport": "Cricket",
  "date": "2025-01-20",           // Monday
  "slot": "06:00-07:00",
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com"
}
```

### Response (Success)
```javascript
{
  "success": true,
  "message": "Booking confirmed successfully!",
  "data": {
    "bookingId": "507f1f77bcf86cd799439011",
    "bookingType": "match",
    "sport": "Cricket",
    "date": "2025-01-20",
    "slot": "06:00-07:00",
    "name": "John Doe",
    "email": "john@example.com",
    "basePrice": 1200,              // ← New field
    "finalPrice": 840,              // ← New field
    "discountPercentage": 30,       // ← New field
    "createdAt": "2025-01-20T10:30:00Z"
  }
}
```

---

## 🛠️ Code Snippets

### Using Pricing Utils in Your Code

```typescript
import { calculateFinalPrice, getDiscountInfo } from '@/lib/pricingUtils';

// Get full pricing info
const pricing = calculateFinalPrice('match', '2025-01-20');
console.log(pricing);
// {
//   basePrice: 1200,
//   discountPercentage: 30,
//   discountAmount: 360,
//   finalPrice: 840,
//   dayName: 'Monday'
// }

// Get user-friendly message
const message = getDiscountInfo('match', '2025-01-20');
console.log(message);
// "🎉 30% discount on Mondays (Mon-Thu)"
```

---

## 📱 Mobile UI Preview

### Booking Form on Mobile

```
╔════════════════════════════════╗
║     TURF BOOKING FORM          ║
╠════════════════════════════════╣
║                                ║
║ 🏏 Match Booking               ║
║                                ║
║ [Select Sport ▼]               ║
║ [Select Date  ▼]               ║
║ [Select Slot  ▼]               ║
║                                ║
║ ┌─────────────────────────────┐ ║
║ │ 🎉 30% off on Mondays       │ ║
║ │ Original: ₹1200            │ ║
║ │ Final: ₹840                 │ ║
║ │ Save: ₹360     [-30%]       │ ║
║ └─────────────────────────────┘ ║
║                                ║
║ [Name input]                   ║
║ [Phone input]                  ║
║ [Email input]                  ║
║                                ║
║ [BOOK NOW BUTTON]              ║
║                                ║
╚════════════════════════════════╝
```

### Success Modal on Mobile

```
╔════════════════════════════════╗
║   ✅ Booking Confirmed!        ║
╠════════════════════════════════╣
║                                ║
║ 🏏 Match Booking               ║
║ Cricket - Monday               ║
║ 06:00-07:00                    ║
║ Ref: CBK-20250120-ABC12        ║
║                                ║
║ ┌─────────────────────────────┐ ║
║ │ Original: ₹1200             │ ║
║ │ 🎉 Discount: -30%           │ ║
║ │ Final: ₹840                 │ ║
║ │ 💰 Saved: ₹360              │ ║
║ └─────────────────────────────┘ ║
║                                ║
║ [DONE BUTTON]                  ║
║                                ║
╚════════════════════════════════╝
```

---

## ✅ Testing Scenarios

### Scenario 1: Weekday Match
```
Input: Monday Match
Expected: 30% discount shown
Verify: Final price = ₹840
```

### Scenario 2: Weekend Match
```
Input: Saturday Match
Expected: 10% discount shown
Verify: Final price = ₹1080
```

### Scenario 3: Practice Booking
```
Input: Monday Practice
Expected: No discount shown
Verify: Final price = ₹600
```

### Scenario 4: Price Persistence
```
Action: Create booking on Wednesday
Verify: Database stores basePrice=1200, finalPrice=840, discountPercentage=30
```

---

**Version**: 1.0
**Last Updated**: January 20, 2025
**Status**: ✅ Production Ready
