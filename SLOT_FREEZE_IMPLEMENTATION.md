# Admin Slot Freeze Feature - Complete Implementation Guide

## 📋 Overview

This document describes the complete implementation of the Admin Slot Freeze feature for your Next.js turf booking website. This feature allows admins to freeze specific slots to prevent users from booking them.

---

## 🎯 Features Implemented

### 1. **Admin Capabilities**
- ✅ Freeze slots for any date, sport, and booking type (match/practice)
- ✅ View all frozen slots with filtering options
- ✅ Unfreeze previously frozen slots
- ✅ Admin-only access (requires authentication)
- ✅ Track which admin froze a slot and when

### 2. **User Experience**
- ✅ Frozen slots are completely hidden from booking forms
- ✅ Frozen slots don't appear in available slots dropdown
- ✅ Backend validation prevents booking frozen slots (security)
- ✅ Informative messages when slots are frozen

### 3. **Backend Security**
- ✅ Admin authentication required for all freeze/unfreeze operations
- ✅ Backend validation prevents users from booking frozen slots
- ✅ Double-booking prevention still works
- ✅ Proper error handling and status codes

---

## 📁 Files Created/Modified

### **New Files Created:**

1. **`models/Slot.ts`** - MongoDB Slot schema
   - Stores frozen slot information
   - Fields: bookingType, sport, date, slot, isFrozen, frozenBy, frozenAt
   - Compound indexes for fast queries

2. **`app/api/admin/slots/freeze/route.ts`** - Freeze slot API
   - POST endpoint to freeze a slot
   - Requires admin authentication
   - Validates all input parameters

3. **`app/api/admin/slots/unfreeze/route.ts`** - Unfreeze slot API
   - POST endpoint to unfreeze a slot
   - Requires admin authentication
   - Prevents unfreezing non-frozen slots

4. **`app/api/admin/slots/get-frozen/route.ts`** - Get frozen slots API
   - GET endpoint to fetch frozen slots
   - Supports filtering by bookingType, sport, date
   - Admin-only access

5. **`lib/frozenSlotValidation.ts`** - Validation utilities
   - `validateSlotNotFrozen()` - Check if a slot is frozen
   - `checkMultipleFrozenSlots()` - Check multiple slots

6. **`components/AdminSlotFreezeManager.tsx`** - Admin UI component
   - Comprehensive admin interface
   - Freeze slot form
   - View/filter frozen slots
   - Unfreeze functionality
   - Real-time updates

7. **`app/admin/slots/page.tsx`** - Admin page route
   - Admin-only page for slot management
   - Authentication checks
   - Redirects unauthorized users to login

8. **`hooks/useFrozenSlots.ts`** - React hook for slot management
   - `freezeSlot()` - Freeze a slot
   - `unfreezeSlot()` - Unfreeze a slot
   - `getFrozenSlots()` - Fetch frozen slots
   - Error handling and loading states

### **Modified Files:**

1. **`app/api/turf-bookings/slots/route.ts`** - Updated slots API
   - Now filters out frozen slots from available slots
   - Returns `isFrozen` flag for each slot
   - Returns `frozenCount` in response

2. **`app/api/turf-bookings/create/route.ts`** - Updated booking creation
   - Added frozen slot validation before booking
   - Returns 403 if slot is frozen
   - Improved error messages

3. **`components/SlotSelectorComponent.tsx`** - Updated slot selector
   - Now accepts `bookingType` prop
   - Passes booking type to API
   - Shows frozen slot count
   - Improved error handling

4. **`components/TurfBookingForm.tsx`** - Updated booking form
   - Passes `bookingType` to SlotSelector
   - No other changes needed

---

## 🔧 API Endpoints

