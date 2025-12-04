# 🚀 Guía de Deployment - PropManager

Esta guía te llevará paso a paso para deployar todas las nuevas funcionalidades a producción en Google Cloud.

## 📋 Resumen de Cambios

Las siguientes funcionalidades se deployarán:
- ✅ Sistema de recuperación de contraseña
- ✅ Refresh tokens (sesiones de 7 días)
- ✅ Sistema de notificaciones Toast profesional
- ✅ Paginación en Properties
- ✅ React Router con rutas públicas y protegidas

## ⚠️ Pre-requisitos

Asegúrate de tener instalado:
- Google Cloud SDK (`gcloud`)
- Docker
- Acceso al proyecto: `propmanager-production-478716`
- La contraseña de la base de datos guardada

## 🔧 Paso 1: Actualizar Base de Datos

Aplicar las migraciones para agregar las nuevas tablas:

```bash
# Hacer ejecutable el script
chmod +x scripts/apply-migration.sh

# Ejecutar migración
./scripts/apply-migration.sh
```

**Qué hace:** Agrega las tablas `password_reset_tokens` y `refresh_tokens` con todos sus índices.

**Tablas agregadas:**
- `password_reset_tokens` - Para recuperación de contraseña
- `refresh_tokens` - Para sesiones persistentes de 7 días

---

## 🔐 Paso 2: Configurar JWT Refresh Secret

Crear el nuevo secret para los refresh tokens:

```bash
# Hacer ejecutable el script
chmod +x scripts/setup-refresh-secret.sh

# Ejecutar configuración
./scripts/setup-refresh-secret.sh
```

**Qué hace:**
- Genera un secret seguro de 64 caracteres
- Lo guarda en Secret Manager como `jwt-refresh-secret`
- Configura permisos para Cloud Run

**IMPORTANTE:** Guarda el secret que se muestra en un lugar seguro (aunque ya estará en Secret Manager).

---

## 🚢 Paso 3: Deploy del Backend

Deployar el backend actualizado con todas las nuevas funcionalidades:

```bash
# Hacer commit de todos los cambios (si no lo hiciste ya)
git add -A
git commit -m "feat: preparar para deployment a producción"
git push

# Deploy del backend
chmod +x scripts/deploy-backend.sh
./scripts/deploy-backend.sh
```

**Qué hace:**
- Construye la imagen Docker del backend
- La sube a Container Registry
- Deploya a Cloud Run con:
  - Nuevas variables de entorno
  - Secret JWT_REFRESH_SECRET
  - Conexión a Cloud SQL actualizada
  - CORS configurado para el frontend

**Tiempo estimado:** 5-10 minutos

**Verificación:**
```bash
# Health check
curl https://propmanager-backend-340512713682.us-central1.run.app/api/v1/health

# Debería responder: {"status":"ok","timestamp":"..."}
```

---

## 🎨 Paso 4: Deploy del Frontend

Deployar el frontend actualizado con React Router y nuevas páginas:

```bash
# Deploy del frontend
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

**Qué hace:**
- Construye el frontend en modo producción con Vite
- Sube la imagen Docker a Container Registry
- Deploya a Cloud Run

**Tiempo estimado:** 3-5 minutos

**Verificación:**
Abre en el navegador:
```
https://propmanager-frontend-340512713682.us-central1.run.app
```

---

## ✅ Paso 5: Verificación Post-Deployment

### Verificar Backend:

```bash
# Health check
curl https://propmanager-backend-340512713682.us-central1.run.app/api/v1/health

# Verificar nuevos endpoints (deben devolver 400 sin body, no 404)
curl -X POST https://propmanager-backend-340512713682.us-central1.run.app/api/v1/auth/forgot-password
curl -X POST https://propmanager-backend-340512713682.us-central1.run.app/api/v1/auth/refresh
```

### Verificar Frontend:

1. **Login:** https://propmanager-frontend-340512713682.us-central1.run.app/login
2. **Recuperación de contraseña:** Clic en "¿Olvidó su contraseña?"
3. **Toast notifications:** Deberían aparecer en lugar de alerts nativos

### Verificar Base de Datos:

```bash
# Conectar a Cloud SQL
gcloud sql connect propmanager-db --user=propmanager-user --database=propmanager

