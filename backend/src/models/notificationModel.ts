import { pool } from '../config/database';
import { Notification, UserRole, NotificationType } from '../types';

/**
 * Get all notifications for a user
 */
export const getNotificationsByUserId = async (
  userId: string,
  userRole: UserRole,
  limit: number = 50
): Promise<Notification[]> => {
  const result = await pool.query(
    `SELECT id, user_id, user_role, tipo, titulo, mensaje, leido, url, metadata, created_at
     FROM notifications
     WHERE user_id = $1 AND user_role = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [userId, userRole, limit]
  );

  return result.rows;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string, userRole: UserRole): Promise<number> => {
  const result = await pool.query(
    `SELECT COUNT(*) as count
     FROM notifications
     WHERE user_id = $1 AND user_role = $2 AND leido = FALSE`,
    [userId, userRole]
  );

  return parseInt(result.rows[0].count, 10);
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string, userId: string): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE notifications
     SET leido = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notificationId, userId]
  );

  return (result.rowCount ?? 0) > 0;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string, userRole: UserRole): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE notifications
     SET leido = TRUE
     WHERE user_id = $1 AND user_role = $2 AND leido = FALSE
     RETURNING id`,
    [userId, userRole]
  );

  return (result.rowCount ?? 0) > 0;
};

/**
 * Create a new notification
 */
export const createNotification = async (data: {
  user_id: string;
  user_role: UserRole;
  tipo: NotificationType | string;
  titulo: string;
  mensaje: string;
  url?: string;
  metadata?: Record<string, unknown>;
}): Promise<Notification> => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, user_role, tipo, titulo, mensaje, url, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, user_role, tipo, titulo, mensaje, leido, url, metadata, created_at`,
    [data.user_id, data.user_role, data.tipo, data.titulo, data.mensaje, data.url || null, data.metadata ? JSON.stringify(data.metadata) : null]
  );

  return result.rows[0];
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string, userId: string): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );

  return (result.rowCount ?? 0) > 0;
};

/**
 * Delete old read notifications (cleanup - older than 30 days)
 */
export const deleteOldReadNotifications = async (): Promise<number> => {
  const result = await pool.query(
    `DELETE FROM notifications
     WHERE leido = TRUE
     AND created_at < NOW() - INTERVAL '30 days'
     RETURNING id`
  );

  return result.rowCount ?? 0;
};
