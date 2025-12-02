import { z } from 'zod';
import { PaymentStatus, PaymentMethod } from '../types';

export const createPaymentSchema = z.object({
  body: z.object({
    contract_id: z.string().uuid('Invalid contract ID'),
    mes_correspondiente: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format, use YYYY-MM'),
    monto_pago: z.number().positive('Payment amount must be positive'),
    fecha_pago: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
    metodo_pago: z.nativeEnum(PaymentMethod).optional(),
    estado_pago: z.nativeEnum(PaymentStatus).default(PaymentStatus.Pendiente),
    notas: z.string().max(500).optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    monto_pago: z.number().positive('Payment amount must be positive').optional(),
    fecha_pago: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
    metodo_pago: z.nativeEnum(PaymentMethod).optional(),
    estado_pago: z.nativeEnum(PaymentStatus).optional(),
    notas: z.string().max(500).optional(),
  }),
});

export const uploadPaymentProofSchema = z.object({
  body: z.object({
    comprobante_pago: z.string().min(1, 'Payment proof is required'),
    // Validar que sea una URL o base64 data URI
  }).refine(
    (data) => {
      const isUrl = data.comprobante_pago.startsWith('http://') || data.comprobante_pago.startsWith('https://');
      const isDataUri = data.comprobante_pago.startsWith('data:');
      return isUrl || isDataUri;
    },
    {
      message: 'Payment proof must be a valid URL or base64 data URI',
      path: ['comprobante_pago'],
    }
  ),
});
