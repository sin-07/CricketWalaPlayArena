import { CricketBox, Booking } from '@/types';

// Dummy data for cricket box slots
export const CRICKET_BOXES: CricketBox[] = [
  { id: 1, name: 'Box A', capacity: 6, pricePerHour: 1500, description: 'Standard cricket box' },
  { id: 2, name: 'Box B', capacity: 8, pricePerHour: 2000, description: 'Medium cricket box' },
  { id: 3, name: 'Box C', capacity: 10, pricePerHour: 2500, description: 'Large cricket box' },
  { id: 4, name: 'Box D (Premium)', capacity: 12, pricePerHour: 3000, description: 'Premium cricket box' },
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
