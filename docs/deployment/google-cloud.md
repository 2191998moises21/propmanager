# ☁️ Guía Completa de Despliegue en Google Cloud Platform

**PropManager - Sistema de Gestión de Propiedades**

Esta guía proporciona instrucciones paso a paso para desplegar PropManager en Google Cloud Platform (GCP).

---

## 📋 Tabla de Contenidos

1. [Información del Proyecto](#información-del-proyecto)
2. [Prerequisitos](#prerequisitos)
3. [Arquitectura Cloud](#arquitectura-cloud)
4. [Configuración Inicial de GCP](#configuración-inicial-de-gcp)
5. [Fase 1: Base de Datos (Cloud SQL)](#fase-1-base-de-datos-cloud-sql)
6. [Fase 2: Secrets Manager](#fase-2-secrets-manager)
7. [Fase 3: Cloud Storage](#fase-3-cloud-storage)
8. [Fase 4: Despliegue del Backend](#fase-4-despliegue-del-backend)
9. [Fase 5: Despliegue del Frontend](#fase-5-despliegue-del-frontend)
10. [Fase 6: Configuración de CI/CD](#fase-6-configuración-de-cicd)
11. [Fase 7: Dominio y SSL](#fase-7-dominio-y-ssl)
12. [Fase 8: Monitoreo y Logging](#fase-8-monitoreo-y-logging)
13. [Fase 9: Verificación Final y Post-Deployment](#fase-9-verificación-final-y-post-deployment)
14. [Costos Estimados](#costos-estimados)
15. [Troubleshooting Completo](#troubleshooting-completo)
16. [Mantenimiento](#mantenimiento)

---

## 📊 Información del Proyecto

```yaml
Nombre del Proyecto: PropManager Production
Project ID: propmanager-production-478716
Número de Proyecto: 340512713682
Región Principal: us-central1
Ambiente: production
```

---

## ✅ Prerequisitos

### Software Requerido

```bash
# Google Cloud SDK
gcloud --version  # >= 400.0.0

# Docker (para testing local)
docker --version  # >= 20.10.0

# Git
git --version  # >= 2.30.0

# Node.js (para desarrollo local)
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Instalación de Google Cloud SDK

**macOS:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**Windows:**
Descarga desde: https://cloud.google.com/sdk/docs/install

### Permisos Requeridos

Tu cuenta debe tener los siguientes roles:
- `roles/owner` o
- `roles/editor` +
  - `roles/cloudsql.admin`
  - `roles/run.admin`
  - `roles/secretmanager.admin`
  - `roles/storage.admin`
  - `roles/cloudbuild.builds.editor`

---

## 🏗️ Arquitectura Cloud

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet / Users                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Load Balancer                     │
│                    (HTTPS / SSL)                            │
└────────┬───────────────────────────────────┬────────────────┘
         │                                   │
         ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────────┐
│   Cloud Run          │          │   Cloud Run              │
│   (Frontend)         │◄────────►│   (Backend API)          │
│   Nginx + React      │          │   Node.js + Express      │
│   Port: 8080         │          │   Port: 8080             │
└──────────────────────┘          └──────┬──────┬────────────┘
                                         │      │
                        ┌────────────────┘      └──────────┐
                        ▼                                  ▼
              ┌───────────────────┐              ┌────────────────┐
              │  Cloud SQL        │              │ Cloud Storage  │
              │  PostgreSQL 14    │              │ (Uploads)      │
              │  Private IP       │              │ Public Bucket  │
              └───────────────────┘              └────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Secret Manager    │
              │ - DB Password     │
              │ - JWT Secret      │
              └───────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Cloud Build       │
              │ CI/CD Pipeline    │
              └───────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Container Registry│
              │ Docker Images     │
              └───────────────────┘
```

---

## 🎯 Configuración Inicial de GCP

### 1. Autenticación

```bash
# Login a Google Cloud
gcloud auth login

# Configurar proyecto
gcloud config set project propmanager-production-478716

# Verificar configuración
gcloud config list
```

### 2. Habilitar APIs Necesarias

```bash
# Habilitar todas las APIs requeridas
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage-api.googleapis.com \
  storage-component.googleapis.com \
  containerregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com

# Verificar APIs habilitadas
gcloud services list --enabled
```

### 3. Configurar Billing (si no está configurado)

```bash
# Listar cuentas de billing
gcloud billing accounts list

# Vincular cuenta de billing al proyecto
gcloud billing projects link propmanager-production-478716 \
  --billing-account=BILLING_ACCOUNT_ID
```

---

## 💾 Fase 1: Base de Datos (Cloud SQL)

### 1.1 Crear Instancia de Cloud SQL

```bash
# Crear instancia PostgreSQL 14
gcloud sql instances create propmanager-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --maintenance-release-channel=production \
  --availability-type=zonal \
  --labels=env=production,app=propmanager

# Esto tomará aproximadamente 5-10 minutos
```

**Espera a que la instancia esté lista:**
```bash
# Verificar estado
gcloud sql instances describe propmanager-db --format="value(state)"
```

### 1.2 Crear Base de Datos

```bash
# Crear base de datos
gcloud sql databases create propmanager \
  --instance=propmanager-db

# Verificar
gcloud sql databases list --instance=propmanager-db
```

### 1.3 Crear Usuario de Base de Datos

```bash
# Generar contraseña segura
PASSWORD=$(openssl rand -base64 32)
echo "Database Password: $PASSWORD"
# ⚠️ GUARDA ESTA CONTRASEÑA - La necesitarás después

# Crear usuario
gcloud sql users create propmanager-user \
  --instance=propmanager-db \
  --password="$PASSWORD"

# Verificar
gcloud sql users list --instance=propmanager-db
```

### 1.4 Ejecutar Schema SQL

**Opción A: Usando Cloud SQL Proxy (Recomendado)**

```bash
# 1. Descargar Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# 2. Iniciar proxy en otra terminal
./cloud-sql-proxy propmanager-production-478716:us-central1:propmanager-db

# 3. En otra terminal, conectar con psql
PGPASSWORD="$PASSWORD" psql -h 127.0.0.1 -U propmanager-user -d propmanager

# 4. Ejecutar schema
\i backend/src/config/schema.sql

# 5. Verificar tablas
\dt

# 6. Salir
\q
```

**Opción B: Usando gcloud sql connect**

```bash
# Conectar
gcloud sql connect propmanager-db --user=propmanager-user

# Cambiar a la base de datos
\c propmanager

# Copiar y pegar el contenido de backend/src/config/schema.sql
# O usar \i si tienes el archivo local

# Verificar
\dt
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

\q
```

### 1.5 Configurar Connection String

El connection string será:
```
propmanager-production-478716:us-central1:propmanager-db
```

---

## 🔐 Fase 2: Secrets Manager

### 2.1 Crear Secret para DB Password

```bash
# Crear secret con la contraseña de la base de datos
echo -n "$PASSWORD" | gcloud secrets create propmanager-db-password \
  --data-file=- \
  --replication-policy=automatic \
  --labels=env=production,app=propmanager

# Verificar
gcloud secrets versions access latest --secret=propmanager-db-password
```

### 2.2 Crear Secret para JWT

```bash
# Generar JWT secret seguro (256 bits)
JWT_SECRET=$(openssl rand -base64 64)
echo "JWT Secret: $JWT_SECRET"
# ⚠️ GUARDA ESTE SECRET

# Crear secret
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy=automatic \
  --labels=env=production,app=propmanager

# Verificar
gcloud secrets list
```

### 2.3 Dar Permisos a Cloud Run

```bash
# Obtener número de proyecto
PROJECT_NUMBER=$(gcloud projects describe propmanager-production-478716 --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"

# Dar permisos para acceder a secrets
gcloud secrets add-iam-policy-binding propmanager-db-password \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Verificar permisos
gcloud secrets get-iam-policy propmanager-db-password
gcloud secrets get-iam-policy jwt-secret
```

---

## 📦 Fase 3: Cloud Storage

### 3.1 Crear Bucket para Uploads

```bash
# Crear bucket para uploads de usuarios
gsutil mb -p propmanager-production-478716 \
  -c STANDARD \
  -l us-central1 \
  -b on \
  gs://propmanager-uploads

# Configurar versionamiento
gsutil versioning set on gs://propmanager-uploads

# Configurar lifecycle (opcional - eliminar versiones antiguas después de 30 días)
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 3,
          "age": 30
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://propmanager-uploads
```

### 3.2 Configurar CORS

```bash
# Aplicar configuración CORS
gsutil cors set cors.json gs://propmanager-uploads

# Verificar
gsutil cors get gs://propmanager-uploads
```

### 3.3 Configurar Permisos Públicos (Opcional)

**⚠️ Solo si necesitas que los archivos sean públicamente accesibles**

```bash
# Hacer el bucket público para lectura
gsutil iam ch allUsers:objectViewer gs://propmanager-uploads

# O configurar acceso firmado (más seguro)
# No ejecutar el comando anterior si usas signed URLs
```

### 3.4 Crear Bucket para Frontend (Opcional)

Si decides usar Cloud Storage en lugar de Cloud Run para el frontend:

```bash
# Crear bucket
gsutil mb -p propmanager-production-478716 \
  -c STANDARD \
  -l us-central1 \
  gs://propmanager-frontend

# Configurar como sitio web
gsutil web set -m index.html -e index.html gs://propmanager-frontend

# Hacer público
gsutil iam ch allUsers:objectViewer gs://propmanager-frontend
```

---

## 🚀 Fase 4: Despliegue del Backend

### 4.1 Preparar Variables de Entorno

Crea un archivo `backend/.env.production.local` con valores reales:

```bash
cat > backend/.env.production.local <<EOF
NODE_ENV=production
PORT=8080
DB_PASSWORD=$PASSWORD
JWT_SECRET=$JWT_SECRET
CLOUD_SQL_CONNECTION_NAME=propmanager-production-478716:us-central1:propmanager-db
DB_SOCKET_PATH=/cloudsql/propmanager-production-478716:us-central1:propmanager-db
DB_NAME=propmanager
DB_USER=propmanager-user
CORS_ORIGIN=https://propmanager-frontend-HASH.a.run.app
GCS_BUCKET_NAME=propmanager-uploads
GCS_PROJECT_ID=propmanager-production-478716
EOF
```

### 4.2 Build y Deploy Manual (Primera vez)

```bash
# Navegar al directorio backend
cd backend

# Build con Cloud Build
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_CLOUD_SQL_CONNECTION="propmanager-production-478716:us-central1:propmanager-db",_DB_SOCKET_PATH="/cloudsql/propmanager-production-478716:us-central1:propmanager-db",_DB_NAME="propmanager",_DB_USER="propmanager-user"

# Esto tomará aproximadamente 3-5 minutos
```

### 4.3 Verificar Despliegue del Backend

```bash
# Obtener URL del servicio
BACKEND_URL=$(gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format="value(status.url)")

echo "Backend URL: $BACKEND_URL"

# Test health endpoint
curl $BACKEND_URL/api/v1/health

# Debería retornar: {"status":"ok","timestamp":"..."}
```

### 4.4 Configurar Variables de Entorno en Cloud Run

```bash
# Actualizar CORS_ORIGIN con frontend URL (lo haremos después del deploy de frontend)
# Por ahora, dejarlo como está
```

---

## 🎨 Fase 5: Despliegue del Frontend

### 5.1 Actualizar Variables de Entorno

Actualiza `cloudbuild.yaml` con la URL del backend:

```bash
# Usar la URL del backend que obtuvimos
sed -i "s|_API_URL:.*|_API_URL: '$BACKEND_URL/api/v1'|g" cloudbuild.yaml
```

### 5.2 Build y Deploy Frontend

```bash
# Desde el directorio raíz del proyecto
cd /path/to/propmanager

# Build con Cloud Build
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_API_URL="$BACKEND_URL/api/v1"

# Esto tomará aproximadamente 3-5 minutos
```

### 5.3 Obtener URL del Frontend

```bash
# Obtener URL
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --region=us-central1 \
  --format="value(status.url)")

echo "Frontend URL: $FRONTEND_URL"
echo "Visita: $FRONTEND_URL"
```

### 5.4 Actualizar CORS en Backend

```bash
# Actualizar CORS_ORIGIN en el backend
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --update-env-vars=CORS_ORIGIN="$FRONTEND_URL"

# Verificar
gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

## 🔄 Fase 6: Configuración de CI/CD

### 6.1 Configurar Trigger para Backend

```bash
# Crear trigger para el backend
gcloud builds triggers create github \
  --repo-name=propmanager \
  --repo-owner=2191998moises21 \
  --branch-pattern="^main$" \
  --build-config=backend/cloudbuild.yaml \
  --included-files="backend/**" \
  --name=propmanager-backend-trigger \
  --description="Deploy backend on push to main"

# Verificar
gcloud builds triggers list
```

### 6.2 Configurar Trigger para Frontend

```bash
# Crear trigger para el frontend
gcloud builds triggers create github \
  --repo-name=propmanager \
  --repo-owner=2191998moises21 \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --included-files="src/**,public/**,index.html,package.json,vite.config.ts" \
  --name=propmanager-frontend-trigger \
  --description="Deploy frontend on push to main" \
  --substitutions=_API_URL="$BACKEND_URL/api/v1"

# Verificar
gcloud builds triggers list
```

### 6.3 Conectar Repositorio GitHub

Si aún no has conectado tu repositorio:

1. Ve a Cloud Console: https://console.cloud.google.com/cloud-build/triggers
2. Click en "Connect Repository"
3. Selecciona "GitHub (Cloud Build GitHub App)"
4. Autoriza e instala la app en tu repositorio
5. Selecciona el repositorio `2191998moises21/propmanager`

---

## 🌐 Fase 7: Dominio y SSL

### 7.1 Mapear Dominio Personalizado

**Opción A: Cloud Run Domain Mapping**

```bash
# Para el backend (API)
gcloud run domain-mappings create \
  --service=propmanager-backend \
  --domain=api.tudominio.com \
  --region=us-central1

# Para el frontend
gcloud run domain-mappings create \
  --service=propmanager-frontend \
  --domain=www.tudominio.com \
  --region=us-central1

# Obtener registros DNS
gcloud run domain-mappings describe \
  --domain=api.tudominio.com \
  --region=us-central1
```

**Opción B: Load Balancer con Cloud CDN (Recomendado para producción)**

```bash
# Esto requiere configuración manual en la consola
# Ver: https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless
```

### 7.2 Configurar DNS

Agrega estos registros en tu proveedor de DNS:

```
Type: CNAME
Name: api
Value: ghs.googlehosted.com

Type: CNAME
Name: www
Value: ghs.googlehosted.com

Type: A
Name: @
Value: [IP del Load Balancer si usas Opción B]
```

### 7.3 Verificar SSL

SSL se configura automáticamente. Verificar:

```bash
# Verificar estado del certificado
gcloud run domain-mappings describe \
  --domain=api.tudominio.com \
  --region=us-central1 \
  --format="value(status.certificateStatus)"
```

---

## 📊 Fase 8: Monitoreo y Logging

### 8.1 Configurar Logging

```bash
# Ver logs del backend
gcloud run services logs read propmanager-backend \
  --region=us-central1 \
  --limit=50

# Ver logs del frontend
gcloud run services logs read propmanager-frontend \
  --region=us-central1 \
  --limit=50

# Seguir logs en tiempo real
gcloud run services logs tail propmanager-backend \
  --region=us-central1
```

### 8.2 Crear Log Sink para Errores

```bash
# Crear bucket para logs
gsutil mb -p propmanager-production-478716 \
  -l us-central1 \
  gs://propmanager-logs

# Crear sink para errores
gcloud logging sinks create propmanager-errors \
  storage.googleapis.com/propmanager-logs \
  --log-filter='severity>=ERROR AND resource.type="cloud_run_revision"'

# Verificar
gcloud logging sinks describe propmanager-errors
```

### 8.3 Configurar Alertas

1. Ve a Cloud Console → Monitoring → Alerting
2. Crea políticas de alerta para:
   - Error rate > 5%
   - Latency > 2 segundos
   - Uptime < 99%
   - Cloud SQL connections > 18 (90% del límite)

### 8.4 Dashboard de Monitoreo

```bash
# El dashboard se crea automáticamente en Cloud Console
# Acceder en: https://console.cloud.google.com/monitoring/dashboards
```

---

## ✅ Verificación y Testing

### Test del Backend

```bash
# Health check
curl $BACKEND_URL/api/v1/health

# Login test (con datos de prueba)
curl -X POST $BACKEND_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propmanager.com",
    "password": "password123",
    "role": "superadmin"
  }'
```

### Test del Frontend

```bash
# Verificar que carga
curl -I $FRONTEND_URL

# Verificar health
curl $FRONTEND_URL/health
```

### Test de Cloud SQL Connection

```bash
# Ejecutar query de prueba
gcloud sql connect propmanager-db --user=propmanager-user

# En psql
SELECT COUNT(*) FROM owners;
SELECT COUNT(*) FROM properties;
\q
```

### Test de Cloud Storage

```bash
# Subir archivo de prueba
echo "test" > test.txt
gsutil cp test.txt gs://propmanager-uploads/test/

# Verificar
gsutil ls gs://propmanager-uploads/test/

# Limpiar
gsutil rm gs://propmanager-uploads/test/test.txt
```

---

## 🎯 Fase 9: Verificación Final y Post-Deployment

Una vez completadas las Fases 1-8, sigue estos pasos para verificar que todo funcione correctamente y configurar los ajustes finales.

### 9.1 Verificar Deployments

```bash
# Listar servicios desplegados
gcloud run services list \
  --project=propmanager-production-478716 \
  --region=us-central1

# Verificar el backend
BACKEND_URL=$(gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

echo "Backend URL: $BACKEND_URL"

# Verificar el frontend
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

echo "Frontend URL: $FRONTEND_URL"
```

**Resultado esperado:**
```
Backend URL: https://propmanager-340512713682.us-central1.run.app
Frontend URL: https://propmanager-frontend-XXXXX-uc.a.run.app
```

### 9.2 Configurar CORS (CRÍTICO)

El frontend necesita permisos para hacer llamadas al backend:

```bash
# Actualizar backend con CORS_ORIGIN del frontend
gcloud run services update propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --update-env-vars CORS_ORIGIN="$FRONTEND_URL"
```

**Verificar configuración:**
```bash
gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='yaml(spec.template.spec.containers[0].env)'
```

Busca `CORS_ORIGIN` en la salida y verifica que tiene la URL correcta del frontend.

### 9.3 Verificación del Backend

```bash
# Test de health check
curl $BACKEND_URL/api/v1/health

# Debe responder:
# {"success":true,"data":{"status":"ok","timestamp":"..."}}
```

**Si falla:**
- Verifica logs: `gcloud run services logs read propmanager-backend --limit=50`
- Verifica Cloud SQL está corriendo: `gcloud sql instances list`
- Verifica conexión Cloud SQL configurada en Cloud Run

### 9.4 Verificación del Frontend

#### Test 1: Verificar que el sitio carga
```bash
curl -I $FRONTEND_URL
```

**Debe responder:** `HTTP/2 200`

#### Test 2: Verificar API URL en el navegador

1. Abre `$FRONTEND_URL` en Chrome/Firefox
2. Abre DevTools (F12) → Console
3. Ejecuta:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
4. **Debe mostrar:** `https://propmanager-340512713682.us-central1.run.app/api/v1`

**Si muestra un placeholder o URL incorrecta:**
- El frontend se desplegó con configuración incorrecta
- Re-despliega: `gcloud builds submit --config=cloudbuild.yaml`

### 9.5 Test End-to-End de Registro

1. Abre el frontend en el navegador
2. Click en "Registrarse"
3. Selecciona "Propietario"
4. Llena el formulario:
   ```
   Nombre: Test User
   Email: test@example.com
   Password: Test123456
   Teléfono: +1234567890
   Dirección: Test Address 123
   ```
5. Click "Crear Cuenta"

**Resultado esperado:**
- ✅ No hay error "Failed to fetch"
- ✅ No hay error "CORS policy blocked"
- ✅ Eres redirigido al dashboard
- ✅ En Network tab (DevTools) ves request exitoso a `/api/v1/auth/register/owner` con status 201

**Si hay errores:**
- Ver sección [Troubleshooting Completo](#troubleshooting-completo) abajo

### 9.6 Verificar Datos en Cloud SQL

```bash
# Conectarse a la base de datos
gcloud sql connect propmanager-db \
  --user=propmanager-user \
  --database=propmanager

# Verificar que el usuario se creó
SELECT email, nombre_completo, tipo FROM owners WHERE email = 'test@example.com';

# Salir
\q
```

### 9.7 Checklist Final

Antes de considerar el deployment completo, verifica:

- [ ] **Backend desplegado y respondiendo** - `curl $BACKEND_URL/api/v1/health` retorna 200
- [ ] **Frontend desplegado y cargando** - `curl -I $FRONTEND_URL` retorna 200
- [ ] **CORS configurado** - Frontend puede hacer llamadas al backend sin errores
- [ ] **API URL correcta en frontend** - `import.meta.env.VITE_API_URL` muestra URL real del backend
- [ ] **Cloud SQL conectado** - Backend puede leer/escribir en la base de datos
- [ ] **Registro funciona** - Puedes crear una cuenta desde el frontend
- [ ] **Login funciona** - Puedes iniciar sesión con la cuenta creada
- [ ] **Cloud Storage configurado** - Bucket existe y tiene permisos correctos
- [ ] **Secrets Manager configurado** - DB_PASSWORD y JWT_SECRET existen
- [ ] **Monitoreo activo** - Logs aparecen en Cloud Logging
- [ ] **Backups automáticos** - Cloud SQL tiene backups habilitados

### 9.8 URLs de Referencia

Guarda estas URLs para acceso rápido:

| Servicio | URL | Notas |
|----------|-----|-------|
| **Frontend (App)** | `$FRONTEND_URL` | URL pública de la aplicación |
| **Backend API** | `$BACKEND_URL/api/v1` | Base URL para todas las llamadas API |
| **Health Check** | `$BACKEND_URL/api/v1/health` | Verificación del backend |
| **Cloud Console** | https://console.cloud.google.com | Panel de administración GCP |
| **Cloud Run** | https://console.cloud.google.com/run?project=propmanager-production-478716 | Servicios desplegados |
| **Cloud SQL** | https://console.cloud.google.com/sql?project=propmanager-production-478716 | Base de datos |
| **Cloud Build** | https://console.cloud.google.com/cloud-build?project=propmanager-production-478716 | Historial de builds |
| **Logs** | https://console.cloud.google.com/logs?project=propmanager-production-478716 | Logs centralizados |

---

## 💰 Costos Estimados

### Desglose Mensual (Primeros 1000 usuarios)

```
Cloud Run (Backend):
  - CPU/Memory: ~$5-10/mes
  - Requests: Incluido en free tier

Cloud Run (Frontend):
  - CPU/Memory: ~$3-5/mes
  - Requests: Incluido en free tier

Cloud SQL (db-f1-micro):
  - Instancia: $7.67/mes
  - Storage 10GB: $1.70/mes
  - Backup: $0.50-1/mes

Cloud Storage:
  - Uploads (10GB): $0.20/mes
  - Operations: $0.10/mes

Cloud Build:
  - 120 builds/mes: Gratis (free tier)

Secrets Manager:
  - 2 secrets: $0.12/mes

Networking:
  - Egress: $1-5/mes

──────────────────────────
TOTAL ESTIMADO: $20-30/mes
──────────────────────────

Con 10,000 usuarios:
  - Cloud Run: $30-50/mes
  - Cloud SQL (upgrade): $50-100/mes
  - Storage: $5-10/mes
  - Total: ~$85-160/mes

Con 100,000+ usuarios:
  - Cloud Run: $200-300/mes
  - Cloud SQL (custom): $200-400/mes
  - CDN: $50-100/mes
  - Total: ~$450-800/mes
```

### Optimización de Costos

```bash
# Reducir instancias mínimas a 0
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=0

# Configurar auto-scaling
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --max-instances=10 \
  --cpu=1 \
  --memory=512Mi
```

---

## 🔧 Troubleshooting Completo

Esta sección cubre los problemas más comunes encontrados durante y después del deployment.

### ⚠️ ERROR CRÍTICO: "Failed to fetch" en el Frontend

**Síntomas:**
- Al hacer login/registro aparece error "TypeError: Failed to fetch"
- Network tab en DevTools muestra requests fallidos
- Console muestra errores de red

**Causa raíz:**
El frontend está intentando conectarse a una URL placeholder o incorrecta del backend.

**Solución paso a paso:**

```bash
# 1. Verificar que el backend está desplegado
gcloud run services list \
  --project=propmanager-production-478716 \
  --region=us-central1

# 2. Obtener URL real del backend
BACKEND_URL=$(gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

echo "Backend URL: $BACKEND_URL"

# 3. Verificar que el backend responde
curl $BACKEND_URL/api/v1/health

# 4. Si el backend responde correctamente, el problema está en el frontend
# Verificar la API URL configurada en cloudbuild.yaml (línea 82)
# Debe ser: _API_URL: 'https://propmanager-340512713682.us-central1.run.app/api/v1'

# 5. Re-desplegar frontend con URL correcta
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716

# 6. Verificar en el navegador
# Abrir DevTools → Console
# Ejecutar: console.log(import.meta.env.VITE_API_URL)
# Debe mostrar: https://propmanager-340512713682.us-central1.run.app/api/v1
```

**Script automatizado:**
```bash
./scripts/update-frontend-api-url.sh
```

---

### ⚠️ ERROR CRÍTICO: "CORS policy blocked"

**Síntomas:**
- Error en Console: "blocked by CORS policy"
- Frontend puede cargar pero no puede hacer llamadas API
- Network tab muestra requests con status "(blocked:cors)"

**Causa:**
El backend no tiene configurada la URL del frontend en CORS_ORIGIN.

**Solución:**

```bash
# 1. Obtener URL del frontend
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='value(status.url)')

echo "Frontend URL: $FRONTEND_URL"

# 2. Actualizar backend con CORS
gcloud run services update propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --update-env-vars CORS_ORIGIN="$FRONTEND_URL"

# 3. Verificar configuración
gcloud run services describe propmanager-backend \
  --project=propmanager-production-478716 \
  --region=us-central1 \
  --format='yaml(spec.template.spec.containers[0].env)' | grep CORS_ORIGIN
```

---

### ⚠️ ERROR: Build failed "vite: not found"

**Síntomas:**
- Cloud Build falla con "sh: vite: not found"
- Error code 127 en el build step
- Build warning: "EBADENGINE Unsupported engine"

**Causa:**
- Dockerfile usa Node.js 18 en lugar de Node.js 20
- O usa `npm ci --only=production` que no instala devDependencies (Vite está en devDependencies)

**Solución:**

Verifica que el Dockerfile tenga:

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS builder  # ← Debe ser Node 20, no 18
WORKDIR /app
COPY package*.json ./
RUN npm ci  # ← Debe ser solo "npm ci", NO "--only=production"
# ... resto del Dockerfile
```

```dockerfile
# Backend Dockerfile
FROM node:20-alpine AS builder  # ← Debe ser Node 20, no 18
WORKDIR /app
COPY package*.json ./
RUN npm ci  # ← En el builder, instala TODO (incluyendo devDependencies)
# ... resto del Dockerfile
```

---

### ⚠️ ERROR: Build failed "invalid build: invalid image name"

**Síntomas:**
- Error: `invalid image name "gcr.io/.../:"`
- Build falla inmediatamente al subir el código

**Causa:**
La variable `$COMMIT_SHA` está vacía cuando ejecutas el build manualmente.

**Solución:**

```bash
# En lugar de:
gcloud builds submit --config=cloudbuild.yaml

# Usa:
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=propmanager-production-478716 \
  --substitutions=COMMIT_SHA=$(git rev-parse --short HEAD)
```

---

### Problema: Backend no se conecta a Cloud SQL

```bash
# Verificar connection string
gcloud sql instances describe propmanager-db \
  --format="value(connectionName)"

# Verificar que Cloud Run tiene permisos
gcloud run services get-iam-policy propmanager-backend \
  --region=us-central1

# Ver logs de conexión
gcloud run services logs read propmanager-backend \
  --region=us-central1 \
  --limit=100 | grep -i "database\|sql"
```

### Problema: Secrets no son accesibles

```bash
# Verificar que existen
gcloud secrets list

# Verificar permisos
gcloud secrets get-iam-policy propmanager-db-password

# Agregar permisos si faltan
PROJECT_NUMBER=$(gcloud projects describe propmanager-production-478716 --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding propmanager-db-password \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Problema: CORS errors en el frontend

```bash
# Actualizar CORS origin
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --update-env-vars=CORS_ORIGIN="$FRONTEND_URL,https://tudominio.com"

# Verificar
gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format="yaml(spec.template.spec.containers[0].env)"
```

### Problema: Build falla en Cloud Build

```bash
# Ver logs del último build
gcloud builds list --limit=1
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID

# Ver configuración del trigger
gcloud builds triggers describe propmanager-backend-trigger
```

### Problema: Cloud Run out of memory

```bash
# Aumentar memoria
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --memory=1Gi

# Ver uso de memoria
gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].resources)"
```

---

## 🔄 Mantenimiento

### Backups Automáticos

```bash
# Verificar backups de Cloud SQL
gcloud sql backups list --instance=propmanager-db

# Crear backup manual
gcloud sql backups create --instance=propmanager-db

# Restaurar desde backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=propmanager-db \
  --backup-id=BACKUP_ID
```

### Updates y Rollbacks

```bash
# Ver revisiones de Cloud Run
gcloud run revisions list \
  --service=propmanager-backend \
  --region=us-central1

# Rollback a revisión anterior
gcloud run services update-traffic propmanager-backend \
  --region=us-central1 \
  --to-revisions=REVISION_NAME=100

# Gradual rollout (canary)
gcloud run services update-traffic propmanager-backend \
  --region=us-central1 \
  --to-revisions=NEW_REVISION=10,OLD_REVISION=90
```

### Limpieza de Recursos No Usados

```bash
# Listar imágenes viejas
gcloud container images list-tags gcr.io/propmanager-production-478716/propmanager-backend

# Eliminar imágenes viejas (mantener últimas 5)
# Script de limpieza disponible en scripts/cleanup-images.sh
```

---

## 📚 Referencias

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa esta documentación
2. Consulta los logs en Cloud Console
3. Revisa `RUNBOOK.md` para procedimientos operacionales
4. Abre un issue en GitHub

---

**¡PropManager está ahora en producción en Google Cloud Platform! 🎉**

Última actualización: 2025-11-19
