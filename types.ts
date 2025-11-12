
export enum PropertyType {
  Casa = 'casa',
  Apartamento = 'apartamento',
  Local = 'local',
  Oficina = 'oficina',
  Bodega = 'bodega',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  BRL = 'BRL',
  PEN = 'PEN',
  VES = 'VES',
  COP = 'COP',
}

export enum OccupancyStatus {
  Disponible = 'disponible',
  Ocupada = 'ocupada',
  Mantenimiento = 'mantenimiento',
}

export enum ContractStatus {
  Activo = 'activo',
  Vencido = 'vencido',
  Terminado = 'terminado',
  Renovado = 'renovado',
}

export enum PaymentStatus {
  Pendiente = 'pendiente',
  Pagado = 'pagado',
  Atrasado = 'atrasado',
  Parcial = 'parcial',
}

export enum PaymentMethod {
  Efectivo = 'efectivo',
  Transferencia = 'transferencia',
  Cheque = 'cheque',
  Tarjeta = 'tarjeta',
  Deposito = 'deposito',
}

export interface Property {
  id: string;
  title: string;
  direccion: string;
  ciudad: string;
  estado?: string;
  codigo_postal?: string;
  tipo_propiedad: PropertyType;
  area_m2: number;
  habitaciones: number;
  banos: number;
  estacionamientos: number;
  precio_alquiler: number;
  moneda: Currency;
  estado_ocupacion: OccupancyStatus;
  fecha_disponible?: string; // YYYY-MM-DD
  deposito_requerido?: number;
  amenidades?: string; // HTML content
  imageUrl: string;
}

export interface Tenant {
  id: string;
  nombre_completo: string;
  documento_id: string;
  email: string;
  telefono: string;
  fotoUrl: string;
}

export interface Contract {
  id: string;
  title: string;
  propertyId: string;
  tenantId: string;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  monto_mensual: number;
  moneda: Currency;
  dia_pago: number;
  estado_contrato: ContractStatus;
}

export interface Payment {
  id: string;
  contractId: string;
  mes_correspondiente: string; // YYYY-MM-01
  monto_pago: number;
  fecha_pago: string; // YYYY-MM-DD
  metodo_pago: PaymentMethod;
  estado_pago: PaymentStatus;
}
