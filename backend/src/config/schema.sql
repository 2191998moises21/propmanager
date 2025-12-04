-- ========================================
-- PropManager Database Schema
-- PostgreSQL 14+
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE property_type AS ENUM ('casa', 'apartamento', 'local', 'oficina', 'bodega');
CREATE TYPE currency AS ENUM ('USD');
CREATE TYPE occupancy_status AS ENUM ('disponible', 'ocupada', 'mantenimiento');
CREATE TYPE contract_status AS ENUM ('activo', 'vencido', 'terminado', 'renovado');
CREATE TYPE payment_status AS ENUM ('pendiente', 'pagado', 'atrasado', 'parcial', 'en revisión');
CREATE TYPE payment_method AS ENUM ('efectivo', 'transferencia', 'cheque', 'tarjeta', 'deposito');
CREATE TYPE ticket_status AS ENUM ('abierto', 'en progreso', 'cerrado');
CREATE TYPE ticket_urgency AS ENUM ('baja', 'media', 'alta');
CREATE TYPE user_status AS ENUM ('activo', 'suspendido', 'inactivo');
CREATE TYPE user_role AS ENUM ('owner', 'tenant', 'superadmin');

-- ========================================
-- TABLES
-- ========================================

-- Owners table
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100),
    codigo_postal VARCHAR(20),
    tipo_propiedad property_type NOT NULL,
    area_m2 DECIMAL(10,2) NOT NULL,
    habitaciones INTEGER NOT NULL,
    banos INTEGER NOT NULL,
    estacionamientos INTEGER DEFAULT 0,
    precio_alquiler DECIMAL(12,2) NOT NULL,
    moneda currency DEFAULT 'USD',
    estado_ocupacion occupancy_status DEFAULT 'disponible',
    fecha_disponible DATE,
    deposito_requerido DECIMAL(12,2),
    amenidades TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    documento_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    foto_url TEXT,
    documento_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    monto_mensual DECIMAL(12,2) NOT NULL,
    moneda currency DEFAULT 'USD',
    dia_pago INTEGER NOT NULL CHECK (dia_pago >= 1 AND dia_pago <= 31),
    estado_contrato contract_status DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (fecha_fin > fecha_inicio)
);

-- Contract Documents table
CREATE TABLE contract_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    mes_correspondiente DATE NOT NULL,
    monto_pago DECIMAL(12,2) NOT NULL,
    fecha_pago DATE,
    metodo_pago payment_method,
    estado_pago payment_status DEFAULT 'pendiente',
    referencia VARCHAR(255),
    comprobante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contractors table
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    costo_estimado DECIMAL(12,2) DEFAULT 0,
    moneda currency DEFAULT 'USD',
    urgencia ticket_urgency DEFAULT 'media',
    estado ticket_status DEFAULT 'abierto',
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    contratista_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    factura_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Photos table
CREATE TABLE ticket_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Super Admins table
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    foto_url TEXT,
    rol VARCHAR(50) DEFAULT 'superadmin',
    permisos JSONB DEFAULT '[]'::jsonb,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_type user_role NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_role user_role NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'payment', 'ticket', 'contract', 'system', 'maintenance'
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    url TEXT, -- Optional link to related resource
    metadata JSONB, -- Additional data (payment_id, ticket_id, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_role user_role NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_role user_role NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES
-- ========================================

-- Owners
CREATE INDEX idx_owners_email ON owners(email);

-- Properties
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_estado_ocupacion ON properties(estado_ocupacion);
CREATE INDEX idx_properties_ciudad ON properties(ciudad);

-- Tenants
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_documento_id ON tenants(documento_id);

-- Contracts
CREATE INDEX idx_contracts_property_id ON contracts(property_id);
CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_estado ON contracts(estado_contrato);
CREATE INDEX idx_contracts_dates ON contracts(fecha_inicio, fecha_fin);

-- Payments
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_estado ON payments(estado_pago);
CREATE INDEX idx_payments_mes ON payments(mes_correspondiente);

-- Tickets
CREATE INDEX idx_tickets_property_id ON tickets(property_id);
CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX idx_tickets_estado ON tickets(estado);
CREATE INDEX idx_tickets_urgencia ON tickets(urgencia);

-- Activity Logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_user_type ON activity_logs(user_type);
CREATE INDEX idx_activity_logs_fecha ON activity_logs(fecha);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_role ON notifications(user_role);
CREATE INDEX idx_notifications_leido ON notifications(leido);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Password Reset Tokens
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);

-- ========================================
-- TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON super_admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (for development)
-- ========================================

-- Insert sample owner
INSERT INTO owners (nombre_completo, email, password_hash, telefono, direccion)
VALUES ('Carlos Propietario', 'carlos.prop@email.com', '$2a$10$rOzL1q8QY7jKB5jV5P5/8.xCVKZ4Q9oGj7PzQYZVKx7YZxL8Q9oGj', '+1234567890', '123 Main St');

-- Insert sample tenant
INSERT INTO tenants (nombre_completo, documento_id, email, password_hash, telefono)
VALUES ('Maria Rodriguez', 'DOC-12345', 'maria.r@email.com', '$2a$10$rOzL1q8QY7jKB5jV5P5/8.xCVKZ4Q9oGj7PzQYZVKx7YZxL8Q9oGj', '+0987654321');
