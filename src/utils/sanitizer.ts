/**
 * XSS Security Sanitizer
 * Sanitizes input text to prevent XSS injection attacks.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/onerror/gi, '')
    .replace(/onload/gi, '')
    .trim();
}

/**
 * Validates E.164 phone numbers (e.g. +14155552671 or standard 10-11 digit numeric format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Accepts standard 10-15 digit phone formats optionally starting with +
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validates basic email address format
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field check handled separately if required
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
