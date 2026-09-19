export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  feedback: string | null;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasUpper: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (hasNumber && hasUpper) score++;
  if (hasSymbol) score++;

  let feedback: string | null = null;
  if (!hasMinLength) {
    feedback = 'Password must be at least 8 characters long.';
  } else if (score < 2) {
    feedback = 'Password should include a mix of uppercase letters, numbers, or symbols.';
  }

  return {
    isValid: hasMinLength && score >= 2,
    score,
    feedback,
    hasMinLength,
    hasNumber,
    hasSymbol,
    hasUpper,
  };
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required.`;
  }
  return null;
}
