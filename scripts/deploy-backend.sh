#!/bin/bash

###############################################################################
# PropManager - Backend Deployment Script
#
# Este script despliega el backend de PropManager en Cloud Run
#
# Uso: ./scripts/deploy-backend.sh [environment]
#   environment: production (default) | staging
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
ENV=${1:-production}
PROJECT_ID="propmanager-production-478716"
REGION="us-central1"
SERVICE_NAME="propmanager-backend"

echo ""
log_info "=== PropManager Backend Deployment ==="
log_info "Environment: $ENV"
log_info "Project: $PROJECT_ID"
log_info "Region: $REGION"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/package.json" ]; then
    log_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Configurar proyecto
log_info "Configurando proyecto..."
gcloud config set project $PROJECT_ID

# Verificar que las APIs están habilitadas
log_info "Verificando APIs necesarias..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com --quiet

# Build y deploy usando Cloud Build
log_info "Iniciando build y deployment..."
echo ""

# Obtener commit SHA actual
COMMIT_SHA=$(git rev-parse --short HEAD)
log_info "Commit SHA: $COMMIT_SHA"

gcloud builds submit \
    --config=backend/cloudbuild.yaml \
    --substitutions=COMMIT_SHA="$COMMIT_SHA",_CLOUD_SQL_CONNECTION="$PROJECT_ID:$REGION:propmanager-db",_DB_SOCKET_PATH="/cloudsql/$PROJECT_ID:$REGION:propmanager-db",_DB_NAME="propmanager",_DB_USER="propmanager-user"

# Obtener URL del servicio
log_info "Obteniendo URL del servicio..."
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Backend desplegado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL del Backend: $BACKEND_URL"
echo "Health Check: $BACKEND_URL/api/v1/health"
echo ""

# Health check
log_info "Verificando health check..."
sleep 5  # Esperar a que el servicio esté listo

if curl -f -s "$BACKEND_URL/api/v1/health" > /dev/null; then
    log_success "Health check OK ✓"
else
    log_warning "Health check falló. El servicio puede tardar unos minutos en estar listo."
fi

echo ""
log_info "Ver logs:"
echo "  gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50"
echo ""
log_info "Monitorear servicio:"
echo "  https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME?project=$PROJECT_ID"
echo ""
