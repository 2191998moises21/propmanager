#!/bin/bash

# ========================================
# Check Backend Deployment Status
# ========================================
# Verifies that the backend has been deployed with latest fixes

set -e

PROJECT_ID="propmanager-production-478716"
BACKEND_URL="https://propmanager-backend-340512713682.us-central1.run.app"

echo "========================================="
echo "Verificando Deployment del Backend"
echo "========================================="
echo ""

# Check if backend is responding
echo "1. Verificando que el backend responde..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/health" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Backend responde correctamente (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  Backend responde con código HTTP $HTTP_CODE"
fi
echo ""

# Check recent logs for the documento_url vs documento_id_url issue
echo "2. Verificando logs del backend..."
echo "   Buscando errores de 'documento_id_url' (código antiguo)..."
echo ""

LOGS=$(gcloud run services logs read propmanager-backend \
    --project=$PROJECT_ID \
    --region=us-central1 \
    --limit=50 \
    --format="value(textPayload,jsonPayload.message)" 2>/dev/null || echo "")

# Check for old column name error
if echo "$LOGS" | grep -q "documento_id_url"; then
    echo "   ❌ ENCONTRADO: El código antiguo aún está desplegado"
    echo "   Los logs muestran errores de 'documento_id_url'"
    echo ""
    echo "   Logs relevantes:"
    echo "$LOGS" | grep -A 2 -B 2 "documento_id_url" | head -20
    echo ""
    echo "   ⚠️  ACCIÓN REQUERIDA: El deployment no se aplicó correctamente"
    exit 1
elif echo "$LOGS" | grep -q "documento_url"; then
    echo "   ✅ El código usa 'documento_url' correctamente"
else
    echo "   ℹ️  No se encontraron referencias a documento_url/documento_id_url en logs recientes"
fi
echo ""

# Test the /tenants endpoint
echo "3. Probando endpoint /api/v1/tenants..."
TENANTS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/v1/tenants" || echo "HTTP_CODE:000")
TENANTS_HTTP_CODE=$(echo "$TENANTS_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
TENANTS_BODY=$(echo "$TENANTS_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$TENANTS_HTTP_CODE" = "200" ]; then
    echo "   ✅ /api/v1/tenants responde correctamente (HTTP $TENANTS_HTTP_CODE)"
    echo "   Número de inquilinos: $(echo "$TENANTS_BODY" | grep -o '"id"' | wc -l)"
elif [ "$TENANTS_HTTP_CODE" = "500" ]; then
    echo "   ❌ /api/v1/tenants responde con ERROR 500"
    echo "   Esto indica que el código antiguo (documento_id_url) sigue desplegado"
    echo ""
    echo "   Respuesta del servidor:"
    echo "$TENANTS_BODY" | head -20
    exit 1
else
    echo "   ⚠️  /api/v1/tenants responde con código HTTP $TENANTS_HTTP_CODE"
    echo "   Respuesta:"
    echo "$TENANTS_BODY" | head -10
fi
echo ""

# Check latest Cloud Build
echo "4. Verificando último build de Cloud Build..."
LATEST_BUILD=$(gcloud builds list \
    --project=$PROJECT_ID \
    --limit=1 \
    --format="value(id,status,createTime)")

BUILD_ID=$(echo "$LATEST_BUILD" | awk '{print $1}')
BUILD_STATUS=$(echo "$LATEST_BUILD" | awk '{print $2}')
BUILD_TIME=$(echo "$LATEST_BUILD" | awk '{print $3}')

echo "   Build ID: $BUILD_ID"
echo "   Status: $BUILD_STATUS"
echo "   Time: $BUILD_TIME"
echo ""

if [ "$BUILD_STATUS" = "SUCCESS" ]; then
    echo "   ✅ Último build completado exitosamente"
elif [ "$BUILD_STATUS" = "FAILURE" ]; then
    echo "   ❌ Último build falló"
    echo "   Ver logs: https://console.cloud.google.com/cloud-build/builds/$BUILD_ID?project=$PROJECT_ID"
    exit 1
else
    echo "   ℹ️  Estado del build: $BUILD_STATUS"
fi
echo ""

# Summary
echo "========================================="
echo "RESUMEN"
echo "========================================="
echo ""

if [ "$HTTP_CODE" = "200" ] && [ "$TENANTS_HTTP_CODE" = "200" ] && [ "$BUILD_STATUS" = "SUCCESS" ]; then
    echo "✅ ¡DEPLOYMENT EXITOSO!"
    echo ""
    echo "El backend está funcionando correctamente con los últimos cambios:"
    echo "  • Backend responde correctamente"
    echo "  • Endpoint /tenants funciona sin errores"
    echo "  • No se detectaron errores de documento_id_url"
    echo "  • Último build completado exitosamente"
    echo ""
    echo "Puedes probar la aplicación en:"
    echo "  Frontend: https://propmanager-frontend-340512713682.us-central1.run.app"
    echo "  Backend: $BACKEND_URL"
else
    echo "⚠️ HAY PROBLEMAS CON EL DEPLOYMENT"
    echo ""
    echo "Por favor revisa los mensajes anteriores para más detalles."
fi
echo ""
