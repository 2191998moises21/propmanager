import { z } from 'zod';
import { UserStatus } from '../types';

export const updateTenantSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3, 'Full name must be at least 3 characters').max(255).optional(),
    telefono: z
      .string()
      .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
      .optional(),
    direccion: z.string().min(5).max(500).optional(),
    foto_url: z.string().url('Invalid photo URL').optional(),
    documento_id_url: z.string().url('Invalid document URL').optional(),
    referencias_url: z.string().url('Invalid references URL').optional(),
    comprobante_ingresos_url: z.string().url('Invalid income proof URL').optional(),
    estado_usuario: z.nativeEnum(UserStatus).optional(),
  }),
});
