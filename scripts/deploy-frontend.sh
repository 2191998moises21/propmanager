#!/bin/bash

###############################################################################
# PropManager - Frontend Deployment Script
#
# Este script despliega el frontend de PropManager en Cloud Run
#
# Uso: ./scripts/deploy-frontend.sh [backend_url]
#   backend_url: URL del backend API (opcional, se detecta automáticamente)
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
SERVICE_NAME="propmanager-frontend"
BACKEND_SERVICE="propmanager-backend"

echo ""
log_info "=== PropManager Frontend Deployment ==="
log_info "Project: $PROJECT_ID"
log_info "Region: $REGION"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Configurar proyecto
log_info "Configurando proyecto..."
gcloud config set project $PROJECT_ID

# Obtener URL del backend
if [ -z "$1" ]; then
    log_info "Obteniendo URL del backend..."
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
        --region=$REGION \
        --format="value(status.url)" 2>/dev/null || echo "")

    if [ -z "$BACKEND_URL" ]; then
        log_error "No se pudo obtener la URL del backend. Por favor, despliega el backend primero o proporciona la URL como argumento."
        exit 1
    fi
    API_URL="$BACKEND_URL/api/v1"
else
    API_URL="$1"
fi

log_success "Backend API URL: $API_URL"

# Verificar que las APIs están habilitadas
log_info "Verificando APIs necesarias..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --quiet

# Build y deploy usando Cloud Build
log_info "Iniciando build y deployment..."
echo ""

# Obtener commit SHA actual
COMMIT_SHA=$(git rev-parse --short HEAD)
if [ -z "$COMMIT_SHA" ]; then
    log_error "Failed to get git commit SHA"
    exit 1
fi
log_info "Commit SHA: $COMMIT_SHA"

# Validar variables requeridas
if [ -z "$PROJECT_ID" ]; then
    log_error "PROJECT_ID is not set"
    exit 1
fi

if [ -z "$REGION" ]; then
    log_error "REGION is not set"
    exit 1
fi

if [ -z "$API_URL" ]; then
    log_error "API_URL is not set"
    exit 1
fi

gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_COMMIT_SHA="$COMMIT_SHA",_API_URL="$API_URL"

# Obtener URL del servicio
log_info "Obteniendo URL del servicio..."
FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Frontend desplegado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL del Frontend: $FRONTEND_URL"
echo "Backend API: $API_URL"
echo ""

# Actualizar CORS en el backend
log_info "Actualizando CORS en el backend..."
gcloud run services update $BACKEND_SERVICE \
    --region=$REGION \
    --update-env-vars=CORS_ORIGIN="$FRONTEND_URL,https://propmanager.com,https://www.propmanager.com" \
    --quiet

log_success "CORS actualizado"

echo ""
log_info "Próximos pasos:"
echo "  1. Visita: $FRONTEND_URL"
echo "  2. Prueba el login con las credenciales de prueba"
echo "  3. Configura tu dominio personalizado si lo deseas"
echo ""
log_info "Ver logs:"
echo "  gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50"
echo ""
