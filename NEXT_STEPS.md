# ✅ Configuración Completada - Próximos Pasos

## 🎉 Lo Que Ya Está Listo

✅ Backend desplegado en Cloud Run
- URL: `https://propmanager-340512713682.us-central1.run.app`
- Puerto: 8080
- Cloud SQL conectado: `propmanager-production-478716:us-central1:propmanager-production-478716`

✅ Frontend configurado con la URL correcta del backend
- API URL: `https://propmanager-340512713682.us-central1.run.app/api/v1`
- Actualizado en: `cloudbuild.yaml` y `.env.production`

---

## 🚀 Paso Final: Desplegar el Frontend

Ahora solo necesitas desplegar el frontend con la configuración actualizada:

### Opción 1: Usando gcloud directamente

```bash
# Pull los últimos cambios (si no lo has hecho)
git pull origin claude/analyze-google-cloud-readiness-01QL5cyFAVoCmtRKgZt8Upyx

# Despliega el frontend
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716
```

### Opción 2: Usando el script automatizado

```bash
# Pull los últimos cambios
git pull origin claude/analyze-google-cloud-readiness-01QL5cyFAVoCmtRKgZt8Upyx

# Ejecuta el script de deployment
./scripts/deploy-frontend.sh
```

**Tiempo estimado:** 3-5 minutos

---

## 🔐 Configurar CORS (Importante)

Después de que el frontend esté desplegado, necesitas configurar CORS en el backend para permitir las conexiones:

```bash
# 1. Obtén la URL del frontend desplegado
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

echo "Frontend URL: $FRONTEND_URL"

# 2. Actualiza el backend con la URL del frontend
gcloud run services update propmanager \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --update-env-vars CORS_ORIGIN="$FRONTEND_URL"
```

**Nota:** Si tu backend se llama diferente (ej: `propmanager-backend`), ajusta el nombre en el comando.

---

## ✅ Verificación Final

### 1. Verifica que el backend responde

```bash
curl https://propmanager-340512713682.us-central1.run.app/api/v1/health
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

### 2. Abre el frontend en tu navegador

```bash
# Obtén la URL del frontend
gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)'

# Abre esa URL en tu navegador
```

### 3. Verifica la conexión en DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Ejecuta:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
4. **Debe mostrar:** `https://propmanager-340512713682.us-central1.run.app/api/v1`

### 4. Prueba el Login/Registro

1. Click en "Registrarse"
2. Selecciona "Propietario" o "Inquilino"
3. Llena el formulario
4. Click en "Crear Cuenta"

**Si todo está bien:**
- ✅ No verás "Failed to fetch"
- ✅ Serás redirigido al dashboard
- ✅ En la pestaña Network verás requests exitosos a `/api/v1/auth/register/*`

**Si ves "CORS policy blocked":**
- Asegúrate de haber ejecutado el comando de CORS de arriba
- Verifica que el CORS_ORIGIN en el backend coincida con la URL del frontend

---

## 🐛 Troubleshooting

### "Failed to fetch" persiste

1. **Verifica la URL en el navegador:**
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
   Debe mostrar: `https://propmanager-340512713682.us-central1.run.app/api/v1`

2. **Si muestra la URL placeholder:**
   - El frontend no se re-desplegó correctamente
   - Ejecuta: `gcloud builds submit --config=cloudbuild.yaml --project=propmanager-production-478716`

### "CORS policy blocked"

1. **Verifica que CORS esté configurado:**
   ```bash
   gcloud run services describe propmanager \
     --project=propmanager-production-478716 \
     --region=us-central1 \
     --format='yaml(spec.template.spec.containers[0].env)'
   ```
   Busca `CORS_ORIGIN` en la salida

2. **Si no existe o es incorrecto:**
   - Ejecuta el comando de CORS de arriba

### Backend responde "Cloud SQL connection failed"

1. **Verifica que Cloud SQL esté corriendo:**
   ```bash
   gcloud sql instances list --project=propmanager-production-478716
   ```

2. **Verifica los logs del backend:**
   ```bash
   gcloud run services logs read propmanager \
     --project=propmanager-production-478716 \
     --region=us-central1 \
     --limit=50
   ```

---

## 📊 Resumen de URLs

| Servicio | URL | Notas |
|----------|-----|-------|
| **Backend API** | `https://propmanager-340512713682.us-central1.run.app/api/v1` | Listo y funcionando |
| **Frontend** | Obtener después del deployment | Desplegar con `cloudbuild.yaml` |
| **Health Check** | `https://propmanager-340512713682.us-central1.run.app/api/v1/health` | Para verificar backend |

---

## 🎯 Commits Recientes

```
6d8c75c - fix: update frontend with actual backend Cloud Run URL
e18a628 - fix: resolve Cloud Run "Failed to fetch" error with backend URL configuration
600999d - fix: update Dockerfiles to Node.js 20 and install all build dependencies
```

---

## 📚 Documentación Útil

- **CLOUD_RUN_FIX.md** - Guía detallada de troubleshooting
- **DEPLOY_TO_CLOUD.md** - Referencia rápida de deployment
- **GOOGLE_CLOUD_DEPLOYMENT.md** - Guía completa de infraestructura GCP
- **RUNBOOK.md** - Procedimientos operacionales

---

**¡Último paso!** Despliega el frontend y configura CORS. Después de eso, tu aplicación estará 100% funcional en Google Cloud. 🚀
