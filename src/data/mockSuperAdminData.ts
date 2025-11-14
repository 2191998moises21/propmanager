import { SuperAdmin, ActivityLog, SystemConfig } from '@/types';

export const mockSuperAdmin: SuperAdmin = {
  id: 'sa1',
  nombre_completo: 'Admin Sistema',
  email: 'admin@propmanager.com',
  fotoUrl: 'https://i.pravatar.cc/150?u=admin@propmanager.com',
  rol: 'superadmin',
  permisos: ['all'],
  fecha_creacion: '2024-01-01',
};

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log1',
    userId: 'owner1',
    userType: 'owner',
    userName: 'Carlos Propietario',
    accion: 'create_property',
    descripcion: 'Creó nueva propiedad "Casa Familiar Suburbios"',
    fecha: new Date().toISOString(),
    detalles: { propertyId: 'prop1' },
  },
  {
    id: 'log2',
    userId: 'ten1',
    userType: 'tenant',
    userName: 'María Rodríguez',
    accion: 'update_payment',
    descripcion: 'Subió comprobante de pago',
    fecha: new Date(Date.now() - 3600000).toISOString(),
    detalles: { paymentId: 'pay1' },
  },
];

export const mockSystemConfig: SystemConfig[] = [
  {
    id: 'cfg1',
    clave: 'comision_plataforma',
    valor: 5,
    descripcion: 'Porcentaje de comisión de la plataforma',
    categoria: 'pagos',
    fecha_modificacion: '2024-01-15',
  },
  {
    id: 'cfg2',
    clave: 'dias_gracia_pago',
    valor: 5,
    descripcion: 'Días de gracia para pagos atrasados',
    categoria: 'pagos',
    fecha_modificacion: '2024-01-15',
  },
  {
    id: 'cfg3',
    clave: 'email_notificaciones',
    valor: true,
    descripcion: 'Enviar notificaciones por email',
    categoria: 'notificaciones',
    fecha_modificacion: '2024-01-15',
  },
  {
    id: 'cfg4',
    clave: 'mantenimiento_programado',
    valor: false,
    descripcion: 'Modo mantenimiento activado',
    categoria: 'general',
    fecha_modificacion: '2024-01-15',
  },
];
