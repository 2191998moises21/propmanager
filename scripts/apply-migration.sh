#!/bin/bash

# ========================================
# Script para aplicar migración de base de datos en Cloud SQL
# ========================================
# Uso: ./scripts/apply-migration.sh <archivo_migracion.sql>
# Ejemplo: ./scripts/apply-migration.sh backend/migrations/add_token_tables.sql

set -e

# Verificar que se pasó un archivo como argumento
if [ $# -eq 0 ]; then
    echo "❌ Error: Debes especificar el archivo de migración"
    echo ""
    echo "Uso: $0 <archivo_migracion.sql>"
    echo ""
    echo "Ejemplos:"
    echo "  $0 backend/migrations/add_token_tables.sql"
    echo "  $0 backend/migrations/add_notifications_table.sql"
    exit 1
fi

MIGRATION_FILE="$1"

echo "🔧 Aplicando migración de base de datos a Cloud SQL..."
echo ""

# Variables
PROJECT_ID="propmanager-production-478716"
INSTANCE_NAME="propmanager-db"
DB_NAME="propmanager"
DB_USER="propmanager-user"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que el archivo de migración existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo de migración: $MIGRATION_FILE"
    exit 1
fi

echo -e "${YELLOW}📊 Información de conexión:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Instance: $INSTANCE_NAME"
echo "  Database: $DB_NAME"
echo "  Migration: $MIGRATION_FILE"
echo ""

echo -e "${YELLOW}📡 Conectando a Cloud SQL y aplicando migración...${NC}"
echo ""

# Usar Cloud SQL Proxy para conectar
gcloud sql connect $INSTANCE_NAME \
    --user=$DB_USER \
    --database=$DB_NAME \
    --project=$PROJECT_ID \
    < "$MIGRATION_FILE"

echo ""
echo -e "${GREEN}✅ Migración aplicada exitosamente!${NC}"
echo ""
echo "Archivo aplicado: $MIGRATION_FILE"
echo ""
echo "🎉 Base de datos actualizada!"
