#!/bin/bash

# ============================================================
# COMANDOS PARA ARREGLAR EL ERROR DE DEPLOYMENT
# Ejecuta estos comandos en tu terminal local o Cloud Shell
# ============================================================

echo "=========================================="
echo "Paso 1: Crear jwt-refresh-secret"
echo "=========================================="

# Generar secret
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
echo ""
echo "Secret generado:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$JWT_REFRESH_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  GUARDA ESTE SECRET EN UN LUGAR SEGURO"
echo ""
read -p "Presiona Enter para continuar..."

# Crear o actualizar secret
if gcloud secrets describe jwt-refresh-secret --project=propmanager-production-478716 &>/dev/null; then
    echo "Secret existe, actualizando..."
    echo -n "$JWT_REFRESH_SECRET" | gcloud secrets versions add jwt-refresh-secret \
        --data-file=- \
        --project=propmanager-production-478716
else
    echo "Creando secret..."
    echo -n "$JWT_REFRESH_SECRET" | gcloud secrets create jwt-refresh-secret \
        --data-file=- \
        --replication-policy="automatic" \
        --project=propmanager-production-478716
fi

echo "✅ Secret creado/actualizado"
echo ""

echo "=========================================="
echo "Paso 2: Configurar permisos"
echo "=========================================="

gcloud secrets add-iam-policy-binding jwt-refresh-secret \
    --member="serviceAccount:340512713682-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=propmanager-production-478716

echo "✅ Permisos configurados"
echo ""

echo "=========================================="
echo "Paso 3: Verificar configuración"
echo "=========================================="

echo "Verificando que el secret existe..."
gcloud secrets describe jwt-refresh-secret --project=propmanager-production-478716

echo ""
echo "✅ TODO LISTO!"
echo ""
echo "Ahora puedes intentar el deployment de nuevo desde GitHub"
