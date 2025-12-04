#!/bin/bash

# Script para aplicar migración de base de datos en Cloud SQL
# Ejecutar desde la raíz del proyecto: ./scripts/apply-migration.sh

set -e

echo "🔧 Aplicando migración de base de datos a Cloud SQL..."
echo ""

# Variables
PROJECT_ID="propmanager-production-478716"
INSTANCE_NAME="propmanager-db"
DB_NAME="propmanager"
DB_USER="propmanager-user"
REGION="us-central1"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📊 Información de conexión:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Instance: $INSTANCE_NAME"
echo "  Database: $DB_NAME"
echo ""

# Verificar que el archivo de migración existe
if [ ! -f "backend/migrations/add_token_tables.sql" ]; then
    echo "❌ Error: No se encuentra el archivo de migración"
    exit 1
fi

echo -e "${YELLOW}🔐 Solicitando contraseña de base de datos...${NC}"
echo "Ingresa la contraseña de la base de datos:"
read -s DB_PASSWORD
echo ""

# Crear archivo temporal con las credenciales
PGPASSWORD_FILE=$(mktemp)
echo "$DB_PASSWORD" > "$PGPASSWORD_FILE"

echo -e "${YELLOW}📡 Conectando a Cloud SQL...${NC}"

# Usar Cloud SQL Proxy para conectar
gcloud sql connect $INSTANCE_NAME \
    --user=$DB_USER \
    --database=$DB_NAME \
    --project=$PROJECT_ID \
    < backend/migrations/add_token_tables.sql

# Limpiar archivo temporal
rm -f "$PGPASSWORD_FILE"

echo ""
echo -e "${GREEN}✅ Migración aplicada exitosamente!${NC}"
echo ""
echo "Tablas agregadas:"
echo "  ✓ password_reset_tokens (con 5 índices)"
echo "  ✓ refresh_tokens (con 4 índices)"
echo ""
echo "🎉 Base de datos actualizada y lista para producción!"
