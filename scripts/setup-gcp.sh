#!/bin/bash

###############################################################################
# PropManager - Google Cloud Platform Setup Script
#
# Este script automatiza la configuración completa de Google Cloud Platform
# para PropManager.
#
# Uso: ./scripts/setup-gcp.sh
#
# Prerequisitos:
#  - Google Cloud SDK instalado y configurado
#  - Permisos de owner/editor en el proyecto
#  - Cuenta de billing configurada
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración del proyecto
PROJECT_ID="propmanager-production-478716"
PROJECT_NUMBER="340512713682"
REGION="us-central1"
DB_INSTANCE="propmanager-db"
DB_NAME="propmanager"
DB_USER="propmanager-user"

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 no está instalado. Por favor, instálalo primero."
        exit 1
    fi
}

# Verificar prerequisitos
log_info "Verificando prerequisitos..."
check_command gcloud
check_command openssl
log_success "Prerequisitos OK"

# Confirmación del usuario
echo ""
log_warning "Este script configurará PropManager en Google Cloud Platform"
log_warning "Proyecto: $PROJECT_ID"
log_warning "Región: $REGION"
echo ""
read -p "¿Deseas continuar? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Cancelado por el usuario"
    exit 0
fi

###############################################################################
# FASE 1: Configuración del Proyecto
###############################################################################
echo ""
log_info "=== FASE 1: Configuración del Proyecto ==="

log_info "Configurando proyecto $PROJECT_ID..."
gcloud config set project $PROJECT_ID
log_success "Proyecto configurado"

###############################################################################
# FASE 2: Habilitar APIs
###############################################################################
echo ""
log_info "=== FASE 2: Habilitando APIs ==="

APIS=(
    "run.googleapis.com"
    "sqladmin.googleapis.com"
    "cloudbuild.googleapis.com"
    "secretmanager.googleapis.com"
    "storage-api.googleapis.com"
    "storage-component.googleapis.com"
    "containerregistry.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "compute.googleapis.com"
    "logging.googleapis.com"
    "monitoring.googleapis.com"
)

for api in "${APIS[@]}"; do
    log_info "Habilitando $api..."
    gcloud services enable $api --quiet
done
log_success "Todas las APIs habilitadas"

###############################################################################
# FASE 3: Crear Cloud SQL
###############################################################################
echo ""
log_info "=== FASE 3: Configurando Cloud SQL ==="

# Verificar si la instancia ya existe
if gcloud sql instances describe $DB_INSTANCE &> /dev/null; then
    log_warning "La instancia $DB_INSTANCE ya existe. Saltando creación..."
else
    log_info "Creando instancia de Cloud SQL (esto puede tomar 10-15 minutos)..."
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=04 \
        --maintenance-release-channel=production \
        --availability-type=zonal
    log_success "Instancia de Cloud SQL creada"
fi

# Crear base de datos
log_info "Creando base de datos $DB_NAME..."
if gcloud sql databases describe $DB_NAME --instance=$DB_INSTANCE &> /dev/null; then
    log_warning "Base de datos $DB_NAME ya existe"
else
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
    log_success "Base de datos creada"
fi

# Generar contraseña segura
DB_PASSWORD=$(openssl rand -base64 32)
echo ""
log_success "Contraseña de base de datos generada:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DB_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_warning "⚠️  GUARDA ESTA CONTRASEÑA EN UN LUGAR SEGURO ⚠️"
echo ""
read -p "Presiona Enter cuando hayas guardado la contraseña..."

# Crear usuario
log_info "Creando usuario $DB_USER..."
if gcloud sql users list --instance=$DB_INSTANCE | grep -q $DB_USER; then
    log_warning "Usuario $DB_USER ya existe. Actualizando contraseña..."
    gcloud sql users set-password $DB_USER \
        --instance=$DB_INSTANCE \
        --password="$DB_PASSWORD"
else
    gcloud sql users create $DB_USER \
        --instance=$DB_INSTANCE \
        --password="$DB_PASSWORD"
fi
log_success "Usuario de base de datos configurado"

###############################################################################
# FASE 4: Secret Manager
###############################################################################
echo ""
log_info "=== FASE 4: Configurando Secret Manager ==="

# Secret para DB password
log_info "Creando secret para contraseña de base de datos..."
if gcloud secrets describe propmanager-db-password &> /dev/null; then
    log_warning "Secret propmanager-db-password ya existe. Actualizando..."
    echo -n "$DB_PASSWORD" | gcloud secrets versions add propmanager-db-password --data-file=-
else
    echo -n "$DB_PASSWORD" | gcloud secrets create propmanager-db-password \
        --data-file=- \
        --replication-policy=automatic \
        --labels=env=production,app=propmanager
fi
log_success "Secret de DB password configurado"

# Generar JWT secret
JWT_SECRET=$(openssl rand -base64 64)
log_info "Creando secret para JWT..."
if gcloud secrets describe jwt-secret &> /dev/null; then
    log_warning "Secret jwt-secret ya existe. Actualizando..."
    echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-
else
    echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret \
        --data-file=- \
        --replication-policy=automatic \
        --labels=env=production,app=propmanager
fi
log_success "Secret de JWT configurado"

# Dar permisos
log_info "Configurando permisos de Secret Manager..."
gcloud secrets add-iam-policy-binding propmanager-db-password \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

gcloud secrets add-iam-policy-binding jwt-secret \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet
log_success "Permisos de Secret Manager configurados"

###############################################################################
# FASE 5: Cloud Storage
###############################################################################
echo ""
log_info "=== FASE 5: Configurando Cloud Storage ==="

# Bucket para uploads
log_info "Creando bucket para uploads..."
if gsutil ls -b gs://propmanager-uploads &> /dev/null; then
    log_warning "Bucket propmanager-uploads ya existe"
else
    gsutil mb -p $PROJECT_ID \
        -c STANDARD \
        -l $REGION \
        -b on \
        gs://propmanager-uploads

    # Configurar versionamiento
    gsutil versioning set on gs://propmanager-uploads

    log_success "Bucket de uploads creado"
fi

# Configurar CORS
log_info "Configurando CORS..."
if [ -f "cors.json" ]; then
    gsutil cors set cors.json gs://propmanager-uploads
    log_success "CORS configurado"
else
    log_warning "Archivo cors.json no encontrado. Saltando configuración de CORS."
fi

###############################################################################
# FASE 6: Información de Conexión
###############################################################################
echo ""
log_info "=== FASE 6: Información de Conexión ==="

CONNECTION_NAME="$PROJECT_ID:$REGION:$DB_INSTANCE"
log_success "Cloud SQL Connection Name: $CONNECTION_NAME"

###############################################################################
# RESUMEN
###############################################################################
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "Configuración de GCP completada exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Ejecutar el schema SQL en la base de datos:"
echo "   ./scripts/run-schema.sh"
echo ""
echo "2. Desplegar el backend:"
echo "   ./scripts/deploy-backend.sh"
echo ""
echo "3. Desplegar el frontend:"
echo "   ./scripts/deploy-frontend.sh"
echo ""
echo "4. Configurar CI/CD triggers en Cloud Build:"
echo "   https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
echo ""
echo "Información importante guardada:"
echo "  - DB Password: (guardado en Secret Manager)"
echo "  - JWT Secret: (guardado en Secret Manager)"
echo "  - Connection Name: $CONNECTION_NAME"
echo ""
log_warning "⚠️  Guarda esta información en tu password manager ⚠️"
echo ""
