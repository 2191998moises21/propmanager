#!/bin/bash

# Script para crear/actualizar el secret de JWT_REFRESH_SECRET en Secret Manager
# Ejecutar desde la raíz del proyecto: ./scripts/setup-refresh-secret.sh

set -e

echo "🔐 Configurando JWT_REFRESH_SECRET en Secret Manager..."
echo ""

# Variables
PROJECT_ID="propmanager-production-478716"
SECRET_NAME="jwt-refresh-secret"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Generar un JWT secret seguro (64 caracteres)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)

echo -e "${BLUE}🔑 JWT Refresh Secret generado:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$JWT_REFRESH_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  GUARDA ESTE SECRET EN UN LUGAR SEGURO ⚠️${NC}"
echo ""
read -p "Presiona Enter para continuar y guardar en Secret Manager..."

# Verificar si el secret ya existe
if gcloud secrets describe $SECRET_NAME --project=$PROJECT_ID &>/dev/null; then
    echo -e "${YELLOW}Secret $SECRET_NAME ya existe. Actualizando...${NC}"
    echo -n "$JWT_REFRESH_SECRET" | gcloud secrets versions add $SECRET_NAME \
        --data-file=- \
        --project=$PROJECT_ID
else
    echo -e "${YELLOW}Creando secret $SECRET_NAME...${NC}"
    echo -n "$JWT_REFRESH_SECRET" | gcloud secrets create $SECRET_NAME \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID
fi

# Dar permisos a la cuenta de servicio de Cloud Run
COMPUTE_SA="340512713682-compute@developer.gserviceaccount.com"

echo -e "${YELLOW}Configurando permisos...${NC}"
gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID \
    > /dev/null

echo ""
echo -e "${GREEN}✅ JWT_REFRESH_SECRET configurado exitosamente!${NC}"
echo ""
echo "El secret está disponible en:"
echo "  projects/$PROJECT_ID/secrets/$SECRET_NAME"
echo ""
echo "🎉 Listo para deployment!"
