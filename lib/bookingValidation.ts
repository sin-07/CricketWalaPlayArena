// Validation utilities for booking form
export const AVAILABLE_SLOTS = [
  '00:00-01:00',
  '01:00-02:00',
  '02:00-03:00',
  '03:00-04:00',
  '04:00-05:00',
  '05:00-06:00',
  '06:00-07:00',
  '07:00-08:00',
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
  '22:00-23:00',
  '23:00-00:00',
];

export const MATCH_SPORTS = ['Cricket', 'Football'];
export const PRACTICE_SPORTS = ['Cricket'];

export interface BookingFormData {
  bookingType: 'match' | 'practice';
  sport: string;
  date: string;
  slot: string | string[]; // Support both single and multiple slots
  name: string;
  mobile: string;
  email: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian mobile number (10 digits, starts with 6-9)
 */
export const isValidMobileNumber = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\D/g, ''));
};

/**
 * Normalize mobile number by removing non-digit characters
 */
export const normalizeMobileNumber = (mobile: string): string => {
  return mobile.replace(/\D/g, '').slice(-10);
};

/**
 * Validate date is not in the past
 */
export const isValidDate = (dateString: string): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Format date to YYYY-MM-DD format
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get minimum date (today)
 */
export const getMinDate = (): string => {
  return formatDate(new Date());
};

/**
 * Get maximum date (90 days from today)
 */
export const getMaxDate = (): string => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  return formatDate(maxDate);
};

/**
 * Validate entire booking form
 */
export const validateBookingForm = (
  data: BookingFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate booking type
  if (!['match', 'practice'].includes(data.bookingType)) {
    errors.push({
      field: 'bookingType',
      message: 'Invalid booking type',
    });
  }

  // Validate sport based on booking type
  const validSports =
    data.bookingType === 'match' ? MATCH_SPORTS : PRACTICE_SPORTS;
  if (!validSports.includes(data.sport)) {
    errors.push({
      field: 'sport',
      message: `${data.sport} is not available for ${data.bookingType} bookings`,
    });
  }

  // Validate date
  if (!data.date) {
    errors.push({
      field: 'date',
      message: 'Please select a date',
    });
  } else if (!isValidDate(data.date)) {
    errors.push({
      field: 'date',
      message: 'Please select a future date',
    });
  }

  // Validate slot
  if (!data.slot || (Array.isArray(data.slot) && data.slot.length === 0)) {
    errors.push({
      field: 'slot',
      message: 'Please select at least one time slot',
    });
  } else if (Array.isArray(data.slot)) {
    // Validate each slot in the array
    const invalidSlots = data.slot.filter(s => !AVAILABLE_SLOTS.includes(s));
    if (invalidSlots.length > 0) {
      errors.push({
        field: 'slot',
        message: 'One or more invalid time slots selected',
      });
    }
  } else if (typeof data.slot === 'string' && !AVAILABLE_SLOTS.includes(data.slot)) {
    errors.push({
      field: 'slot',
      message: 'Invalid time slot selected',
    });
  }

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Please enter your full name',
    });
  } else if (data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters',
    });
  }

  // Validate mobile
  if (!data.mobile) {
    errors.push({
      field: 'mobile',
      message: 'Please enter your mobile number',
    });
  } else if (!isValidMobileNumber(data.mobile)) {
    errors.push({
      field: 'mobile',
      message: 'Please enter a valid 10-digit Indian mobile number',
    });
  }

  // Validate email
  if (!data.email) {
    errors.push({
      field: 'email',
      message: 'Please enter your email address',
    });
  } else if (!isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  }

  return errors;
};
