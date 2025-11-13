export enum PropertyType {
  Casa = 'casa',
  Apartamento = 'apartamento',
  Local = 'local',
  Oficina = 'oficina',
  Bodega = 'bodega',
}

export enum Currency {
  USD = 'USD',
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

export enum TicketStatus {
    Abierto = 'abierto',
    EnProgreso = 'en progreso',
    Cerrado = 'cerrado',
}

export enum TicketUrgency {
    Baja = 'baja',
    Media = 'media',
    Alta = 'alta',
}

export interface Owner {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion: string;
  fotoUrl: string;
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
  documentoUrl?: string;
}

export interface ContractDocument {
    nombre: string;
    url: string; // Data URL
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
  documentos?: ContractDocument[];
}

export interface Payment {
  id: string;
  contractId: string;
  mes_correspondiente: string; // YYYY-MM-01
  monto_pago: number;
  fecha_pago: string; // YYYY-MM-DD
  metodo_pago: PaymentMethod;
  estado_pago: PaymentStatus;
  referencia?: string;
}

export interface Contractor {
    id: string;
    nombre: string;
    especialidad: string;
    telefono: string;
}

export interface Ticket {
    id: string;
    propertyId: string;
    tenantId: string;
    titulo: string;
    descripcion: string;
    fotos: string[];
    costo_estimado: number;
    moneda: Currency;
    urgencia: TicketUrgency;
    estado: TicketStatus;
    fecha_creacion: string; // YYYY-MM-DD
    contratistaId?: string;
    facturaUrl?: string;
}