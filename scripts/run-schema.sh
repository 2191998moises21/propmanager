#!/bin/bash

###############################################################################
# PropManager - Run SQL Schema Script
#
# Este script ejecuta el schema SQL en Cloud SQL
#
# Uso: ./scripts/run-schema.sh
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuración
PROJECT_ID="propmanager-production-478716"
REGION="us-central1"
DB_INSTANCE="propmanager-db"
DB_NAME="propmanager"
DB_USER="propmanager-user"
SCHEMA_FILE="backend/src/config/schema.sql"

echo ""
log_info "=== PropManager SQL Schema Execution ==="
log_info "Instance: $DB_INSTANCE"
log_info "Database: $DB_NAME"
log_info "Schema file: $SCHEMA_FILE"
echo ""

# Verificar que el archivo existe
if [ ! -f "$SCHEMA_FILE" ]; then
    log_error "Schema file no encontrado: $SCHEMA_FILE"
    exit 1
fi

# Configurar proyecto
gcloud config set project $PROJECT_ID --quiet

log_warning "Este script ejecutará el schema SQL en la base de datos."
log_warning "Si la base de datos ya tiene datos, esto puede causar errores."
echo ""
read -p "¿Deseas continuar? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Cancelado por el usuario"
    exit 0
fi

# Obtener contraseña desde Secret Manager
log_info "Obteniendo contraseña desde Secret Manager..."
DB_PASSWORD=$(gcloud secrets versions access latest --secret=propmanager-db-password)

# Opciones de ejecución
echo ""
echo "Selecciona el método de ejecución:"
echo "  1) Cloud SQL Proxy (recomendado)"
echo "  2) gcloud sql connect"
echo ""
read -p "Opción (1 o 2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    # Cloud SQL Proxy
    log_info "Usando Cloud SQL Proxy..."

    # Verificar si cloud-sql-proxy está instalado
    if ! command -v cloud-sql-proxy &> /dev/null; then
        log_error "cloud-sql-proxy no está instalado"
        log_info "Descarga desde: https://cloud.google.com/sql/docs/mysql/sql-proxy#install"
        exit 1
    fi

    # Verificar si psql está instalado
    if ! command -v psql &> /dev/null; then
        log_error "psql no está instalado"
        log_info "Instala PostgreSQL client"
        exit 1
    fi

    log_info "Iniciando Cloud SQL Proxy..."
    cloud-sql-proxy "$PROJECT_ID:$REGION:$DB_INSTANCE" &
    PROXY_PID=$!

    # Esperar a que el proxy esté listo
    sleep 5

    log_info "Ejecutando schema..."
    PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -U $DB_USER -d $DB_NAME -f $SCHEMA_FILE

    # Detener proxy
    kill $PROXY_PID

    log_success "Schema ejecutado exitosamente"

elif [[ $REPLY == "2" ]]; then
    # gcloud sql connect
    log_info "Usando gcloud sql connect..."
    log_warning "Tendrás que pegar el contenido del schema manualmente"
    echo ""
    log_info "Contraseña: $DB_PASSWORD"
    echo ""
    log_info "Una vez conectado, ejecuta:"
    echo "  \\c $DB_NAME"
    echo "  \\i $SCHEMA_FILE"
    echo ""
    read -p "Presiona Enter para continuar..."

    gcloud sql connect $DB_INSTANCE --user=$DB_USER

else
    log_error "Opción inválida"
    exit 1
fi

echo ""
log_success "Schema ejecutado"
log_info "Verifica las tablas:"
echo "  gcloud sql connect $DB_INSTANCE --user=$DB_USER"
echo "  \\c $DB_NAME"
echo "  \\dt"
echo ""