### **1. Freeze a Slot**
```
POST /api/admin/slots/freeze
Content-Type: application/json
Authorization: Admin token required

Request Body:
{
  "bookingType": "match" | "practice",
  "sport": "Cricket" | "Football" | "Badminton",
  "date": "YYYY-MM-DD",
  "slot": "HH:MM-HH:MM" (e.g., "06:00-07:00")
}

Response (Success - 200):
{
  "success": true,
  "message": "Slot 06:00-07:00 for Cricket on 2024-01-25 has been frozen",
  "data": { /* Slot document */ }
}

Response (Unauthorized - 401):
{
  "success": false,
  "message": "Unauthorized: Admin token not found"
}

Response (Validation Error - 400):
{
  "success": false,
  "message": "Missing required fields: bookingType, sport, date, slot"
}
```

### **2. Unfreeze a Slot**
```
POST /api/admin/slots/unfreeze
Content-Type: application/json
Authorization: Admin token required

Request Body:
{
  "bookingType": "match" | "practice",
  "sport": "Cricket" | "Football" | "Badminton",
  "date": "YYYY-MM-DD",
  "slot": "HH:MM-HH:MM"
}

Response (Success - 200):
{
  "success": true,
  "message": "Slot 06:00-07:00 for Cricket on 2024-01-25 has been unfrozen",
  "data": { /* Slot document */ }
}

Response (Not Found - 404):
{
  "success": false,
  "message": "Slot not found"
}
```

### **3. Get Frozen Slots**
```
GET /api/admin/slots/get-frozen?bookingType=match&sport=Cricket&date=2024-01-25
Authorization: Admin token required

Response (Success - 200):
{
  "success": true,
  "data": [ /* Array of frozen slots */ ],
  "count": 5
}
```

### **4. Get Available Slots (Updated)**
```
GET /api/turf-bookings/slots?date=YYYY-MM-DD&sport=Cricket&bookingType=match

Response (Success - 200):
{
  "success": true,
  "data": {
    "date": "2024-01-25",
    "sport": "Cricket",
    "bookingType": "match",
    "slots": [
      {
        "slot": "06:00-07:00",
        "available": true,
        "isBooked": false,
        "isFrozen": false
      },
      {
        "slot": "07:00-08:00",
        "available": false,
        "isBooked": false,
        "isFrozen": true
      }
    ],
    "totalSlots": 24,
    "bookedCount": 5,
    "frozenCount": 2,
    "availableCount": 17
  }
}
```

### **5. Create Booking (Updated)**
```
POST /api/turf-bookings/create
Content-Type: application/json

Request Body:
{
  "bookingType": "match" | "practice",
  "sport": "Cricket" | "Football" | "Badminton",
  "date": "YYYY-MM-DD",
  "slot": "HH:MM-HH:MM",
  "name": "Customer Name",
  "mobile": "9876543210",
  "email": "user@example.com"
}

Response (Frozen Slot - 403):
{
  "success": false,
  "message": "This slot (06:00-07:00) for Cricket on 2024-01-25 is currently frozen and unavailable for booking.",
  "field": "slot"
}

Response (Already Booked - 409):
{
  "success": false,
  "message": "This slot is already booked for Cricket on 2024-01-25",
  "field": "slot"
}

Response (Success - 201):
{
  "success": true,
  "message": "Booking confirmed successfully!",
  "data": { /* Booking details */ }
}
```

---

## 🗄️ Database Schema

### **Slot Collection**
```typescript
{
  _id: ObjectId,
  bookingType: 'match' | 'practice',      // Required
  sport: 'Cricket' | 'Football' | 'Badminton',  // Required
  date: '2024-01-25',                     // YYYY-MM-DD format, Required
  slot: '06:00-07:00',                    // Required
  isFrozen: boolean,                      // Default: false, Indexed
  frozenBy: string,                       // Admin ID who froze it
  frozenAt: Date,                         // When it was frozen
  createdAt: Date,                        // Auto-created
  updatedAt: Date                         // Auto-updated
}

Indexes:
- { date: 1, bookingType: 1, sport: 1, isFrozen: 1 }
- { date: 1, slot: 1, sport: 1, bookingType: 1 } (unique, sparse)
- { isFrozen: 1 }
```

---

## 🛡️ Security Features

