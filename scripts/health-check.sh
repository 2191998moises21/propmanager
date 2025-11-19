#!/bin/bash

###############################################################################
# PropManager - Health Check Script
#
# Este script verifica el estado de todos los servicios de PropManager
#
# Uso: ./scripts/health-check.sh
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Configuración
PROJECT_ID="propmanager-production-478716"
REGION="us-central1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PropManager - Health Check"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configurar proyecto
gcloud config set project $PROJECT_ID --quiet

###############################################################################
# 1. Cloud Run Services
###############################################################################
echo "=== Cloud Run Services ==="
echo ""

# Backend
log_info "Verificando Backend..."
BACKEND_URL=$(gcloud run services describe propmanager-backend \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
    log_error "Backend no está desplegado"
    BACKEND_OK=false
else
    log_success "Backend desplegado: $BACKEND_URL"

    # Health check HTTP
    if curl -f -s "$BACKEND_URL/api/v1/health" > /dev/null; then
        log_success "Backend health check OK"
        BACKEND_OK=true
    else
        log_error "Backend health check falló"
        BACKEND_OK=false
    fi
fi

echo ""

# Frontend
log_info "Verificando Frontend..."
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
    --region=$REGION \
    --format="value(status.url)" 2>/dev/null || echo "")

if [ -z "$FRONTEND_URL" ]; then
    log_error "Frontend no está desplegado"
    FRONTEND_OK=false
else
    log_success "Frontend desplegado: $FRONTEND_URL"

    # Health check HTTP
    if curl -f -s -I "$FRONTEND_URL" | grep -q "200\|301\|302"; then
        log_success "Frontend accesible"
        FRONTEND_OK=true
    else
        log_error "Frontend no responde"
        FRONTEND_OK=false
    fi
fi

echo ""

###############################################################################
# 2. Cloud SQL
###############################################################################
echo "=== Cloud SQL ==="
echo ""

log_info "Verificando Cloud SQL..."
DB_STATE=$(gcloud sql instances describe propmanager-db \
    --format="value(state)" 2>/dev/null || echo "NOT_FOUND")

if [ "$DB_STATE" == "RUNNABLE" ]; then
    log_success "Cloud SQL está ejecutándose"

    # Verificar conexiones
    CONNECTIONS=$(gcloud sql instances describe propmanager-db \
        --format="value(currentDiskSize)" 2>/dev/null || echo "0")

    log_info "Disk usage: $CONNECTIONS"

    DB_OK=true
elif [ "$DB_STATE" == "NOT_FOUND" ]; then
    log_error "Cloud SQL no está creado"
    DB_OK=false
else
    log_warning "Cloud SQL en estado: $DB_STATE"
    DB_OK=false
fi

echo ""

###############################################################################
# 3. Cloud Storage
###############################################################################
echo "=== Cloud Storage ==="
echo ""

log_info "Verificando buckets..."
if gsutil ls -b gs://propmanager-uploads &> /dev/null; then
    log_success "Bucket de uploads existe"

    # Verificar uso
    SIZE=$(gsutil du -s gs://propmanager-uploads 2>/dev/null | awk '{print $1}')
    SIZE_MB=$((SIZE / 1024 / 1024))
    log_info "Uso del bucket: ${SIZE_MB} MB"

    STORAGE_OK=true
else
    log_error "Bucket de uploads no existe"
    STORAGE_OK=false
fi

echo ""

###############################################################################
# 4. Secrets
###############################################################################
echo "=== Secret Manager ==="
echo ""

log_info "Verificando secrets..."
SECRETS_OK=true

if gcloud secrets describe propmanager-db-password &> /dev/null; then
    log_success "Secret de DB password existe"
else
    log_error "Secret de DB password no existe"
    SECRETS_OK=false
fi

if gcloud secrets describe jwt-secret &> /dev/null; then
    log_success "Secret de JWT existe"
else
    log_error "Secret de JWT no existe"
    SECRETS_OK=false
fi

echo ""

###############################################################################
# 5. Recent Errors
###############################################################################
echo "=== Errores Recientes (última hora) ==="
echo ""

ERROR_COUNT=$(gcloud logging read \
    "resource.type=cloud_run_revision AND severity>=ERROR AND timestamp>\"$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%SZ')\"" \
    --limit=1000 \
    --format="value(timestamp)" 2>/dev/null | wc -l)

if [ "$ERROR_COUNT" -eq 0 ]; then
    log_success "No hay errores en la última hora"
elif [ "$ERROR_COUNT" -lt 10 ]; then
    log_warning "$ERROR_COUNT errores en la última hora"
else
    log_error "$ERROR_COUNT errores en la última hora (revisar logs)"
fi

echo ""

###############################################################################
# 6. Builds Recientes
###############################################################################
echo "=== Builds Recientes ==="
echo ""

LATEST_BUILD=$(gcloud builds list --limit=1 --format="value(status)" 2>/dev/null || echo "NONE")

if [ "$LATEST_BUILD" == "SUCCESS" ]; then
    log_success "Último build exitoso"
elif [ "$LATEST_BUILD" == "FAILURE" ]; then
    log_error "Último build falló"
elif [ "$LATEST_BUILD" == "WORKING" ]; then
    log_info "Build en progreso"
else
    log_warning "No hay builds recientes"
fi

echo ""

###############################################################################
# RESUMEN
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RESUMEN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ALL_OK=true

if [ "$BACKEND_OK" = true ]; then
    log_success "Backend: OK"
else
    log_error "Backend: FAIL"
    ALL_OK=false
fi

if [ "$FRONTEND_OK" = true ]; then
    log_success "Frontend: OK"
else
    log_error "Frontend: FAIL"
    ALL_OK=false
fi

if [ "$DB_OK" = true ]; then
    log_success "Cloud SQL: OK"
else
    log_error "Cloud SQL: FAIL"
    ALL_OK=false
fi

if [ "$STORAGE_OK" = true ]; then
    log_success "Cloud Storage: OK"
else
    log_error "Cloud Storage: FAIL"
    ALL_OK=false
fi

if [ "$SECRETS_OK" = true ]; then
    log_success "Secrets: OK"
else
    log_error "Secrets: FAIL"
    ALL_OK=false
fi

echo ""

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ Todos los servicios están operacionales${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ Hay problemas con uno o más servicios${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
