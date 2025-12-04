import pool from '../config/database';
import crypto from 'crypto';
import { UserRole } from '../types';

export interface RefreshToken {
  id: string;
  user_id: string;
  user_role: UserRole;
  token: string;
  expires_at: Date;
  revoked: boolean;
  revoked_at: Date | null;
  created_at: Date;
}

/**
 * Generate a secure random refresh token
 */
const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Create a new refresh token for a user
 * Expires in 7 days
 */
export const createRefreshToken = async (
  userId: string,
  userRole: UserRole
): Promise<RefreshToken> => {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, user_role, token, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, userRole, token, expiresAt]
  );

  return result.rows[0];
};

/**
 * Find a valid (non-revoked, non-expired) refresh token
 */
export const findValidRefreshToken = async (token: string): Promise<RefreshToken | null> => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token = $1
     AND revoked = FALSE
     AND expires_at > NOW()`,
    [token]
  );

  return result.rows[0] || null;
};

/**
 * Find refresh token by ID
 */
export const findRefreshTokenById = async (id: string): Promise<RefreshToken | null> => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Revoke a specific refresh token
 */
export const revokeRefreshToken = async (tokenId: string): Promise<void> => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE, revoked_at = NOW()
     WHERE id = $1`,
    [tokenId]
  );
};

/**
 * Revoke all refresh tokens for a specific user
 * Useful when user changes password or logs out from all devices
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE, revoked_at = NOW()
     WHERE user_id = $1
     AND revoked = FALSE`,
    [userId]
  );
};

/**
 * Delete expired refresh tokens (cleanup)
 * Should be run periodically via cron job
 */
export const deleteExpiredTokens = async (): Promise<number> => {
  const result = await pool.query(
    `DELETE FROM refresh_tokens
     WHERE expires_at < NOW()
     RETURNING id`
  );

  return result.rowCount || 0;
};

/**
 * Delete old revoked tokens (cleanup)
 * Keeps only revoked tokens from last 30 days
 */
export const deleteOldRevokedTokens = async (daysToKeep: number = 30): Promise<number> => {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const result = await pool.query(
    `DELETE FROM refresh_tokens
     WHERE revoked = TRUE
     AND revoked_at < $1
     RETURNING id`,
    [cutoffDate]
  );

  return result.rowCount || 0;
};

/**
 * Get all active refresh tokens for a user
 * Useful for showing active sessions
 */
export const getUserActiveTokens = async (userId: string): Promise<RefreshToken[]> => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE user_id = $1
     AND revoked = FALSE
     AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

/**
 * Count active refresh tokens for a user
 */
export const countUserActiveTokens = async (userId: string): Promise<number> => {
  const result = await pool.query(
    `SELECT COUNT(*) as count
     FROM refresh_tokens
     WHERE user_id = $1
     AND revoked = FALSE
     AND expires_at > NOW()`,
    [userId]
  );

  return parseInt(result.rows[0].count);
};
