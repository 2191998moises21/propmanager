-- Migration: Add notifications table
-- Date: 2025-12-04
-- Description: Adds notifications table for user notifications system

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
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

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_role ON notifications(user_role);
CREATE INDEX IF NOT EXISTS idx_notifications_leido ON notifications(leido);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
