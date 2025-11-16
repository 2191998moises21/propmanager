/**
 * Authentication Utilities
 *
 * NOTE: Password hashing and verification functions removed from frontend.
 * These operations MUST be handled by the backend API for security.
 *
 * When implementing backend authentication:
 * - Use bcrypt/argon2 on the server
 * - Never send plain passwords to frontend
 * - Use JWT tokens for session management
 * - Implement proper password reset flows
 */

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