# Verificar tablas nuevas
\dt
# Deberías ver: password_reset_tokens y refresh_tokens

# Salir
\q
```

---

## 🧪 Pruebas Funcionales

### 1. Recuperación de Contraseña

```bash
# Frontend
1. Ir a /forgot-password
2. Ingresar email y seleccionar rol
3. Verificar toast notification
4. Revisar logs del backend para el email (modo mock)

# Ver logs del backend
gcloud run services logs read propmanager-backend --region=us-central1 --limit=50
```

### 2. Refresh Tokens

```bash
# El sistema debería:
1. Guardar refresh token al hacer login
2. Mantener sesión por 7 días
3. Revocar tokens al cambiar contraseña
```

### 3. Paginación

```bash
# Si tienes más de 9 propiedades:
1. Ir a la vista de Properties
2. Verificar que aparece el componente de paginación
3. Navegar entre páginas
```

---

## 🔍 Monitoreo y Logs

### Ver logs del backend:
```bash
gcloud run services logs read propmanager-backend --region=us-central1 --limit=100 --follow
```

### Ver logs del frontend:
```bash
gcloud run services logs read propmanager-frontend --region=us-central1 --limit=100 --follow
```

### Consola de Google Cloud:
- Backend: https://console.cloud.google.com/run/detail/us-central1/propmanager-backend
- Frontend: https://console.cloud.google.com/run/detail/us-central1/propmanager-frontend
- Cloud SQL: https://console.cloud.google.com/sql/instances/propmanager-db

---

## 🆘 Troubleshooting

### Error: "Secret not found"
```bash
# Verificar que el secret existe
gcloud secrets list --project=propmanager-production-478716

# Si no existe jwt-refresh-secret, ejecutar:
./scripts/setup-refresh-secret.sh
```

### Error: "Table does not exist"
```bash
# Aplicar migración de nuevo
./scripts/apply-migration.sh
```

### Error: "Cannot connect to Cloud SQL"
```bash
# Verificar que Cloud SQL está activo
gcloud sql instances describe propmanager-db --project=propmanager-production-478716

# Verificar permisos
gcloud sql instances describe propmanager-db --format="value(serviceAccountEmailAddress)"
```

### Frontend muestra página en blanco:
```bash
# Ver logs
gcloud run services logs read propmanager-frontend --region=us-central1 --limit=50

# Verificar que VITE_API_URL está configurado correctamente
# Debería ser: https://propmanager-backend-340512713682.us-central1.run.app/api/v1
```

---

## 🎉 ¡Deployment Completado!

Una vez completados todos los pasos, tu aplicación PropManager estará:

✅ **Segura** - Tokens seguros, rate limiting, password recovery
✅ **Escalable** - Paginación implementada
✅ **Profesional** - UX mejorada con Toast notifications
✅ **Confiable** - Sesiones persistentes de 7 días
✅ **Lista para Producción** - Compatible con clientes reales

## 📞 URLs de Producción

- **Frontend:** https://propmanager-frontend-340512713682.us-central1.run.app
- **Backend:** https://propmanager-backend-340512713682.us-central1.run.app
- **API Health:** https://propmanager-backend-340512713682.us-central1.run.app/api/v1/health

---

## 📝 Notas Adicionales

### Email Service (Futuro)

Actualmente el email service está en modo mock (logs en consola). Para configurar un proveedor real:

1. **SendGrid:**
   ```bash
   # Agregar secret
   gcloud secrets create sendgrid-api-key --data-file=- --project=propmanager-production-478716
   ```

2. **Actualizar backend** con la configuración del proveedor elegido

### Backup de Base de Datos

Antes de hacer cambios mayores, siempre haz backup:

```bash
gcloud sql backups create \
  --instance=propmanager-db \
  --project=propmanager-production-478716
```

### Rollback

Si necesitas hacer rollback:

```bash
# Backend
gcloud run services update-traffic propmanager-backend \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1

# Frontend
gcloud run services update-traffic propmanager-frontend \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1
```

---

**¿Problemas o preguntas?** Revisa los logs en la consola de Google Cloud o ejecuta los comandos de verificación arriba.
