export type Errors = Record<string, string>;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string) {
  if (!value.trim()) return "Enter your email address.";
  if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
  return "";
}

export function validatePassword(value: string) {
  if (!value) return "Enter your password.";
  if (value.length < 8) return "Use at least 8 characters.";
  return "";
}
