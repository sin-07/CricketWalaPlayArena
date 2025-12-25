// Format date to readable string
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date for input field (YYYY-MM-DD) - uses local timezone
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get minimum date (today) - uses local timezone
export const getMinDate = (): string => {
  return formatDateForInput(new Date());
};

// Get maximum date (14 days from now)
export const getMaxDate = (): string => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  return formatDateForInput(maxDate);
};

// Check if a date is in the past
export const isDateInPast = (dateStr: string): boolean => {
  const today = getMinDate();
  return dateStr < today;
};

// Get array of next 14 days
export const getNext14Days = (): Array<{ date: string; display: string; dayName: string }> => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const dateStr = formatDateForInput(date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const display = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    days.push({
      date: dateStr,
      display,
      dayName,
    });
  }
  
  return days;
};

// Calculate total price
export const calculateTotalPrice = (pricePerHour: number, hours: number): number => {
  return pricePerHour * hours;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Generate booking reference number
export const generateBookingRef = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  const uniqueId = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CB${timestamp}${random}${uniqueId}`;
};
