import { CricketBox, Booking } from '@/types';

// Dummy data for Cricket Wala Play Arena slots
export const CRICKET_BOXES: CricketBox[] = [
  { id: 1, name: 'Arena A', capacity: 6, pricePerHour: 1500, description: 'Standard Cricket Wala Play Arena slot' },
  { id: 2, name: 'Arena B', capacity: 8, pricePerHour: 2000, description: 'Medium Cricket Wala Play Arena slot' },
  { id: 3, name: 'Arena C', capacity: 10, pricePerHour: 2500, description: 'Large Cricket Wala Play Arena slot' },
  { id: 4, name: 'Arena D (Premium)', capacity: 12, pricePerHour: 3000, description: 'Premium Cricket Wala Play Arena slot' },
];

// Generate time slots from 6 AM to 11 PM
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 23; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endHour = hour + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    slots.push({
      id: `slot-${hour}`,
      startTime,
      endTime,
      display: `${startTime} - ${endTime}`,
    });
  }
  return slots;
};

// Dummy bookings data (for showing unavailable slots)
export const EXISTING_BOOKINGS: Partial<Booking>[] = [
  {
    boxId: 1,
    date: new Date().toISOString().split('T')[0],
    timeSlotId: 10,
    customerName: 'John Doe',
  },
  {
    boxId: 2,
    date: new Date().toISOString().split('T')[0],
    timeSlotId: 14,
    customerName: 'Jane Smith',
  },
  {
    boxId: 1,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlotId: 18,
    customerName: 'Mike Johnson',
  },
];

export const TIME_SLOTS = generateTimeSlots();