1. **Admin Authentication Required**
   - All freeze/unfreeze operations require valid admin token
   - Token validation on every request
   - Credentials included in requests

2. **Backend Validation**
   - Frozen slots cannot be booked via backend API
   - Returns 403 Forbidden if slot is frozen
   - Prevents direct API manipulation

3. **Input Validation**
   - All parameters validated (date format, sport, booking type)
   - Invalid inputs return 400 Bad Request
   - Type checking on all fields

4. **Authorization Checks**
   - Slots API only accessible after admin login
   - Page redirect for unauthorized access
   - Session-based authentication

---

## 📖 Usage Guide

### **For Admins:**

1. **Navigate to Slot Management**
   - Go to `/admin/slots` page
   - Must be logged in as admin
   - If not logged in, redirected to login page

2. **Freeze a Slot**
   - Select booking type (Match/Practice)
   - Choose sport (Cricket/Football/Badminton)
   - Pick a date (today or future)
   - Select a time slot
   - Click "Freeze Slot" button
   - Confirmation message appears

3. **View Frozen Slots**
   - Right panel shows all frozen slots
   - Filter by booking type, sport, or date
   - Click "Unfreeze" to remove the freeze
   - Confirmation dialog appears before unfreezing

### **For Users:**

1. **Booking Flow (Unchanged)**
   - Fill out booking form as usual
   - Select booking type, sport, date
   - Choose from available slots dropdown
   - Frozen slots automatically hidden
   - Cannot manually enter frozen slot
   - Backend validates before confirming booking

---

## 🚀 Integration Checklist

- [x] Create Slot model and MongoDB collection
- [x] Add freeze/unfreeze API endpoints
- [x] Add admin authentication to APIs
- [x] Update slots API to filter frozen slots
- [x] Update booking creation to validate frozen slots
- [x] Create admin UI component
- [x] Add admin page route
- [x] Update slot selector component
- [x] Create custom hook for slot management
- [x] Add proper error handling
- [x] Add type definitions
- [x] Test all APIs with authentication
- [x] Test all error scenarios
- [x] Document all endpoints

---

## 🧪 Testing Guide

### **Test 1: Admin Can Freeze Slots**
1. Login as admin
2. Go to `/admin/slots`
3. Fill freeze form
4. Click "Freeze Slot"
5. Verify success message
6. Check slot appears in frozen list

### **Test 2: Users Can't See Frozen Slots**
1. Go to booking page
2. Select same date/sport/bookingType as frozen slot
3. Check that frozen slot doesn't appear in dropdown
4. Verify slot count is reduced

### **Test 3: Users Can't Book Frozen Slots**
1. Try to book normally (should fail at dropdown)
2. If trying to bypass, API should return 403
3. Verify error message

### **Test 4: Admin Can Unfreeze Slots**
1. Go to `/admin/slots`
2. Click "Unfreeze" on a frozen slot
3. Confirm in dialog
4. Verify slot is removed from frozen list
5. Verify slot appears in user booking form

### **Test 5: Unauthorized Access Blocked**
1. Try to access `/admin/slots` without login
2. Should redirect to `/admin/login`
3. Try to call freeze API without token
4. Should return 401 Unauthorized

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AdminSlotFreezeManager Component                     │   │
│  │ - Form to freeze slots                              │   │
│  │ - Display frozen slots                              │   │
│  │ - Filter frozen slots                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        ↓                                              ↑
        │ POST /api/admin/slots/freeze                │
        │ POST /api/admin/slots/unfreeze              │
        │ GET /api/admin/slots/get-frozen             │
        │                                             │
        ↓                                             │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND APIs                             │
│  - Validate admin auth                                      │
│  - CRUD frozen slots in DB                                  │
│  - Return results                                           │
└─────────────────────────────────────────────────────────────┘
        ↓                                             ↑
        ↓ Store/Retrieve                             │
        ↓                                             │
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Slot Collection                    │
│  - Stores frozen slot records                               │
│  - Indexes for fast queries                                 │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    USER BOOKING PAGE                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ TurfBookingForm Component                            │   │
│  │ - Select sport, date, etc.                           │   │
│  │ - SlotSelector fetches available slots               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        ↓                                              ↑
        │ GET /api/turf-bookings/slots                │
        │ (includes bookingType, date, sport)         │
        │                                             │
        ↓                                             │
