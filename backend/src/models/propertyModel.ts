import { pool } from '../config/database';
import { Property } from '../types';

/**
 * Get all properties for an owner
 */
export const getPropertiesByOwnerId = async (ownerId: string): Promise<Property[]> => {
  const result = await pool.query(
    `SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC`,
    [ownerId]
  );

  return result.rows;
};

/**
 * Get property by ID
 */
export const getPropertyById = async (propertyId: string): Promise<Property | null> => {
  const result = await pool.query(`SELECT * FROM properties WHERE id = $1`, [propertyId]);

  return result.rows[0] || null;
};

/**
 * Create new property
 */
export const createProperty = async (
  ownerId: string,
  data: Omit<Property, 'id' | 'owner_id' | 'created_at' | 'updated_at'>
): Promise<Property> => {
  const result = await pool.query(
    `INSERT INTO properties (
      owner_id, title, direccion, ciudad, estado, codigo_postal,
      tipo_propiedad, area_m2, habitaciones, banos, estacionamientos,
      precio_alquiler, moneda, estado_ocupacion, fecha_disponible,
      deposito_requerido, amenidades, image_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *`,
    [
      ownerId,
      data.title,
      data.direccion,
      data.ciudad,
      data.estado,
      data.codigo_postal,
      data.tipo_propiedad,
      data.area_m2,
      data.habitaciones,
      data.banos,
      data.estacionamientos,
      data.precio_alquiler,
      data.moneda,
      data.estado_ocupacion,
      data.fecha_disponible,
      data.deposito_requerido,
      data.amenidades,
      data.image_url,
    ]
  );

  return result.rows[0];
};

/**
 * Update property
 */
export const updateProperty = async (
  propertyId: string,
  data: Partial<Property>
): Promise<Property | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCounter = 1;

  // Build dynamic UPDATE query
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'owner_id') {
      fields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  });

  if (fields.length === 0) {
    return null;
  }

  values.push(propertyId);

  const result = await pool.query(
    `UPDATE properties SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Delete property
 */
export const deleteProperty = async (propertyId: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM properties WHERE id = $1`, [propertyId]);

  return (result.rowCount ?? 0) > 0;
};

/**
 * Search properties (for super admin)
 */
export const searchProperties = async (filters: {
  ciudad?: string;
  estado_ocupacion?: string;
  tipo_propiedad?: string;
  limit?: number;
  offset?: number;
}): Promise<{ properties: Property[]; total: number }> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramCounter = 1;

  if (filters.ciudad) {
    conditions.push(`ciudad ILIKE $${paramCounter}`);
    values.push(`%${filters.ciudad}%`);
    paramCounter++;
  }

  if (filters.estado_ocupacion) {
    conditions.push(`estado_ocupacion = $${paramCounter}`);
    values.push(filters.estado_ocupacion);
    paramCounter++;
  }

  if (filters.tipo_propiedad) {
    conditions.push(`tipo_propiedad = $${paramCounter}`);
    values.push(filters.tipo_propiedad);
    paramCounter++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM properties ${whereClause}`,
    values
  );

  const total = parseInt(countResult.rows[0].total);

  // Get paginated results
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  values.push(limit, offset);

  const result = await pool.query(
    `SELECT * FROM properties ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
    values
  );

  return {
    properties: result.rows,
    total,
  };
};
