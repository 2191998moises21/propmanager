#!/bin/bash

###############################################################################
# PropManager - Manual Backup Script
#
# Este script crea un backup manual de la base de datos
#
# Uso: ./scripts/backup.sh [description]
#   description: Descripción opcional del backup
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
DB_INSTANCE="propmanager-db"
DESCRIPTION=${1:-"Manual backup $(date '+%Y-%m-%d %H:%M:%S')"}

echo ""
log_info "=== PropManager Manual Backup ==="
log_info "Instance: $DB_INSTANCE"
log_info "Description: $DESCRIPTION"
echo ""

# Configurar proyecto
gcloud config set project $PROJECT_ID --quiet

# Crear backup
log_info "Creando backup..."
gcloud sql backups create \
    --instance=$DB_INSTANCE \
    --description="$DESCRIPTION"

log_success "Backup creado exitosamente"

# Listar backups recientes
echo ""
log_info "Backups recientes:"
gcloud sql backups list \
    --instance=$DB_INSTANCE \
    --limit=5

echo ""
log_success "Backup completado"
log_info "Para restaurar este backup, usa:"
echo "  gcloud sql backups restore BACKUP_ID --backup-instance=$DB_INSTANCE"
echo ""
