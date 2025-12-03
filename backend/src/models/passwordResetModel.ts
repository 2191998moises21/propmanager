import { pool } from '../config/database';
import { UserRole } from '../types';
import crypto from 'crypto';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  user_role: UserRole;
  email: string;
  token: string;
  expires_at: Date;
  used: boolean;
  used_at?: Date;
  created_at: Date;
}

/**
 * Generate secure random token
 */
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create password reset token
 */
export const createPasswordResetToken = async (
  userId: string,
  userRole: UserRole,
  email: string
): Promise<PasswordResetToken> => {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  const result = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, user_role, email, token, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, userRole, email, token, expiresAt]
  );

  return result.rows[0];
};

/**
 * Find valid (unused, not expired) token
 */
export const findValidToken = async (token: string): Promise<PasswordResetToken | null> => {
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = $1
     AND used = FALSE
     AND expires_at > NOW()`,
    [token]
  );

  return result.rows[0] || null;
};

/**
 * Mark token as used
 */
export const markTokenAsUsed = async (tokenId: string): Promise<void> => {
  await pool.query(
    `UPDATE password_reset_tokens
     SET used = TRUE, used_at = NOW()
     WHERE id = $1`,
    [tokenId]
  );
};

/**
 * Delete expired tokens (cleanup job)
 */
export const deleteExpiredTokens = async (): Promise<number> => {
  const result = await pool.query(
    `DELETE FROM password_reset_tokens
     WHERE expires_at < NOW() - INTERVAL '7 days'`
  );

  return result.rowCount || 0;
};

/**
 * Delete all tokens for a user (e.g., after successful reset)
 */
export const deleteUserTokens = async (userId: string): Promise<void> => {
  await pool.query(
    `DELETE FROM password_reset_tokens
     WHERE user_id = $1`,
    [userId]
  );
};

/**
 * Find token by email (for checking if request was recent)
 */
export const findRecentTokenByEmail = async (
  email: string,
  minutesAgo: number = 5
): Promise<PasswordResetToken | null> => {
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE email = $1
     AND created_at > NOW() - INTERVAL '${minutesAgo} minutes'
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
};
