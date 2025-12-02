import pool from '../config/database';
import { ActivityLog, UserRole } from '../types';

/**
 * Create activity log
 */
export async function createActivityLog(data: {
  user_id: string;
  user_type: UserRole;
  user_name: string;
  accion: string;
  descripcion: string;
  detalles?: Record<string, unknown>;
}): Promise<ActivityLog> {
  const query = `
    INSERT INTO activity_logs (user_id, user_type, user_name, accion, descripcion, detalles)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, user_type, user_name, accion, descripcion, fecha, detalles, created_at
  `;

  const result = await pool.query(query, [
    data.user_id,
    data.user_type,
    data.user_name,
    data.accion,
    data.descripcion,
    data.detalles ? JSON.stringify(data.detalles) : null,
  ]);

  return result.rows[0];
}

/**
 * Get all activity logs with pagination
 */
export async function getAllActivityLogs(params: {
  limit?: number;
  offset?: number;
  user_id?: string;
  user_type?: UserRole;
  accion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<{ logs: ActivityLog[]; total: number }> {
  const {
    limit = 50,
    offset = 0,
    user_id,
    user_type,
    accion,
    fecha_desde,
    fecha_hasta,
  } = params;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (user_id) {
    conditions.push(`user_id = $${paramCount}`);
    values.push(user_id);
    paramCount++;
  }

  if (user_type) {
    conditions.push(`user_type = $${paramCount}`);
    values.push(user_type);
    paramCount++;
  }

  if (accion) {
    conditions.push(`accion = $${paramCount}`);
    values.push(accion);
    paramCount++;
  }

  if (fecha_desde) {
    conditions.push(`fecha >= $${paramCount}`);
    values.push(fecha_desde);
    paramCount++;
  }

  if (fecha_hasta) {
    conditions.push(`fecha <= $${paramCount}`);
    values.push(fecha_hasta);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM activity_logs
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  // Get logs with pagination
  const query = `
    SELECT id, user_id, user_type, user_name, accion, descripcion, fecha, detalles, created_at
    FROM activity_logs
    ${whereClause}
    ORDER BY fecha DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);

  const result = await pool.query(query, values);

  return {
    logs: result.rows,
    total,
  };
}

/**
 * Get activity log by ID
 */
export async function getActivityLogById(id: string): Promise<ActivityLog | null> {
  const query = `
    SELECT id, user_id, user_type, user_name, accion, descripcion, fecha, detalles, created_at
    FROM activity_logs
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Get activity logs by user
 */
export async function getActivityLogsByUser(
  user_id: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ logs: ActivityLog[]; total: number }> {
  return getAllActivityLogs({ user_id, limit, offset });
}

/**
 * Get activity logs by action
 */
export async function getActivityLogsByAction(
  accion: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ logs: ActivityLog[]; total: number }> {
  return getAllActivityLogs({ accion, limit, offset });
}

/**
 * Get recent activity logs (last N logs)
 */
export async function getRecentActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
  const query = `
    SELECT id, user_id, user_type, user_name, accion, descripcion, fecha, detalles, created_at
    FROM activity_logs
    ORDER BY fecha DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
}

/**
 * Get activity stats (counts by action)
 */
export async function getActivityStats(params: {
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<Array<{ accion: string; count: number }>> {
  const { fecha_desde, fecha_hasta } = params;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (fecha_desde) {
    conditions.push(`fecha >= $${paramCount}`);
    values.push(fecha_desde);
    paramCount++;
  }

  if (fecha_hasta) {
    conditions.push(`fecha <= $${paramCount}`);
    values.push(fecha_hasta);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT accion, COUNT(*) as count
    FROM activity_logs
    ${whereClause}
    GROUP BY accion
    ORDER BY count DESC
  `;

  const result = await pool.query(query, values);
  return result.rows.map((row) => ({
    accion: row.accion,
    count: parseInt(row.count, 10),
  }));
}

/**
 * Delete old activity logs (for data retention)
 */
export async function deleteOldActivityLogs(daysToKeep: number = 90): Promise<number> {
  const query = `
    DELETE FROM activity_logs
    WHERE fecha < NOW() - INTERVAL '${daysToKeep} days'
    RETURNING id
  `;

  const result = await pool.query(query);
  return result.rowCount || 0;
}
