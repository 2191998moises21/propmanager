#!/bin/bash

# ========================================
# Check Database Tables Script
# ========================================
# Verifica si las tablas necesarias existen en la base de datos

set -e

PROJECT_ID="propmanager-production-478716"
INSTANCE_NAME="propmanager-db"
DB_NAME="propmanager"
DB_USER="propmanager-user"

echo "========================================="
echo "Verificando Tablas de Base de Datos"
echo "========================================="
echo ""
echo "Conectando a la base de datos..."
echo ""

# Create a single SQL query to check all tables at once
gcloud sql connect $INSTANCE_NAME \
    --user=$DB_USER \
    --database=$DB_NAME \
    --project=$PROJECT_ID <<'EOSQL'

-- Check for notifications table
SELECT
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'notifications'
        ) THEN '✅ Tabla notifications: EXISTE'
        ELSE '❌ Tabla notifications: NO EXISTE - Aplicar backend/migrations/add_notifications_table.sql'
    END as status;

-- Check for password_reset_tokens table
SELECT
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'password_reset_tokens'
        ) THEN '✅ Tabla password_reset_tokens: EXISTE'
        ELSE '❌ Tabla password_reset_tokens: NO EXISTE - Aplicar backend/migrations/add_token_tables.sql'
    END as status;

-- Check for refresh_tokens table
SELECT
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'refresh_tokens'
        ) THEN '✅ Tabla refresh_tokens: EXISTE'
        ELSE '❌ Tabla refresh_tokens: NO EXISTE - Aplicar backend/migrations/add_token_tables.sql'
    END as status;

\q
EOSQL

echo ""
echo "========================================="
echo "INSTRUCCIONES"
echo "========================================="
echo ""
echo "Si alguna tabla falta, aplica las migraciones con:"
echo "  ./scripts/apply-migration.sh backend/migrations/add_notifications_table.sql"
echo "  ./scripts/apply-migration.sh backend/migrations/add_token_tables.sql"
echo ""
