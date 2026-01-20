// ========================================
// ADMIN SLOT FREEZE - DEVELOPER EXAMPLES
// ========================================

// =========================================
// 1. USING THE useFrozenSlots HOOK
// =========================================

import { useFrozenSlots } from '@/hooks/useFrozenSlots';

// Example 1: Freeze a slot
export function FreezeSlotExample() {
  const { freezeSlot, loading, error } = useFrozenSlots();

  const handleFreeze = async () => {
    const result = await freezeSlot(
      'match',                    // bookingType
      'Cricket',                  // sport
      '2024-01-25',               // date
      '06:00-07:00'               // slot
    );

    if (result.success) {
      console.log('SUCCESS: Slot frozen successfully!', result.data);
      // Show success toast to user
    } else {
      console.error('ERROR:', error);
      // Show error toast to user
    }
  };

  return (
    <button onClick={handleFreeze} disabled={loading}>
      {loading ? 'Freezing...' : 'Freeze Slot'}
    </button>
  );
}


// Example 2: Unfreeze a slot
export function UnfreezeSlotExample() {
  const { unfreezeSlot, loading, error } = useFrozenSlots();

  const handleUnfreeze = async () => {
    const result = await unfreezeSlot(
      'match',
      'Cricket',
      '2024-01-25',
      '06:00-07:00'
    );

    if (result.success) {
      console.log('SUCCESS: Slot unfrozen!');
    }
  };

  return <button onClick={handleUnfreeze}>Unfreeze</button>;
}


