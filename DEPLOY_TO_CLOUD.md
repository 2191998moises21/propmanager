# 🚀 Deployment Rápido a Google Cloud

## ⚡ TL;DR - Solución Rápida

Si ves **"Failed to fetch"** en producción:

```bash
# Solución automática (recomendada):
./scripts/update-frontend-api-url.sh

# O manualmente:
# 1. Obtén URL del backend:
gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)'

# 2. Actualiza cloudbuild.yaml línea 82 con: <URL_BACKEND>/api/v1

# 3. Re-despliega frontend:
gcloud builds submit --config=cloudbuild.yaml --project=propmanager-production-478716
```

---

## 📋 Orden de Deployment Correcto

### 1️⃣ Backend Primero
```bash
cd backend
gcloud builds submit --config=cloudbuild.yaml --project=propmanager-production-478716
```

**Espera 2-5 minutos** hasta que termine.

### 2️⃣ Actualiza Frontend con URL del Backend
```bash
cd ..  # Volver al root
./scripts/update-frontend-api-url.sh
```

Este script:
- ✅ Detecta automáticamente la URL del backend
- ✅ Actualiza `cloudbuild.yaml`
- ✅ Despliega el frontend
- ✅ Configura CORS en el backend

### 3️⃣ Verificar
```bash
# Obtén URL del frontend
gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)'

# Abre esa URL en tu navegador y prueba el login
```

---

## 🔧 Troubleshooting

### "Failed to fetch" en el navegador

**Causa:** Frontend usa URL placeholder del backend

**Solución:** Ver `CLOUD_RUN_FIX.md` para guía detallada

### "CORS policy blocked"

**Causa:** Backend no tiene configurada la URL del frontend

**Solución:**
```bash
# Actualiza CORS automáticamente
./scripts/update-frontend-api-url.sh

# O manualmente:
gcloud run services update propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --update-env-vars CORS_ORIGIN="<URL_DEL_FRONTEND>"
```

### "Cloud SQL connection failed"

**Causa:** Cloud SQL no está configurado

**Solución:** Ver `GOOGLE_CLOUD_DEPLOYMENT.md` Fase 2

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| **CLOUD_RUN_FIX.md** | 🔧 Solución detallada para errores de conexión |
| **GOOGLE_CLOUD_DEPLOYMENT.md** | 📖 Guía completa de deployment (8 fases) |
| **LOCAL_DEV_SETUP.md** | 💻 Setup local para desarrollo |
| **ENV_FLOW.md** | 🔐 Variables de entorno explicadas |
| **RUNBOOK.md** | 🛠️ Procedimientos operacionales |

---

## 🎯 Scripts Útiles

| Script | Descripción |
|--------|-------------|
| `./scripts/setup-gcp.sh` | Setup inicial de infraestructura GCP |
| `./scripts/deploy-backend.sh` | Despliega backend a Cloud Run |
| `./scripts/deploy-frontend.sh` | Despliega frontend a Cloud Run |
| `./scripts/update-frontend-api-url.sh` | Actualiza URL del backend en frontend |
| `./scripts/health-check.sh` | Verifica salud de todos los servicios |
| `./scripts/backup.sh` | Backup de base de datos |

---

## 🆘 Ayuda Rápida

```bash
# Ver servicios desplegados
gcloud run services list --project=propmanager-production-478716

# Ver logs del frontend
gcloud run services logs read propmanager-frontend \
  --project=propmanager-production-478716 --limit=50

# Ver logs del backend
gcloud run services logs read propmanager-backend \
  --project=propmanager-production-478716 --limit=50

# Test de salud del backend
curl https://propmanager-backend-YOUR_HASH-uc.a.run.app/api/v1/health
```

---

**Última actualización:** 2025-11-26
