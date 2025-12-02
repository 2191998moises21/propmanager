# 🚀 Guía de Deploy - PropManager

## 📋 Resumen de Cambios Implementados

Este deploy incluye todas las mejoras de **FASE 1 (Seguridad Crítica)** y **FASE 2 (Activity Logs)** completas:

### ✅ FASE 1 - Seguridad Crítica (8 commits)
- ✅ Autorización role-based en 34 endpoints
- ✅ Validación de entrada con Zod (5 validators)
- ✅ Validación completa de archivos subidos
- ✅ Protección de credenciales (.env.production, passwords)
- ✅ API CRUD de Contractors conectada al backend
- ✅ Credenciales de test removidas de UI

### ✅ FASE 2 - Activity Logs (2 commits)
- ✅ API REST completa de Activity Logs (8 endpoints)
- ✅ Frontend conectado para auditoría y compliance
- ✅ Paginación, filtros y estadísticas

**Total: 10 commits | ~2,200+ líneas de código nuevo**

---

## 🛠️ Requisitos Previos

Para hacer el deploy, necesitas ejecutar los comandos desde **Google Cloud Shell** o desde una máquina con:
- ✅ `gcloud` CLI instalado y configurado
- ✅ Acceso al proyecto: `propmanager-production-478716`
- ✅ Permisos para Cloud Run y Cloud Build

---

## 📍 Paso 1: Acceder a Google Cloud Shell

1. **Abre Google Cloud Console**: https://console.cloud.google.com
2. **Activa Cloud Shell**: Click en el ícono de terminal (>_) en la esquina superior derecha
3. **Verifica el proyecto**:
   ```bash
   gcloud config get-value project
   # Debe mostrar: propmanager-production-478716
   ```

---

## 📦 Paso 2: Clonar/Actualizar el Repositorio

```bash
# Si ya tienes el repo clonado, actualízalo:
cd propmanager
git fetch origin
git checkout claude/review-backend-deployment-script-012rbghVsQv9ubYiSTuW8JqX
git pull origin claude/review-backend-deployment-script-012rbghVsQv9ubYiSTuW8JqX

# O si no lo tienes, clónalo:
# git clone <YOUR_REPO_URL> propmanager
# cd propmanager
# git checkout claude/review-backend-deployment-script-012rbghVsQv9ubYiSTuW8JqX
```

---

## 🔧 Paso 3: Verificar Estado del Código

```bash
# Verificar que estés en el commit correcto
git log --oneline -1
# Debe mostrar: febb427 - feat: conectar SuperAdmin Activity Logs del frontend al backend API

# Verificar archivos limpios
git status
# Debe mostrar: "nothing to commit, working tree clean"

# Verificar scripts de deploy
ls -la scripts/deploy-*.sh
# Debe mostrar: deploy-backend.sh y deploy-frontend.sh
```

---

## 🚀 Paso 4: Deploy del Backend

```bash
# Hacer el backend ejecutable (si es necesario)
chmod +x scripts/deploy-backend.sh

# Ejecutar deploy del backend
./scripts/deploy-backend.sh production
```

**⏱️ Tiempo estimado: 5-8 minutos**

El script automáticamente:
1. ✅ Configura el proyecto y región
2. ✅ Sube el código a Cloud Build
3. ✅ Construye la imagen Docker
4. ✅ Despliega a Cloud Run
5. ✅ Configura variables de entorno desde `.env.production`

**Espera a ver este mensaje:**
```
[SUCCESS] ✅ Backend deployment completed!
[SUCCESS] Service URL: https://propmanager-backend-XXXXX.run.app
```

---

## 🌐 Paso 5: Actualizar URL del Backend en Frontend

**IMPORTANTE:** Antes de desplegar el frontend, actualiza la variable de entorno con la nueva URL del backend.

```bash
# 1. Editar .env.production
nano .env.production

# 2. Actualizar VITE_API_URL con la URL que obtuviste del paso anterior:
# VITE_API_URL=https://propmanager-backend-XXXXX.run.app/api/v1

# 3. Guardar y salir (Ctrl+X, luego Y, luego Enter)
```

---

## 🎨 Paso 6: Deploy del Frontend

```bash
# Hacer el frontend ejecutable (si es necesario)
chmod +x scripts/deploy-frontend.sh

# Ejecutar deploy del frontend
./scripts/deploy-frontend.sh production
```

**⏱️ Tiempo estimado: 5-8 minutos**

El script automáticamente:
1. ✅ Construye el frontend con Vite
2. ✅ Crea imagen Docker con nginx
3. ✅ Despliega a Cloud Run
4. ✅ Configura variables de entorno

**Espera a ver este mensaje:**
```
[SUCCESS] ✅ Frontend deployment completed!
[SUCCESS] Service URL: https://propmanager-frontend-XXXXX.run.app
```

---

## ✅ Paso 7: Verificar el Deploy

### 7.1 Health Check del Backend

```bash
# Obtener URL del backend
BACKEND_URL=$(gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format='value(status.url)')

# Probar health endpoint
curl "$BACKEND_URL/api/v1/health"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "PropManager API is running",
  "timestamp": "2025-12-02T...",
  "endpoints": {
    "auth": "/api/v1/auth",
    "properties": "/api/v1/properties",
    "contracts": "/api/v1/contracts",
    "payments": "/api/v1/payments",
    "tickets": "/api/v1/tickets",
    "tenants": "/api/v1/tenants",
    "contractors": "/api/v1/contractors",
    "activityLogs": "/api/v1/activity-logs"
  }
}
```

