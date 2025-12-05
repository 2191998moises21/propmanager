import { pool } from '../config/database';
import { Owner, Tenant, SuperAdmin, UserRole } from '../types';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

/**
 * Find user by email and role
 */
export const findUserByEmailAndRole = async (
  email: string,
  role: UserRole
): Promise<Owner | Tenant | SuperAdmin | null> => {
  let table: string;

  switch (role) {
    case UserRole.Owner:
      table = 'owners';
      break;
    case UserRole.Tenant:
      table = 'tenants';
      break;
    case UserRole.SuperAdmin:
      table = 'super_admins';
      break;
    default:
      return null;
  }

  const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);

  return result.rows[0] || null;
};

/**
 * Create new owner
 */
export const createOwner = async (data: {
  nombre_completo: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
}): Promise<Owner> => {
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO owners (nombre_completo, email, password_hash, telefono, direccion, foto_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nombre_completo, email, telefono, direccion, foto_url, created_at, updated_at`,
    [
      data.nombre_completo,
      data.email,
      passwordHash,
      data.telefono,
      data.direccion,
      `https://i.pravatar.cc/150?u=${data.email}`, // Default avatar
    ]
  );

  return result.rows[0];
};

/**
 * Create new tenant
 */
export const createTenant = async (data: {
  nombre_completo: string;
  documento_id: string;
  email: string;
  password: string;
  telefono: string;
  fotoUrl?: string;
  documentoUrl?: string;
}): Promise<Tenant> => {
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  // Use provided photo URL or default avatar
  const fotoUrl = data.fotoUrl || `https://i.pravatar.cc/150?u=${data.email}`;

  const result = await pool.query(
    `INSERT INTO tenants (nombre_completo, documento_id, email, password_hash, telefono, foto_url, documento_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, nombre_completo, documento_id, email, telefono, foto_url as "fotoUrl", documento_url as "documentoUrl", created_at, updated_at`,
    [
      data.nombre_completo,
      data.documento_id,
      data.email,
      passwordHash,
      data.telefono,
      fotoUrl,
      data.documentoUrl || null,
    ]
  );

  return result.rows[0];
};

/**
 * Verify password
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Update user password
 */
export const updatePassword = async (
  userId: string,
  newPassword: string,
  role: UserRole
): Promise<void> => {
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  let table: string;

  switch (role) {
    case UserRole.Owner:
      table = 'owners';
      break;
    case UserRole.Tenant:
      table = 'tenants';
      break;
    case UserRole.SuperAdmin:
      table = 'super_admins';
      break;
    default:
      throw new Error('Invalid role');
  }

  await pool.query(`UPDATE ${table} SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);
};

/**
 * Update owner profile
 */
export const updateOwnerProfile = async (
  userId: string,
  data: {
    nombre_completo?: string;
    telefono?: string;
    direccion?: string;
    foto_url?: string;
  }
): Promise<Owner> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCounter = 1;

  if (data.nombre_completo !== undefined) {
    fields.push(`nombre_completo = $${paramCounter++}`);
    values.push(data.nombre_completo);
  }
  if (data.telefono !== undefined) {
    fields.push(`telefono = $${paramCounter++}`);
    values.push(data.telefono);
  }
  if (data.direccion !== undefined) {
    fields.push(`direccion = $${paramCounter++}`);
    values.push(data.direccion);
  }
  if (data.foto_url !== undefined) {
    fields.push(`foto_url = $${paramCounter++}`);
    values.push(data.foto_url);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE owners
    SET ${fields.join(', ')}
    WHERE id = $${paramCounter}
    RETURNING id, nombre_completo, email, telefono, direccion, foto_url as "fotoUrl", created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error('Owner not found');
  }

  return result.rows[0];
};

/**
 * Update tenant profile
 */
export const updateTenantProfile = async (
  userId: string,
  data: {
    nombre_completo?: string;
    telefono?: string;
    foto_url?: string;
    documento_url?: string;
  }
): Promise<Tenant> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCounter = 1;

  if (data.nombre_completo !== undefined) {
    fields.push(`nombre_completo = $${paramCounter++}`);
    values.push(data.nombre_completo);
  }
  if (data.telefono !== undefined) {
    fields.push(`telefono = $${paramCounter++}`);
    values.push(data.telefono);
  }
  if (data.foto_url !== undefined) {
    fields.push(`foto_url = $${paramCounter++}`);
    values.push(data.foto_url);
  }
  if (data.documento_url !== undefined) {
    fields.push(`documento_url = $${paramCounter++}`);
    values.push(data.documento_url);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE tenants
    SET ${fields.join(', ')}
    WHERE id = $${paramCounter}
    RETURNING id, nombre_completo, documento_id, email, telefono, foto_url as "fotoUrl", documento_url as "documentoUrl", created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error('Tenant not found');
  }

  return result.rows[0];
};
