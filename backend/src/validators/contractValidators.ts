import { z } from 'zod';
import { ContractStatus } from '../types';

export const createContractSchema = z.object({
  body: z.object({
    property_id: z.string().uuid('Invalid property ID'),
    tenant_id: z.string().uuid('Invalid tenant ID'),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
    fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
    monto_mensual: z.number().positive('Monthly amount must be positive'),
    dia_pago: z
      .number()
      .int('Payment day must be an integer')
      .min(1, 'Payment day must be between 1 and 31')
      .max(31, 'Payment day must be between 1 and 31'),
    deposito_seguridad: z.number().positive().optional(),
    notas: z.string().optional(),
  }).refine(
    (data) => {
      const startDate = new Date(data.fecha_inicio);
      const endDate = new Date(data.fecha_fin);
      return endDate > startDate;
    },
    {
      message: 'End date must be after start date',
      path: ['fecha_fin'],
    }
  ),
});

export const updateContractSchema = z.object({
  body: z.object({
    fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
    monto_mensual: z.number().positive('Monthly amount must be positive').optional(),
    dia_pago: z
      .number()
      .int('Payment day must be an integer')
      .min(1, 'Payment day must be between 1 and 31')
      .max(31, 'Payment day must be between 1 and 31')
      .optional(),
    deposito_seguridad: z.number().positive().optional(),
    estado_contrato: z.nativeEnum(ContractStatus).optional(),
    notas: z.string().optional(),
  }),
});

export const addContractDocumentSchema = z.object({
  body: z.object({
    nombre_documento: z.string().min(1, 'Document name is required').max(255),
    tipo_documento: z.string().min(1, 'Document type is required').max(100),
    url_documento: z.string().url('Invalid document URL'),
  }),
});