### 7.2 Verificar Frontend

```bash
# Obtener URL del frontend
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --region=us-central1 \
  --format='value(status.url)')

echo "Frontend URL: $FRONTEND_URL"
```

Abre la URL en tu navegador y verifica:
- ✅ La página de login carga correctamente
- ✅ No hay errores en la consola del navegador
- ✅ Los assets (CSS, JS) cargan correctamente

---

## 🧪 Paso 8: Pruebas Funcionales

### 8.1 Probar Login

1. Abre el frontend en el navegador
2. Intenta hacer login con un usuario existente (Owner o Tenant)
3. Verifica que:
   - ✅ El login funciona
   - ✅ Redirige al portal correcto
   - ✅ Los datos cargan desde el backend

### 8.2 Probar Contractors (Nueva Funcionalidad)

1. Login como **Owner**
2. Navega a la sección de Contractors
3. Verifica que:
   - ✅ La lista de contractors carga (ya no son datos mock)
   - ✅ Puedes crear un nuevo contractor
   - ✅ Puedes editar y eliminar contractors
   - ✅ Los cambios persisten (se guardan en la base de datos)

### 8.3 Probar Activity Logs (Nueva Funcionalidad)

1. Login como **SuperAdmin** (usa: `admin@propmanager.com`)
2. Navega a la sección de Activity Logs
3. Verifica que:
   - ✅ Los logs cargan desde el backend
   - ✅ Se muestran acciones de usuarios
   - ✅ Los filtros funcionan correctamente
   - ✅ La paginación funciona

---

## 📊 Paso 9: Monitoreo y Logs

### Ver logs del backend en tiempo real:
```bash
gcloud run services logs read propmanager-backend \
  --region=us-central1 \
  --limit=50
```

### Ver logs del frontend:
```bash
gcloud run services logs read propmanager-frontend \
  --region=us-central1 \
  --limit=50
```

### Verificar métricas en Cloud Console:
1. Ve a: https://console.cloud.google.com/run
2. Selecciona `propmanager-backend` o `propmanager-frontend`
3. Revisa:
   - ✅ Request count
   - ✅ Response times
   - ✅ Error rates

---

## 🚨 Troubleshooting

### Error: "gcloud: command not found"
**Solución:** Debes ejecutar los comandos desde Google Cloud Shell o instalar gcloud CLI.

### Error: "Permission denied"
**Solución:** Verifica que tienes permisos de Cloud Run Admin y Cloud Build Editor:
```bash
gcloud projects get-iam-policy propmanager-production-478716 --flatten="bindings[].members" --filter="bindings.members:$(gcloud config get-value account)"
```

### Error: "Port 8080 not responding"
**Solución:** Verifica que:
1. El Dockerfile expone el puerto correcto (8080)
2. La aplicación escucha en el puerto correcto
3. La variable PORT está configurada en Cloud Run

### Error de CORS
**Solución:** Verifica que la URL del frontend esté configurada correctamente en el backend `.env.production`:
```bash
# En backend/.env.production
CORS_ORIGIN=https://propmanager-frontend-XXXXX.run.app
```

### Backend no conecta con la base de datos
**Solución:** Verifica las variables de entorno de la base de datos en Cloud Run:
```bash
gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format='value(spec.template.spec.containers[0].env)'
```

---

## 📈 Funcionalidades Desplegadas

### Backend (API REST)
```
✅ /api/v1/auth              - Autenticación y registro
✅ /api/v1/properties        - CRUD de propiedades
✅ /api/v1/contracts         - CRUD de contratos
✅ /api/v1/payments          - CRUD de pagos
✅ /api/v1/tickets           - CRUD de tickets
✅ /api/v1/tenants           - CRUD de inquilinos
✅ /api/v1/contractors       - CRUD de contratistas (NUEVO)
✅ /api/v1/activity-logs     - Sistema de auditoría (NUEVO)
```

### Frontend
```
✅ Owner Portal              - Gestión de propiedades
✅ Tenant Portal             - Ver contrato y pagos
✅ SuperAdmin Portal         - Gestión completa
✅ Contractors               - Conectado a backend (NUEVO)
✅ Activity Logs             - Auditoría en tiempo real (NUEVO)
```

### Seguridad
```
✅ Autorización role-based   - 34 endpoints protegidos
✅ Validación Zod            - 5 validators + file validation
✅ CORS configurado          - Solo frontend autorizado
✅ Rate limiting             - 100 req/15min por IP
✅ Helmet security headers   - Protección XSS, clickjacking
```

---

## 🎯 Próximos Pasos Después del Deploy

1. **Verificar que todo funcione** en producción
2. **Probar las nuevas funcionalidades** (Contractors y Activity Logs)
3. **Revisar logs** para detectar posibles errores
4. **Continuar con FASE 2** (más funcionalidades) si todo está bien

---

## 📞 Soporte

Si encuentras problemas durante el deploy:
1. Revisa los logs con los comandos de monitoreo
2. Verifica las variables de entorno
3. Comprueba la configuración de CORS
4. Revisa el estado de los servicios en Cloud Console

---

**Última actualización:** 2 de Diciembre, 2025
**Branch:** `claude/review-backend-deployment-script-012rbghVsQv9ubYiSTuW8JqX`
**Commit:** `febb427`
