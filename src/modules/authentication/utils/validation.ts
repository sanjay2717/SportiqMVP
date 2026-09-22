/**
 * Simple email validation using a standard regex pattern.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // A basic email regex that catches most common errors
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a password against Supabase Auth requirements.
 * Rules:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one symbol (matching exact Supabase symbol class)
 */
export function validatePassword(password: string) {
  // Supabase Auth exact symbol class: !@#$%^&*()_+-=[]{};':"|<>?,./`~
  // Source: https://supabase.com/docs/guides/auth/auth-password-requirements
  const symbolRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;
  
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: symbolRegex.test(password),
  };
}