┌─────────────────────────────────────────────────────────────┐
│             GET Available Slots API                         │
│  - Fetch booked slots from TurfBooking collection           │
│  - Fetch frozen slots from Slot collection                  │
│  - Return only available (not booked, not frozen)           │
└─────────────────────────────────────────────────────────────┘
        ↓                                             ↑
        ↓ Query                                      │
        ↓                                             ↑
┌─────────────────────────────────────────────────────────────┐
│  MongoDB (TurfBooking + Slot Collections)                   │
└─────────────────────────────────────────────────────────────┘


When User Submits Booking:
        ↓
┌─────────────────────────────────────────────────────────────┐
│          POST /api/turf-bookings/create                     │
│  1. Validate form data                                      │
│  2. Check if slot is frozen (NEW)                           │
│     ↓                                                        │
│     If frozen → Return 403 Forbidden                        │
│  3. Check for double booking                               │
│  4. Create booking in database                             │
│  5. Return success or error                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Error Handling

### **Common Error Scenarios:**

| Scenario | Status | Message |
|----------|--------|---------|
| Admin not logged in | 401 | "Unauthorized: Admin token not found" |
| Invalid booking type | 400 | "Invalid booking type. Must be 'match' or 'practice'" |
| Invalid sport | 400 | "Invalid sport. Must be 'Cricket', 'Football', or 'Badminton'" |
| Invalid date format | 400 | "Invalid date format. Must be YYYY-MM-DD" |
| Slot already frozen | 400 | "Slot is already frozen" |
| Slot not found (unfreeze) | 404 | "Slot not found" |
| Slot not frozen (unfreeze) | 400 | "Slot is not frozen" |
| User tries to book frozen slot | 403 | "This slot (...) is currently frozen and unavailable for booking." |
| Database error | 500 | "Failed to freeze/unfreeze slot" |

---

## 🎓 Code Examples

### **Freezing a Slot Programmatically:**
```typescript
import { useFrozenSlots } from '@/hooks/useFrozenSlots';

function MyComponent() {
  const { freezeSlot, loading, error } = useFrozenSlots();

  const handleFreeze = async () => {
    const result = await freezeSlot('match', 'Cricket', '2024-01-25', '06:00-07:00');
    if (result.success) {
      console.log('Slot frozen:', result.data);
    } else {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleFreeze}>Freeze</button>;
}
```

### **Fetching Frozen Slots:**
```typescript
const { getFrozenSlots } = useFrozenSlots();

const result = await getFrozenSlots('match', 'Cricket', '2024-01-25');
console.log(result.data); // Array of frozen slots
```

### **Direct API Call:**
```typescript
const response = await fetch('/api/admin/slots/freeze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingType: 'match',
    sport: 'Cricket',
    date: '2024-01-25',
    slot: '06:00-07:00',
  }),
  credentials: 'include',
});

const data = await response.json();
```

---

## 📝 Notes

1. **Backward Compatibility**: All changes are backward compatible. Existing bookings and slots continue to work.

2. **Performance**: Indexes on Slot collection ensure fast queries even with many frozen slots.

3. **Admin Area**: Slots management page is at `/admin/slots` and requires admin authentication.

4. **Data Persistence**: Frozen slots are permanently stored in MongoDB until unfrozen.

5. **Audit Trail**: Each frozen slot records who froze it and when via `frozenBy` and `frozenAt` fields.

---

## 🎯 Summary

The Admin Slot Freeze feature is now fully implemented with:
- ✅ Complete backend validation
- ✅ Secure admin-only APIs
- ✅ Seamless frontend integration
- ✅ Production-ready error handling
- ✅ User-friendly admin interface
- ✅ Comprehensive documentation

All requirements have been fulfilled and the system is ready for deployment!
