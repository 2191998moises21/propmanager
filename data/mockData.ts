
import { Property, Tenant, Contract, Payment, PropertyType, Currency, OccupancyStatus, ContractStatus, PaymentStatus, PaymentMethod } from '../types';

export const mockProperties: Property[] = [
  {
    id: 'prop1',
    title: 'Av. Libertador 123',
    direccion: 'Av. Libertador 123, Apto 5A',
    ciudad: 'Caracas',
    estado: 'Distrito Capital',
    tipo_propiedad: PropertyType.Apartamento,
    area_m2: 120,
    habitaciones: 3,
    banos: 2,
    estacionamientos: 2,
    precio_alquiler: 1200,
    moneda: Currency.USD,
    estado_ocupacion: OccupancyStatus.Ocupada,
    imageUrl: 'https://picsum.photos/seed/1/400/300',
  },
  {
    id: 'prop2',
    title: 'Calle 72, Edificio Miraflores',
    direccion: 'Calle 72, Edificio Miraflores',
    ciudad: 'Lima',
    tipo_propiedad: PropertyType.Oficina,
    area_m2: 80,
    habitaciones: 0,
    banos: 1,
    estacionamientos: 1,
    precio_alquiler: 3500,
    moneda: Currency.PEN,
    estado_ocupacion: OccupancyStatus.Disponible,
    fecha_disponible: '2024-08-01',
    imageUrl: 'https://picsum.photos/seed/2/400/300',
  },
  {
    id: 'prop3',
    title: 'Avenida Paulista, 2000',
    direccion: 'Avenida Paulista, 2000, Andar 10',
    ciudad: 'São Paulo',
    tipo_propiedad: PropertyType.Oficina,
    area_m2: 250,
    habitaciones: 0,
    banos: 3,
    estacionamientos: 5,
    precio_alquiler: 15000,
    moneda: Currency.BRL,
    estado_ocupacion: OccupancyStatus.Ocupada,
    imageUrl: 'https://picsum.photos/seed/3/400/300',
  },
  {
    id: 'prop4',
    title: 'Quinta Crespo, Galpón Industrial',
    direccion: 'Quinta Crespo, Galpón Industrial',
    ciudad: 'Caracas',
    tipo_propiedad: PropertyType.Bodega,
    area_m2: 500,
    habitaciones: 0,
    banos: 1,
    estacionamientos: 10,
    precio_alquiler: 2500,
    moneda: Currency.USD,
    estado_ocupacion: OccupancyStatus.Mantenimiento,
    imageUrl: 'https://picsum.photos/seed/4/400/300',
  },
  {
    id: 'prop5',
    title: 'Casa en La Molina',
    direccion: 'Calle Las Dalias 456, La Molina',
    ciudad: 'Lima',
    tipo_propiedad: PropertyType.Casa,
    area_m2: 300,
    habitaciones: 4,
    banos: 3,
    estacionamientos: 2,
    precio_alquiler: 2000,
    moneda: Currency.USD,
    estado_ocupacion: OccupancyStatus.Disponible,
    imageUrl: 'https://picsum.photos/seed/5/400/300',
  }
];

export const mockTenants: Tenant[] = [
  {
    id: 'ten1',
    nombre_completo: 'Maria Rodriguez',
    documento_id: 'V-12.345.678',
    email: 'maria.r@email.com',
    telefono: '+58 414-1234567',
    fotoUrl: 'https://i.pravatar.cc/150?u=maria'
  },
  {
    id: 'ten2',
    nombre_completo: 'Carlos Silva',
    documento_id: 'CPF 123.456.789-00',
    email: 'carlos.silva@email.com.br',
    telefono: '+55 11 98765-4321',
    fotoUrl: 'https://i.pravatar.cc/150?u=carlos'
  },
  {
    id: 'ten3',
    nombre_completo: 'Pedro Gonzales',
    documento_id: 'DNI 98765432',
    email: 'pedro.g@email.pe',
    telefono: '+51 987 654 321',
    fotoUrl: 'https://i.pravatar.cc/150?u=pedro'
  }
];

export const mockContracts: Contract[] = [
  {
    id: 'con1',
    title: 'Contrato Av. Libertador',
    propertyId: 'prop1',
    tenantId: 'ten1',
    fecha_inicio: '2023-01-15',
    fecha_fin: '2024-01-14',
    monto_mensual: 1200,
    moneda: Currency.USD,
    dia_pago: 5,
    estado_contrato: ContractStatus.Activo,
  },
  {
    id: 'con2',
    title: 'Contrato Avenida Paulista',
    propertyId: 'prop3',
    tenantId: 'ten2',
    fecha_inicio: '2022-06-01',
    fecha_fin: '2024-05-31',
    monto_mensual: 15000,
    moneda: Currency.BRL,
    dia_pago: 1,
    estado_contrato: ContractStatus.Vencido,
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'pay1',
    contractId: 'con1',
    mes_correspondiente: '2024-05-01',
    monto_pago: 1200,
    fecha_pago: '2024-05-04',
    metodo_pago: PaymentMethod.Transferencia,
    estado_pago: PaymentStatus.Pagado,
  },
  {
    id: 'pay2',
    contractId: 'con1',
    mes_correspondiente: '2024-06-01',
    monto_pago: 1200,
    fecha_pago: '2024-06-06',
    metodo_pago: PaymentMethod.Transferencia,
    estado_pago: PaymentStatus.Pagado,
  },
  {
    id: 'pay3',
    contractId: 'con1',
    mes_correspondiente: '2024-07-01',
    monto_pago: 1200,
    fecha_pago: '2024-07-01', // Dummy placeholder
    metodo_pago: PaymentMethod.Transferencia,
    estado_pago: PaymentStatus.Pendiente,
  },
   {
    id: 'pay4',
    contractId: 'con2',
    mes_correspondiente: '2024-04-01',
    monto_pago: 15000,
    fecha_pago: '2024-04-01',
    metodo_pago: PaymentMethod.Deposito,
    estado_pago: PaymentStatus.Pagado,
  },
  {
    id: 'pay5',
    contractId: 'con2',
    mes_correspondiente: '2024-05-01',
    monto_pago: 15000,
    fecha_pago: '2024-05-01', // Dummy placeholder
    metodo_pago: PaymentMethod.Deposito,
    estado_pago: PaymentStatus.Atrasado,
  }
];
