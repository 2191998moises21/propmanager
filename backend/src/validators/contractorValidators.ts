import { z } from 'zod';

export const createContractorSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(255, 'Name must not exceed 255 characters'),
    especialidad: z
      .string()
      .min(3, 'Specialty must be at least 3 characters')
      .max(100, 'Specialty must not exceed 100 characters'),
    telefono: z
      .string()
      .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
      .min(7, 'Phone number must be at least 7 characters')
      .max(50, 'Phone number must not exceed 50 characters'),
  }),
});

export const updateContractorSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(255, 'Name must not exceed 255 characters')
      .optional(),
    especialidad: z
      .string()
      .min(3, 'Specialty must be at least 3 characters')
      .max(100, 'Specialty must not exceed 100 characters')
      .optional(),
    telefono: z
      .string()
      .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
      .min(7, 'Phone number must be at least 7 characters')
      .max(50, 'Phone number must not exceed 50 characters')
      .optional(),
  }),
});
