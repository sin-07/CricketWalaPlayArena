# 🧪 Testing Guide - Day-Based Pricing System

## Quick Start Testing (5 minutes)

### Step 1: Navigate to Booking Page
```bash
# Visit the turf booking page in your browser
http://localhost:3000/turf-booking?type=match
```

### Step 2: Test Monday Booking (30% Discount)
1. Select a **Monday date** from the date picker
2. Select any **sport** (Cricket, Football, Badminton)
3. Select any **time slot** (e.g., 06:00-07:00)

**Expected Result:**
```
Display:
┌────────────────────────────────────┐
│ 🎉 30% discount on Mondays         │
│ Original: ₹1200                   │
│ Final Price: ₹840                 │
│ 💰 You save: ₹360                │
│ Badge: [-30%]                      │
└────────────────────────────────────┘
```

### Step 3: Test Friday Booking (10% Discount)
1. Select a **Friday date** from the date picker
2. Select any **sport**
3. Select any **time slot**

**Expected Result:**
```
Display:
┌────────────────────────────────────┐
│ ✨ 10% discount on Fridays         │
│ Original: ₹1200                   │
│ Final Price: ₹1080                │
│ 💰 You save: ₹120                 │
│ Badge: [-10%]                      │
└────────────────────────────────────┘
```

### Step 4: Complete a Booking
1. Fill in Name, Phone, Email
2. Click "Book Now"
3. Success modal appears

**Expected Result:**
```
Success Modal should show:
├─ ✅ Booking Confirmed!
├─ Booking Type: 🏏 Match
├─ Sport: Cricket (your selection)
├─ Date & Time: (your selection)
├─ Base Price: ₹1200
├─ Discount Applied: 30%
├─ Final Price: ₹840
├─ Savings: ₹360
└─ Booking Reference: CBK-XXXXXXX
```

### Step 5: Verify Database
```javascript
// In MongoDB, check the TurfBooking collection
db.turfbookings.findOne({ sport: "Cricket" })

// Should contain:
{
  bookingType: "match",
  sport: "Cricket",
  date: "2025-01-20",
  slot: "06:00-07:00",
  name: "Your Name",
  mobile: "9876543210",
  email: "your@email.com",
  basePrice: 1200,           ← New
  finalPrice: 840,           ← New
  discountPercentage: 30,    ← New
  status: "confirmed",
  createdAt: ISODate("2025-01-20T...")
}
```

---

## Comprehensive Testing (30 minutes)

### Test Case Matrix

| Day | Type | Expected Discount | Expected Price | Test Status |
|-----|------|-------------------|-----------------|-------------|
| Mon | Match | 30% | ₹840 | [ ] |
| Tue | Match | 30% | ₹840 | [ ] |
| Wed | Match | 30% | ₹840 | [ ] |
| Thu | Match | 30% | ₹840 | [ ] |
| Fri | Match | 10% | ₹1080 | [ ] |
| Sat | Match | 10% | ₹1080 | [ ] |
| Sun | Match | 10% | ₹1080 | [ ] |
| Any | Practice | 0% | ₹600 | [ ] |

### Test Case 1: Weekday Match Discount

**Setup:**
- Booking Type: Match
- Date: Monday (or any Mon-Thu)
- Sport: Cricket

**Test Steps:**
1. [ ] Pricing card displays
2. [ ] Shows "🎉 30% discount" message
3. [ ] Original price shows ₹1200 (strikethrough)
4. [ ] Final price shows ₹840
5. [ ] Savings shows ₹360
6. [ ] Discount badge shows "-30%"

**Verification:**
- [ ] All values correct
- [ ] UI formatting correct
- [ ] Mobile responsive

---

### Test Case 2: Weekend Match Discount

**Setup:**
- Booking Type: Match
- Date: Friday, Saturday, or Sunday
- Sport: Football

**Test Steps:**
1. [ ] Pricing card displays
2. [ ] Shows "✨ 10% discount" message
3. [ ] Original price shows ₹1200 (strikethrough)
4. [ ] Final price shows ₹1080
5. [ ] Savings shows ₹120
6. [ ] Discount badge shows "-10%"

**Verification:**
- [ ] All values correct
- [ ] Different from weekday message
- [ ] Mobile responsive

---

### Test Case 3: Practice Booking (No Discount)

**Setup:**
- Booking Type: Practice
- Date: Any day (test Tuesday)
- Sport: Badminton

**Test Steps:**
1. [ ] Pricing card displays
2. [ ] Shows "Regular pricing on Tuesdays"
3. [ ] No strikethrough on price
4. [ ] Final price shows ₹600
5. [ ] No savings shown
6. [ ] No discount badge

**Verification:**
- [ ] No discount applied
- [ ] Price always ₹600 regardless of day
- [ ] Clear indication of regular pricing

---

### Test Case 4: Date Change Updates Price

**Setup:**
- Start with Monday date

**Test Steps:**
1. [ ] Pricing shows ₹840 (30% off)
2. [ ] Change date to Friday
3. [ ] Pricing updates to ₹1080 (10% off)
4. [ ] Discount message changes
5. [ ] Savings amount updates
6. [ ] Badge updates to "-10%"

**Verification:**
- [ ] Real-time update works
- [ ] No page reload needed
- [ ] All values recalculate correctly

---

