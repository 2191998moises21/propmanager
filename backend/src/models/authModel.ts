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
}): Promise<Tenant> => {
  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO tenants (nombre_completo, documento_id, email, password_hash, telefono, foto_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nombre_completo, documento_id, email, telefono, foto_url, created_at, updated_at`,
    [
      data.nombre_completo,
      data.documento_id,
      data.email,
      passwordHash,
      data.telefono,
      `https://i.pravatar.cc/150?u=${data.email}`,
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