// Example 3: Get all frozen slots
export function GetFrozenSlotsExample() {
  const { getFrozenSlots, loading, error } = useFrozenSlots();
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchFrozen = async () => {
      // Get frozen slots - can pass optional filters
      const result = await getFrozenSlots(
        'match',          // bookingType (optional)
        'Cricket',        // sport (optional)
        '2024-01-25'      // date (optional)
      );

      if (result.success) {
        setSlots(result.data);
        console.log(`Found ${result.data.length} frozen slots`);
      }
    };

    fetchFrozen();
  }, [getFrozenSlots]);

  return (
    <div>
      {slots.map(slot => (
        <div key={slot._id}>
          {slot.sport} - {slot.slot} on {slot.date}
          <p>Frozen by: {slot.frozenBy}</p>
          <p>At: {new Date(slot.frozenAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}


// =========================================
// 2. DIRECT API CALLS
// =========================================

// Example 1: Freeze slot via direct fetch
export async function freezeSlotAPI() {
  try {
    const response = await fetch('/api/admin/slots/freeze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingType: 'practice',
        sport: 'Badminton',
        date: '2024-01-26',
        slot: '07:00-08:00',
      }),
      credentials: 'include', // Important: send cookies for auth
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('SUCCESS:', data.message);
      return { success: true, data: data.data };
    } else {
      console.error('ERROR:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}


// Example 2: Unfreeze slot via direct fetch
export async function unfreezeSlotAPI() {
  try {
    const response = await fetch('/api/admin/slots/unfreeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingType: 'practice',
        sport: 'Badminton',
        date: '2024-01-26',
        slot: '07:00-08:00',
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('SUCCESS: Unfrozen:', data.message);
      return { success: true };
    } else {
      console.error('ERROR:', data.message);
      return { success: false };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false };
  }
}


// Example 3: Get frozen slots via direct fetch
export async function getFrozenSlotsAPI(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.bookingType) params.append('bookingType', filters.bookingType);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.date) params.append('date', filters.date);

    const response = await fetch(
      `/api/admin/slots/get-frozen?${params.toString()}`,
      {
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.count} frozen slots`);
      return { success: true, slots: data.data, count: data.count };
    } else {
      console.error('ERROR:', data.message);
      return { success: false, slots: [] };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, slots: [] };
  }
}


// =========================================
// 3. USING VALIDATION FUNCTIONS
// =========================================

import { validateSlotNotFrozen } from '@/lib/frozenSlotValidation';

// Example 1: Check if a slot is frozen before booking
export async function checkSlotBeforeBooking() {
  const validation = await validateSlotNotFrozen(
    'match',
    'Cricket',
    '2024-01-25',
    '06:00-07:00'
  );

  if (!validation.isValid) {
    console.log('ERROR: Cannot book:', validation.message);
    // Show error to user
  } else {
    console.log('SUCCESS: Slot is available, proceed with booking');
    // Allow booking
  }
}

// Example 2: Check multiple slots
import { checkMultipleFrozenSlots } from '@/lib/frozenSlotValidation';

export async function checkMultipleSlotsExample() {
  const slotsToCheck = [
    { bookingType: 'match', sport: 'Cricket', date: '2024-01-25', slot: '06:00-07:00' },
    { bookingType: 'match', sport: 'Cricket', date: '2024-01-25', slot: '07:00-08:00' },
  ];

  const frozenSlots = await checkMultipleFrozenSlots(slotsToCheck);

  if (frozenSlots.length > 0) {
    console.log('ERROR: Some slots are frozen:', frozenSlots);
  } else {
    console.log('SUCCESS: All slots are available');
  }
}


// =========================================
// 4. DATABASE QUERIES (BACKEND)
// =========================================

import Slot from '@/models/Slot';

// Example 1: Find all frozen slots
export async function findAllFrozenSlots() {
  const frozen = await Slot.find({ isFrozen: true });
  return frozen;
}

// Example 2: Find frozen slots for a specific date
export async function findFrozenSlotsForDate(date) {
  const frozen = await Slot.find({ isFrozen: true, date });
  return frozen;
}

// Example 3: Create/update a frozen slot
export async function createFrozenSlot(data) {
  const slot = new Slot({
    bookingType: data.bookingType,
    sport: data.sport,
    date: data.date,
    slot: data.slot,
    isFrozen: true,
    frozenBy: data.adminId,
    frozenAt: new Date(),
  });

  await slot.save();
  return slot;
}

// Example 4: Unfreeze a slot
export async function unfreezeSlot(data) {
  const updated = await Slot.findOneAndUpdate(
    {
      bookingType: data.bookingType,
      sport: data.sport,
      date: data.date,
      slot: data.slot,
    },
    {
      $set: {
        isFrozen: false,
        frozenBy: null,
        frozenAt: null,
      },
    },
    { new: true }
  );

  return updated;
}


// =========================================
// 5. REAL-WORLD USAGE EXAMPLES
// =========================================

// Example 1: Custom hook for admin actions
import { useState } from 'react';
import { useFrozenSlots } from '@/hooks/useFrozenSlots';

export function useSlotManagement() {
  const { freezeSlot, unfreezeSlot, getFrozenSlots } = useFrozenSlots();
  const [selectedSlots, setSelectedSlots] = useState([]);

  const bulkFreeze = async (slots) => {
    const results = [];
    for (const slot of slots) {
      const result = await freezeSlot(
        slot.bookingType,
        slot.sport,
        slot.date,
        slot.slot
      );
      results.push(result);
    }
    return results;
  };

  return { freezeSlot, unfreezeSlot, getFrozenSlots, bulkFreeze };
}


// Example 2: Error handling with toast notifications
export async function freezeSlotWithNotification(slot) {
  try {
    const response = await fetch('/api/admin/slots/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific errors
      switch (response.status) {
        case 401:
          showToast('Please log in as admin', 'error');
          break;
        case 400:
          showToast('Invalid slot information', 'error');
          break;
        case 409:
          showToast('Slot is already frozen', 'warning');
          break;
        default:
          showToast(data.message || 'Failed to freeze slot', 'error');
      }
      return false;
    }

    showToast('Slot frozen successfully!', 'success');
    return true;
  } catch (error) {
    showToast('Network error occurred', 'error');
    return false;
  }
}

// Helper function
function showToast(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // Use your toast library here
}


// Example 3: Filtering available slots in component
export function AvailableSlotsList({ date, sport, bookingType }) {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      const response = await fetch(
        `/api/turf-bookings/slots?date=${date}&sport=${sport}&bookingType=${bookingType}`
      );
      const data = await response.json();

      if (data.success) {
        const available = data.data.slots.filter(s => s.available);
        const frozen = data.data.slots.filter(s => s.isFrozen);
        const booked = data.data.slots.filter(s => s.isBooked);

        console.log(`Available: ${available.length}, Frozen: ${frozen.length}, Booked: ${booked.length}`);

        setSlots(available);
      }
    };

    fetchSlots();
  }, [date, sport, bookingType]);

  return (
    <div>
      {slots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        <ul>
          {slots.map(slot => (
            <li key={slot.slot}>{slot.slot}</li>
          ))}
        </ul>
      )}
    </div>
  );
}


// =========================================
// 6. TYPE DEFINITIONS (TypeScript)
// =========================================

interface ISlot {
  _id: string;
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string; // YYYY-MM-DD
  slot: string; // HH:MM-HH:MM
  isFrozen: boolean;
  frozenBy?: string;
  frozenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface FreezeRequest {
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string;
  slot: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
}

// =========================================
// END OF EXAMPLES
// =========================================
