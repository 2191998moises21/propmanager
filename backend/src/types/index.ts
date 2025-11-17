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
  EnRevision = 'en revisión',
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

export enum UserRole {
  Owner = 'owner',
  Tenant = 'tenant',
  SuperAdmin = 'superadmin',
}

// Database models
export interface Owner {
  id: string;
  nombre_completo: string;
  email: string;
  password_hash?: string; // Optional for responses
  telefono: string;
  direccion: string;
  foto_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Property {
  id: string;
  owner_id: string;
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
  fecha_disponible?: string;
  deposito_requerido?: number;
  amenidades?: string;
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Tenant {
  id: string;
  nombre_completo: string;
  documento_id: string;
  email: string;
  password_hash?: string; // Optional for responses
  telefono: string;
  foto_url?: string;
  documento_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contract {
  id: string;
  title: string;
  property_id: string;
  tenant_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  monto_mensual: number;
  moneda: Currency;
  dia_pago: number;
  estado_contrato: ContractStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface ContractDocument {
  id: string;
  contract_id: string;
  nombre: string;
  url: string;
  created_at?: Date;
}

export interface Payment {
  id: string;
  contract_id: string;
  mes_correspondiente: string;
  monto_pago: number;
  fecha_pago?: string;
  metodo_pago?: PaymentMethod;
  estado_pago: PaymentStatus;
  referencia?: string;
  comprobante_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Contractor {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  created_at?: Date;
}

export interface Ticket {
  id: string;
  property_id: string;
  tenant_id: string;
  titulo: string;
  descripcion: string;
  costo_estimado: number;
  moneda: Currency;
  urgencia: TicketUrgency;
  estado: TicketStatus;
  fecha_creacion: string;
  contratista_id?: string;
  factura_url?: string;
  fotos?: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface SuperAdmin {
  id: string;
  nombre_completo: string;
  email: string;
  password_hash?: string;
  foto_url?: string;
  rol: string;
  permisos: string[];
  fecha_creacion: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_type: UserRole;
  user_name: string;
  accion: string;
  descripcion: string;
  fecha: string;
  detalles?: Record<string, unknown>;
  created_at?: Date;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    nombre_completo: string;
    role: UserRole;
  };
}

export interface RegisterOwnerRequest {
  nombre_completo: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
