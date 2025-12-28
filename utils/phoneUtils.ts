/**
 * Phone number normalization utilities for Indian mobile numbers
 * Handles auto-fill, paste events, and various input formats
 */

/**
 * Normalizes an Indian phone number by removing:
 * - Leading "0", "+91", "91"
 * - Spaces, hyphens, and special characters
 * 
 * @param phone - The raw phone number input
 * @returns Normalized 10-digit phone number or cleaned partial input
 * 
 * @example
 * normalizePhoneNumber("+91 9876543210") // "9876543210"
 * normalizePhoneNumber("0919876543210")  // "9876543210"
 * normalizePhoneNumber("91-9876543210")  // "9876543210"
 * normalizePhoneNumber("09876543210")    // "9876543210"
 * normalizePhoneNumber("9876543210")     // "9876543210"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters (spaces, hyphens, parentheses, etc.)
  let normalized = phone.replace(/\D/g, '');

  // Handle various prefixes
  // Case: +91XXXXXXXXXX or 91XXXXXXXXXX (12 digits with 91 prefix)
  if (normalized.length >= 12 && normalized.startsWith('91')) {
    normalized = normalized.slice(2);
  }
  // Case: 091XXXXXXXXXX (13 digits with 091 prefix)
  else if (normalized.length >= 13 && normalized.startsWith('091')) {
    normalized = normalized.slice(3);
  }
  // Case: 0XXXXXXXXXX (11 digits with leading 0)
  else if (normalized.length === 11 && normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }

  // Limit to 10 digits max
  if (normalized.length > 10) {
    normalized = normalized.slice(0, 10);
  }

  return normalized;
}

/**
 * Validates if a phone number is a valid 10-digit Indian mobile number
 * 
 * @param phone - The phone number to validate (should be normalized first)
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(phone)) return false;
  
  // Indian mobile numbers start with 6, 7, 8, or 9
  const firstDigit = phone.charAt(0);
  return ['6', '7', '8', '9'].includes(firstDigit);
}

/**
 * Gets validation error message for phone number
 * 
 * @param phone - The normalized phone number
 * @returns Error message or empty string if valid
 */
export function getPhoneValidationError(phone: string): string {
  if (!phone || phone.trim() === '') {
    return 'Phone is required';
  }
  
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length < 10) {
    return 'Phone must be 10 digits';
  }
  
  if (!/^\d{10}$/.test(normalized)) {
    return 'Phone must contain only digits';
  }
  
  const firstDigit = normalized.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return 'Enter a valid Indian mobile number';
  }
  
  return '';
}

/**
 * Creates an onChange handler that auto-normalizes phone input
 * Useful for React input elements
 * 
 * @param setter - The state setter function
 * @returns Event handler function
 */
export function createPhoneChangeHandler(
  setter: (value: string) => void
): (e: React.ChangeEvent<HTMLInputElement>) => void {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizePhoneNumber(e.target.value);
    setter(normalized);
  };
}

/**
 * Creates an onPaste handler that normalizes pasted phone numbers
 * 
 * @param setter - The state setter function
 * @returns Event handler function
 */
export function createPhonePasteHandler(
  setter: (value: string) => void
): (e: React.ClipboardEvent<HTMLInputElement>) => void {
  return (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const normalized = normalizePhoneNumber(pastedText);
    setter(normalized);
  };
}
