import { z } from 'zod';
import { UserRole } from '../types';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.nativeEnum(UserRole, { required_error: 'Role is required' }),
  }),
});

export const registerOwnerSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3, 'Name must be at least 3 characters').max(255),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    telefono: z.string().min(10, 'Phone number must be at least 10 digits'),
    direccion: z.string().min(5, 'Address must be at least 5 characters'),
  }),
});

export const registerTenantSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3).max(255),
    documento_id: z.string().min(5).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    telefono: z.string().min(10),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(128),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3).max(255).optional(),
    telefono: z.string().min(7).max(50).optional(),
    direccion: z.string().min(5).max(255).optional(),
    foto_url: z.string().url().optional().or(z.string().startsWith('data:image')).optional(),
    documento_id_url: z.string().url().optional().or(z.string().startsWith('data:')).optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    role: z.nativeEnum(UserRole, { required_error: 'Role is required' }),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
  }),
});
