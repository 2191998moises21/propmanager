import pool from '../config/database';
import { Contractor } from '../types';

/**
 * Get all contractors
 */
export async function getAllContractors(): Promise<Contractor[]> {
  const query = `
    SELECT id, nombre, especialidad, telefono, created_at
    FROM contractors
    ORDER BY nombre ASC
  `;

  const result = await pool.query(query);
  return result.rows;
}

/**
 * Get contractor by ID
 */
export async function getContractorById(id: string): Promise<Contractor | null> {
  const query = `
    SELECT id, nombre, especialidad, telefono, created_at
    FROM contractors
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Create a new contractor
 */
export async function createContractor(data: {
  nombre: string;
  especialidad: string;
  telefono: string;
}): Promise<Contractor> {
  const query = `
    INSERT INTO contractors (nombre, especialidad, telefono)
    VALUES ($1, $2, $3)
    RETURNING id, nombre, especialidad, telefono, created_at
  `;

  const result = await pool.query(query, [data.nombre, data.especialidad, data.telefono]);
  return result.rows[0];
}

/**
 * Update contractor
 */
export async function updateContractor(
  id: string,
  data: {
    nombre?: string;
    especialidad?: string;
    telefono?: string;
  }
): Promise<Contractor | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${paramCount}`);
    values.push(data.nombre);
    paramCount++;
  }

  if (data.especialidad !== undefined) {
    fields.push(`especialidad = $${paramCount}`);
    values.push(data.especialidad);
    paramCount++;
  }

  if (data.telefono !== undefined) {
    fields.push(`telefono = $${paramCount}`);
    values.push(data.telefono);
    paramCount++;
  }

  if (fields.length === 0) {
    return getContractorById(id);
  }

  values.push(id);

  const query = `
    UPDATE contractors
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, nombre, especialidad, telefono, created_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete contractor
 */
export async function deleteContractor(id: string): Promise<boolean> {
  const query = `
    DELETE FROM contractors
    WHERE id = $1
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Search contractors by name or specialty
 */
export async function searchContractors(searchTerm: string): Promise<Contractor[]> {
  const query = `
    SELECT id, nombre, especialidad, telefono, created_at
    FROM contractors
    WHERE nombre ILIKE $1 OR especialidad ILIKE $1
    ORDER BY nombre ASC
  `;

  const result = await pool.query(query, [`%${searchTerm}%`]);
  return result.rows;
}
