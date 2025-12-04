#!/bin/bash

# Script de verificación post-deployment
# Ejecutar después de deployar backend y frontend

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 PropManager - Verificación de Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# URLs
BACKEND_URL="https://propmanager-backend-340512713682.us-central1.run.app"
FRONTEND_URL="https://propmanager-frontend-340512713682.us-central1.run.app"

# Función para verificar
check() {
    local name=$1
    local url=$2

    echo -ne "  Verificando ${name}... "

    if curl -f -s "${url}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# Verificaciones
echo -e "${YELLOW}1. Verificando Backend${NC}"
check "Health Check" "${BACKEND_URL}/api/v1/health"

echo ""
echo -e "${YELLOW}2. Verificando nuevos endpoints${NC}"
# Estos deben devolver 400 (validation error), no 404
echo -ne "  /auth/forgot-password... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BACKEND_URL}/api/v1/auth/forgot-password")
if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ OK (endpoint exists)${NC}"
else
    echo -e "${RED}✗ FAIL (got $STATUS, expected 400)${NC}"
fi

echo -ne "  /auth/refresh... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BACKEND_URL}/api/v1/auth/refresh")
if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ OK (endpoint exists)${NC}"
else
    echo -e "${RED}✗ FAIL (got $STATUS, expected 400)${NC}"
fi

echo -ne "  /auth/logout... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BACKEND_URL}/api/v1/auth/logout")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ OK (endpoint exists)${NC}"
else
    echo -e "${RED}✗ FAIL (got $STATUS, expected 200)${NC}"
fi

echo ""
echo -e "${YELLOW}3. Verificando Frontend${NC}"
check "Frontend Home" "${FRONTEND_URL}"
check "Login Page" "${FRONTEND_URL}/login"
check "Forgot Password" "${FRONTEND_URL}/forgot-password"

echo ""
echo -e "${YELLOW}4. Verificando CORS${NC}"
echo -ne "  CORS Headers... "
CORS_HEADER=$(curl -s -I -X OPTIONS "${BACKEND_URL}/api/v1/health" | grep -i "access-control-allow-origin" || echo "")
if [ ! -z "$CORS_HEADER" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Warning (may be OK if not needed)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Verificación completada!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "URLs de producción:"
echo "  Frontend: ${FRONTEND_URL}"
echo "  Backend:  ${BACKEND_URL}"
echo "  API Docs: ${BACKEND_URL}/api/v1/health"
echo ""
echo "Pruebas manuales recomendadas:"
echo "  1. Login en: ${FRONTEND_URL}/login"
echo "  2. Recuperación: ${FRONTEND_URL}/forgot-password"
echo "  3. Crear propiedad y verificar paginación"
echo "  4. Verificar toast notifications (no alerts)"
echo ""
