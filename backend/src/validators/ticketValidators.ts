import { z } from 'zod';
import { TicketStatus, TicketUrgency } from '../types';

export const createTicketSchema = z.object({
  body: z.object({
    property_id: z.string().uuid('Invalid property ID'),
    tenant_id: z.string().uuid('Invalid tenant ID').optional(), // Owner puede crear ticket sin tenant
    titulo: z.string().min(3, 'Title must be at least 3 characters').max(255),
    descripcion: z.string().min(10, 'Description must be at least 10 characters'),
    urgencia: z.nativeEnum(TicketUrgency).default(TicketUrgency.Media),
    estado: z.nativeEnum(TicketStatus).default(TicketStatus.Abierto),
    contratista_id: z.string().uuid('Invalid contractor ID').optional(),
    fotos: z
      .array(z.string())
      .max(5, 'Maximum 5 photos allowed')
      .optional(),
  }),
});

export const updateTicketSchema = z.object({
  body: z.object({
    titulo: z.string().min(3, 'Title must be at least 3 characters').max(255).optional(),
    descripcion: z.string().min(10, 'Description must be at least 10 characters').optional(),
    urgencia: z.nativeEnum(TicketUrgency).optional(),
    estado: z.nativeEnum(TicketStatus).optional(),
    contratista_id: z.string().uuid('Invalid contractor ID').nullable().optional(),
    fecha_resolucion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
    costo_reparacion: z.number().positive('Repair cost must be positive').optional(),
    notas_resolucion: z.string().max(1000).optional(),
  }),
});
