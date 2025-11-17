import { pool } from '../config/database';
import { Tenant } from '../types';

/**
 * Get all tenants
 */
export const getAllTenants = async (): Promise<Tenant[]> => {
  const result = await pool.query(
    `SELECT id, nombre_completo, documento_id, email, telefono, foto_url, documento_url, created_at, updated_at
     FROM tenants
     ORDER BY created_at DESC`
  );

  return result.rows;
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (tenantId: string): Promise<Tenant | null> => {
  const result = await pool.query(
    `SELECT id, nombre_completo, documento_id, email, telefono, foto_url, documento_url, created_at, updated_at
     FROM tenants
     WHERE id = $1`,
    [tenantId]
  );

  return result.rows[0] || null;
};

/**
 * Update tenant
 */
export const updateTenant = async (
  tenantId: string,
  data: Partial<Tenant>
): Promise<Tenant | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCounter = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (
      value !== undefined &&
      key !== 'id' &&
      key !== 'password_hash' &&
      key !== 'created_at' &&
      key !== 'updated_at'
    ) {
      fields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  });

  if (fields.length === 0) {
    return null;
  }

  values.push(tenantId);

  const result = await pool.query(
    `UPDATE tenants SET ${fields.join(', ')} WHERE id = $${paramCounter}
     RETURNING id, nombre_completo, documento_id, email, telefono, foto_url, documento_url, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Delete tenant
 */
export const deleteTenant = async (tenantId: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM tenants WHERE id = $1`, [tenantId]);

  return (result.rowCount ?? 0) > 0;
};

/**
 * Get tenants by owner (via contracts and properties)
 */
export const getTenantsByOwnerId = async (ownerId: string): Promise<Tenant[]> => {
  const result = await pool.query(
    `SELECT DISTINCT t.id, t.nombre_completo, t.documento_id, t.email, t.telefono, t.foto_url, t.documento_url, t.created_at, t.updated_at
     FROM tenants t
     JOIN contracts c ON t.id = c.tenant_id
     JOIN properties p ON c.property_id = p.id
     WHERE p.owner_id = $1
     ORDER BY t.created_at DESC`,
    [ownerId]
  );

  return result.rows;
};
