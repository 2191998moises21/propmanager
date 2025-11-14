import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 8 caracteres',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos una letra mayúscula',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos una letra minúscula',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos un número',
    };
  }

  return { isValid: true };
}

/**
 * Generates a simple session token (for demo purposes)
 * In production, use proper JWT tokens from a backend
 * @returns A random session token
 */
export function generateSessionToken(): string {
  return btoa(crypto.randomUUID() + Date.now());
}
