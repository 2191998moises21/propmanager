#!/bin/bash

# ========================================
# Verificación Completa de Deployment
# ========================================

echo "========================================="
echo "1. VERIFICANDO ESTADO DE GIT"
echo "========================================="
echo ""

cd ~/propmanager
git fetch origin
echo "Branch actual:"
git branch --show-current
echo ""
echo "Último commit en main:"
git log origin/main --oneline -1
echo ""
echo "Diferencias entre local y main:"
git diff --stat HEAD origin/main
echo ""

echo "========================================="
echo "2. VERIFICANDO ÚLTIMO BUILD DE CLOUD BUILD"
echo "========================================="
echo ""

gcloud builds list \
    --limit=5 \
    --project=propmanager-production-478716 \
    --format="table(id,status,createTime,source.repoSource.branchName,source.repoSource.commitSha)"

echo ""
echo "========================================="
echo "3. VERIFICANDO IMAGEN DESPLEGADA EN BACKEND"
echo "========================================="
echo ""

gcloud run services describe propmanager-backend \
    --region=us-central1 \
    --project=propmanager-production-478716 \
    --format="value(spec.template.spec.containers[0].image)"

echo ""
echo "========================================="
echo "4. VERIFICANDO LOGS RECIENTES DEL BACKEND"
echo "========================================="
echo ""

gcloud run services logs read propmanager-backend \
    --project=propmanager-production-478716 \
    --region=us-central1 \
    --limit=20 \
    | grep -E "error|500|documento" | head -10

echo ""
echo "========================================="
echo "RESUMEN"
echo "========================================="
echo ""
echo "Si ves 'documento_id_url' en los logs, el código antiguo sigue desplegado."
echo "Si ves 'documento_url', el código nuevo está desplegado correctamente."
