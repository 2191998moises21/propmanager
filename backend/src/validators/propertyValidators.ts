import { z } from 'zod';
import { PropertyType, OccupancyStatus, Currency } from '../types';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    direccion: z.string().min(5),
    ciudad: z.string().min(2).max(100),
    estado: z.string().max(100).optional(),
    codigo_postal: z.string().max(20).optional(),
    tipo_propiedad: z.nativeEnum(PropertyType),
    area_m2: z.number().positive(),
    habitaciones: z.number().int().min(0),
    banos: z.number().int().min(0),
    estacionamientos: z.number().int().min(0).default(0),
    precio_alquiler: z.number().positive(),
    moneda: z.nativeEnum(Currency).default(Currency.USD),
    estado_ocupacion: z.nativeEnum(OccupancyStatus).default(OccupancyStatus.Disponible),
    fecha_disponible: z.string().optional(),
    deposito_requerido: z.number().positive().optional(),
    amenidades: z.string().optional(),
    image_url: z.string().url().optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    direccion: z.string().min(5).optional(),
    ciudad: z.string().min(2).max(100).optional(),
    estado: z.string().max(100).optional(),
    codigo_postal: z.string().max(20).optional(),
    tipo_propiedad: z.nativeEnum(PropertyType).optional(),
    area_m2: z.number().positive().optional(),
    habitaciones: z.number().int().min(0).optional(),
    banos: z.number().int().min(0).optional(),
    estacionamientos: z.number().int().min(0).optional(),
    precio_alquiler: z.number().positive().optional(),
    estado_ocupacion: z.nativeEnum(OccupancyStatus).optional(),
    fecha_disponible: z.string().optional(),
    deposito_requerido: z.number().positive().optional(),
    amenidades: z.string().optional(),
    image_url: z.string().url().optional(),
  }),
});
