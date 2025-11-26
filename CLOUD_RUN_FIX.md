# 🔧 Solución: Failed to Fetch en Google Cloud Run

## 🔍 Problema Identificado

El frontend está desplegado en Cloud Run pero intenta conectarse a una URL placeholder:
```
https://propmanager-backend-HASH-uc.a.run.app/api/v1
```

**Resultado:** `TypeError: Failed to fetch` en el login porque el backend no existe en esa URL.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar si el Backend Está Desplegado

```bash
gcloud run services list --project=propmanager-production-478716 --region=us-central1
```

**¿Ves `propmanager-backend` en la lista?**
- ✅ **SÍ** → Continúa al Paso 2
- ❌ **NO** → Primero despliega el backend (ver sección "Desplegar Backend" abajo)

---

### Paso 2: Obtener la URL Real del Backend

```bash
gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)'
```

**Ejemplo de salida:**
```
https://propmanager-backend-a1b2c3d4e5-uc.a.run.app
```

**Copia esta URL** - la necesitarás en el siguiente paso.

---

### Paso 3: Actualizar el Frontend con la URL Correcta

Tienes **dos opciones** para actualizar la URL:

#### Opción A: Actualizar cloudbuild.yaml (Recomendado)

1. Edita `cloudbuild.yaml` línea 70:
```yaml
substitutions:
  # Reemplaza con tu URL real del backend (del Paso 2)
  _API_URL: 'https://propmanager-backend-a1b2c3d4e5-uc.a.run.app/api/v1'
```

2. Commit y push:
```bash
git add cloudbuild.yaml
git commit -m "fix: update frontend with real backend URL"
git push origin claude/analyze-google-cloud-readiness-01QL5cyFAVoCmtRKgZt8Upyx
```

3. Re-despliega el frontend:
```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716
```

#### Opción B: Pasar la URL como parámetro al deployment

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716 \
  --substitutions=_API_URL="https://propmanager-backend-a1b2c3d4e5-uc.a.run.app/api/v1"
```

---

### Paso 4: Verificar el Frontend

1. Obtén la URL del frontend:
```bash
gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)'
```

2. Abre esa URL en tu navegador

3. Abre DevTools (F12) → Console

4. Verifica que la API URL sea correcta:
```javascript
// En la consola del navegador:
console.log(import.meta.env.VITE_API_URL)
```

**Debería mostrar:** La URL real del backend (no "HASH")

---

## 🚀 Desplegar Backend (Si No Está Desplegado)

Si en el Paso 1 descubriste que el backend NO está desplegado:

### Opción 1: Usar el Script de Deployment

```bash
./scripts/deploy-backend.sh
```

### Opción 2: Deployment Manual

```bash
cd backend

gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716
```

**Espera** a que el deployment termine (2-5 minutos), luego obtén la URL:

```bash
gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)'
```

**Importante:** Guarda esta URL - la necesitas para el frontend.

---

## 🔐 Configurar CORS en el Backend (Crítico)

Después de desplegar el backend, necesitas **actualizar la configuración CORS** para permitir requests del frontend.

### 1. Obtén la URL del Frontend

```bash
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

echo "Frontend URL: $FRONTEND_URL"
```

### 2. Actualiza las Variables de Entorno del Backend

```bash
gcloud run services update propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --update-env-vars CORS_ORIGIN="$FRONTEND_URL"
```

**O manualmente en el Cloud Console:**
1. Ve a Cloud Run → propmanager-backend
2. Click "EDIT & DEPLOY NEW REVISION"
3. Click "Variables & Secrets" → "ENVIRONMENT VARIABLES"
4. Actualiza `CORS_ORIGIN` con la URL del frontend
5. Click "DEPLOY"

---

## 🧪 Probar la Integración Completa

### 1. Test del Backend Health

```bash
BACKEND_URL=$(gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

curl $BACKEND_URL/api/v1/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-26T..."
  }
}
```

### 2. Test del Frontend

1. Abre la URL del frontend en tu navegador
2. Abre DevTools (F12) → Network tab
3. Click en "Registrarse" → "Propietario"
4. Llena el formulario y envía
5. En Network tab, busca el request a `/api/v1/auth/register/owner`
6. Verifica:
   - ✅ Status: 201 Created (o 200 OK)
   - ✅ Response contiene `success: true`
   - ❌ Si ves CORS error → Revisa la configuración CORS del backend

---

## 📝 Checklist Completo

- [ ] Backend desplegado en Cloud Run
- [ ] URL del backend obtenida
- [ ] Frontend `cloudbuild.yaml` actualizado con URL real
- [ ] Frontend re-desplegado
- [ ] CORS configurado en backend con URL del frontend
- [ ] Backend health check exitoso
- [ ] Frontend puede hacer login exitosamente

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" persiste

**Causa 1:** Frontend todavía usando URL placeholder
```bash
# Verifica en el navegador (DevTools → Console):
console.log(import.meta.env.VITE_API_URL)
```
**Solución:** Re-despliega el frontend con la URL correcta

**Causa 2:** CORS no configurado
```bash
# Verifica logs del backend:
gcloud run services logs read propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --limit=50
```
**Solución:** Actualiza CORS_ORIGIN en el backend

**Causa 3:** Backend no está corriendo
```bash
# Verifica status:
gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1
```
**Solución:** Re-despliega el backend

### Error: "CORS policy blocked"

**Causa:** Backend no tiene configurada la URL del frontend en CORS_ORIGIN

**Solución:**
```bash
# Obtén URL del frontend
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

# Actualiza backend
gcloud run services update propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --update-env-vars CORS_ORIGIN="$FRONTEND_URL"
```

### Error: "Cloud SQL connection failed"

**Causa:** Backend no puede conectarse a Cloud SQL

**Verificación:**
```bash
# Verifica que Cloud SQL esté configurado
gcloud sql instances list --project=propmanager-production-478716
```

**Solución:** Ver `GOOGLE_CLOUD_DEPLOYMENT.md` Fase 2 (Cloud SQL Setup)

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Ver todos los servicios de Cloud Run
gcloud run services list \
  --project=propmanager-production-478716 \
  --region=us-central1

# Ver logs del frontend
gcloud run services logs read propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --limit=100

# Ver logs del backend
gcloud run services logs read propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --limit=100

# Re-desplegar frontend (después de actualizar cloudbuild.yaml)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716

# Re-desplegar backend
cd backend && gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716
```

---

## 📚 Documentación Relacionada

- **GOOGLE_CLOUD_DEPLOYMENT.md** - Guía completa de deployment
- **QUICK_SETUP.md** - Setup local para desarrollo
- **ENV_FLOW.md** - Cómo funcionan las variables de entorno
- **RUNBOOK.md** - Procedimientos operacionales

---

**Última actualización:** 2025-11-26
