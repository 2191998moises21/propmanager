import { z } from 'zod';
import {
  PropertyType,
  Currency,
  OccupancyStatus,
  ContractStatus,
  PaymentMethod,
  PaymentStatus,
  TicketUrgency,
} from '@/types';

/**
 * Common field validations
 */
const emailSchema = z.string().email('Correo electrónico inválido');
const phoneSchema = z
  .string()
  .min(10, 'El teléfono debe tener al menos 10 dígitos')
  .regex(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido');
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

/**
 * Owner/User schemas
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
  role: z.enum(['owner', 'tenant']),
});

export const registerOwnerSchema = z
  .object({
    nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: emailSchema,
    telefono: phoneSchema,
    direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const updateOwnerSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: emailSchema,
  telefono: phoneSchema,
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
});

/**
 * Property schemas
 */
export const propertySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  direccion: z.string().min(5, 'La dirección es requerida'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  estado: z.string().optional(),
  codigo_postal: z.string().optional(),
  tipo_propiedad: z.nativeEnum(PropertyType),
  area_m2: z.number().positive('El área debe ser mayor a 0'),
  habitaciones: z.number().int().min(0, 'El número de habitaciones debe ser válido'),
  banos: z.number().int().min(0, 'El número de baños debe ser válido'),
  estacionamientos: z.number().int().min(0, 'El número de estacionamientos debe ser válido'),
  precio_alquiler: z.number().positive('El precio debe ser mayor a 0'),
  moneda: z.nativeEnum(Currency),
  estado_ocupacion: z.nativeEnum(OccupancyStatus),
  fecha_disponible: z.string().optional(),
  deposito_requerido: z.number().min(0).optional(),
  amenidades: z.string().optional(),
  imageUrl: z.string().url('URL de imagen inválida'),
});

/**
 * Tenant schemas
 */
export const tenantSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  documento_id: z.string().min(5, 'El documento de identidad es requerido'),
  email: emailSchema,
  telefono: phoneSchema,
  fotoUrl: z.string().url('URL de foto inválida'),
  documentoUrl: z.string().url('URL de documento inválida').optional(),
});

/**
 * Contract schemas
 */
export const contractSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  propertyId: z.string(),
  tenantId: z.string(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  monto_mensual: z.number().positive('El monto debe ser mayor a 0'),
  moneda: z.nativeEnum(Currency),
  dia_pago: z.number().int().min(1).max(31, 'El día de pago debe estar entre 1 y 31'),
  estado_contrato: z.nativeEnum(ContractStatus),
});

/**
 * Payment schemas
 */
export const paymentSchema = z.object({
  contractId: z.string(),
  mes_correspondiente: z.string(),
  monto_pago: z.number().positive('El monto debe ser mayor a 0'),
  fecha_pago: z.string(),
  metodo_pago: z.nativeEnum(PaymentMethod),
  estado_pago: z.nativeEnum(PaymentStatus),
  referencia: z.string().optional(),
  comprobanteUrl: z.string().url().optional(),
});

/**
 * Ticket schemas
 */
export const ticketSchema = z.object({
  propertyId: z.string(),
  tenantId: z.string(),
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  urgencia: z.nativeEnum(TicketUrgency).optional(),
});

/**
 * Type inference helpers
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterOwnerFormData = z.infer<typeof registerOwnerSchema>;
export type UpdateOwnerFormData = z.infer<typeof updateOwnerSchema>;
export type PropertyFormData = z.infer<typeof propertySchema>;
export type TenantFormData = z.infer<typeof tenantSchema>;
export type ContractFormData = z.infer<typeof contractSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type TicketFormData = z.infer<typeof ticketSchema>;