### Test Case 5: Complete Booking Flow

**Setup:**
- Date: Wednesday (30% discount)
- Sport: Cricket
- Type: Match

**Test Steps:**
1. [ ] Select date (Wednesday)
2. [ ] Verify pricing shows ₹840
3. [ ] Enter name: "Test User"
4. [ ] Enter mobile: "9876543210"
5. [ ] Enter email: "test@example.com"
6. [ ] Click "Book Now"
7. [ ] Success modal appears
8. [ ] Modal shows all booking details
9. [ ] Modal shows pricing breakdown
10. [ ] Modal auto-closes after ~4 seconds

**Verification:**
- [ ] No errors on submit
- [ ] Modal displays correctly
- [ ] All details shown
- [ ] Auto-close works

---

### Test Case 6: Database Persistence

**Setup:**
- Complete a booking on Tuesday (30% discount)

**Test Steps:**
1. [ ] Open MongoDB
2. [ ] Query TurfBooking collection
3. [ ] Find recent booking
4. [ ] Verify fields exist:
   - [ ] basePrice: 1200
   - [ ] finalPrice: 840
   - [ ] discountPercentage: 30
5. [ ] Verify values are correct
6. [ ] Verify timestamps present

**Verification:**
- [ ] All fields stored
- [ ] Correct values in database
- [ ] Can query by pricing fields

---

### Test Case 7: API Response

**Setup:**
- Use Postman or cURL

**Test Request:**
```bash
POST http://localhost:3000/api/turf-bookings/create
Content-Type: application/json

{
  "bookingType": "match",
  "sport": "Cricket",
  "date": "2025-01-20",
  "slot": "06:00-07:00",
  "name": "Test User",
  "mobile": "9876543210",
  "email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking confirmed successfully!",
  "data": {
    "bookingId": "...",
    "bookingType": "match",
    "sport": "Cricket",
    "date": "2025-01-20",
    "slot": "06:00-07:00",
    "name": "Test User",
    "email": "test@example.com",
    "basePrice": 1200,
    "finalPrice": 840,
    "discountPercentage": 30,
    "createdAt": "..."
  }
}
```

**Test Steps:**
1. [ ] Response status is 201
2. [ ] success field is true
3. [ ] All expected fields present
4. [ ] basePrice = 1200
5. [ ] finalPrice = 840
6. [ ] discountPercentage = 30

---

### Test Case 8: Mobile Responsiveness

**Setup:**
- Use Chrome DevTools device emulation

**Test Devices:**
- [ ] iPhone 12 (390x844)
- [ ] iPad Air (820x1180)
- [ ] Galaxy S10 (360x800)

**For Each Device:**
1. [ ] Pricing card is readable
2. [ ] Text not overlapping
3. [ ] Buttons are clickable
4. [ ] Success modal fits screen
5. [ ] All elements properly sized

**Verification:**
- [ ] No horizontal scroll needed
- [ ] Font sizes readable
- [ ] Spacing appropriate

---

## Edge Cases Testing

### Test Case 9: Leap Year Date
```
Date: February 29, 2025 (Friday - leap year)
Expected: 10% discount (Friday = weekend rate)
Verify: finalPrice = ₹1080
```

### Test Case 10: New Year Boundary
```
Date: January 1, 2026 (Wednesday)
Expected: 30% discount (Wed = weekday rate)
Verify: finalPrice = ₹840
```

### Test Case 11: Year End
```
Date: December 31, 2025 (Thursday)
Expected: 30% discount (Thu = weekday rate)
Verify: finalPrice = ₹840
```

### Test Case 12: Timezone Edge Cases
```
Test at 00:00:00 (midnight start)
Test at 23:59:59 (midnight end)
Verify date calculation correct
```

---

## Performance Testing

### Test Case 13: Price Calculation Speed
```javascript
// Should be instant (< 10ms)
const start = performance.now();
calculateFinalPrice('match', '2025-01-20');
const end = performance.now();
console.log(`Time: ${end - start}ms`); // Should be < 10ms
```

### Test Case 14: UI Responsiveness
- [ ] Pricing updates smoothly on date change
- [ ] No lag when typing values
- [ ] Success modal appears instantly
- [ ] No janky animations

---

## Regression Testing

### Test Case 15: Existing Features Still Work
- [ ] Booking form validation works
- [ ] Slot selection works
- [ ] Phone number validation works
- [ ] Email validation works
- [ ] Sports selection works
- [ ] Date picker works

---

## Accessibility Testing

### Test Case 16: Screen Reader Compatibility
- [ ] Pricing information is announced
- [ ] Discount message is clear
- [ ] Savings amount is announced
- [ ] Form labels are associated with inputs

### Test Case 17: Keyboard Navigation
- [ ] Can navigate entire form with Tab key
- [ ] Can submit form with Enter
- [ ] Can close modal with Escape
- [ ] All buttons are focusable

---

## Sign-Off

**Tested By**: ___________________
**Date**: ___________________
**Result**: [ ] PASS [ ] FAIL

**Issues Found**: 
```
1. 
2. 
3. 
```

**Approved For Production**: [ ] YES [ ] NO

---

**Notes:**
- All tests should PASS before deploying to production
- Document any failures and fix before redeploying
- Run full test suite on every code change

---

**Last Updated**: January 20, 2025
**Version**: 1.0.0
