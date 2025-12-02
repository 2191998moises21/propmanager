import { z } from 'zod';
import { UserRole } from '../types';

export const createActivityLogSchema = z.object({
  body: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    user_type: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Invalid user type. Must be owner, tenant, or superadmin' }),
    }),
    user_name: z
      .string()
      .min(3, 'User name must be at least 3 characters')
      .max(255, 'User name must not exceed 255 characters'),
    accion: z
      .string()
      .min(3, 'Action must be at least 3 characters')
      .max(100, 'Action must not exceed 100 characters')
      .regex(
        /^[a-zA-Z_]+$/,
        'Action must contain only letters and underscores (e.g., CREATE_PROPERTY, UPDATE_PAYMENT)'
      ),
    descripcion: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must not exceed 1000 characters'),
    detalles: z
      .record(z.unknown())
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          // Ensure it can be serialized to JSON
          try {
            JSON.stringify(value);
            return true;
          } catch {
            return false;
          }
        },
        { message: 'Details must be a valid JSON object' }
      ),
  }),
});

// Validation for query parameters
export const getLogsQuerySchema = z.object({
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional(),
    offset: z
      .string()
      .regex(/^\d+$/, 'Offset must be a number')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 0, 'Offset must be 0 or greater')
      .optional(),
    user_id: z.string().uuid('Invalid user ID').optional(),
    user_type: z.nativeEnum(UserRole).optional(),
    accion: z.string().min(1).max(100).optional(),
    fecha_desde: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    fecha_hasta: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}/, 'Date must be in YYYY-MM-DD format')
      .optional(),
  }),
});
