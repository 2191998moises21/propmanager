# 🔄 Flujo de Variables de Entorno: Desarrollo vs Producción

## ✅ TL;DR - Respuesta Directa

**NO, los archivos `.env` locales NO afectan el deployment a Google Cloud.**

Los archivos `.env` están en `.gitignore` y nunca se suben a Git ni a GCP.

---

## 📊 Flujo Completo de Variables de Entorno

```
┌─────────────────────────────────────────────────────────────────┐
│                     DESARROLLO LOCAL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📁 .env (Frontend)                                             │
│  ├─ VITE_API_URL=http://localhost:3001/api/v1                  │
│  ├─ VITE_ENABLE_MOCK_DATA=true                                 │
│  └─ ⚠️  En .gitignore - NO se sube a Git                       │
│                                                                 │
│  📁 backend/.env                                                │
│  ├─ DB_HOST=localhost                                           │
│  ├─ DB_PASSWORD=postgres                                        │
│  └─ ⚠️  En .gitignore - NO se sube a Git                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                         git push
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         REPOSITORIO GIT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ .env.example (Frontend) - SOLO REFERENCIA                   │
│  ✅ .env.production (Frontend) - SOLO REFERENCIA                │
│  ✅ backend/.env.example - SOLO REFERENCIA                      │
│  ✅ backend/.env.production - SOLO REFERENCIA                   │
│                                                                 │
│  ❌ .env - NO EXISTE (está en .gitignore)                      │
│  ❌ backend/.env - NO EXISTE (está en .gitignore)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                      Cloud Build Trigger
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD BUILD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔨 cloudbuild.yaml (Frontend)                                  │
│  ├─ --build-arg VITE_API_URL=${_API_URL}                       │
│  └─ Variables inyectadas en build time                          │
│                                                                 │
│  🔨 cloudbuild.yaml (Backend)                                   │
│  ├─ Variables NO necesarias en build                            │
│  └─ Se configuran en Cloud Run después                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                       Deploy a Cloud Run
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD RUN                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚀 Frontend Container                                          │
│  ├─ Variables embebidas en build (desde cloudbuild.yaml)        │
│  └─ VITE_API_URL=https://propmanager-backend-XXX.run.app/...   │
│                                                                 │
│  🚀 Backend Container                                           │
│  ├─ Variables de entorno de Cloud Run:                          │
│  │  ├─ NODE_ENV=production                                     │
│  │  ├─ DB_HOST=/cloudsql/propmanager-production-...            │
│  │  └─ CORS_ORIGIN=https://propmanager-frontend-XXX.run.app    │
│  │                                                              │
│  └─ Secrets desde Secret Manager:                               │
│     ├─ DB_PASSWORD → propmanager-db-password:latest            │
│     └─ JWT_SECRET → jwt-secret:latest                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Separación de Entornos

### Desarrollo Local
```bash
# Frontend
.env                     # ✅ Existe localmente
                        # ❌ NO se sube a Git
                        # 🎯 Uso: npm run dev

# Backend
backend/.env            # ✅ Existe localmente
                        # ❌ NO se sube a Git
                        # 🎯 Uso: npm run dev
```

### Producción (Google Cloud)
```bash
# Frontend
# ❌ NO usa archivos .env
# ✅ Variables inyectadas en build time via cloudbuild.yaml
# 🎯 Ejemplo: --build-arg VITE_API_URL=https://backend.run.app

# Backend
# ❌ NO usa archivos .env
# ✅ Variables de entorno configuradas en Cloud Run
# ✅ Secrets desde Secret Manager
# 🎯 Configuradas con: gcloud run services update --set-env-vars
```

---

## 📝 Archivos y su Propósito

| Archivo | Git | Dev Local | Cloud Build | Cloud Run | Propósito |
|---------|-----|-----------|-------------|-----------|-----------|
| `.env` | ❌ No | ✅ Usa | ❌ No | ❌ No | Desarrollo local |
| `.env.example` | ✅ Sí | 📖 Ref | 📖 Ref | ❌ No | Documentación |
| `.env.production` | ✅ Sí | 📖 Ref | 📖 Ref | ❌ No | Referencia para producción |
| `cloudbuild.yaml` | ✅ Sí | ❌ No | ✅ Usa | ❌ No | Define build de producción |
| Cloud Run env vars | ❌ No | ❌ No | ❌ No | ✅ Usa | Variables en runtime |
| Secret Manager | ❌ No | ❌ No | ❌ No | ✅ Usa | Passwords/Secrets |

---

## 🎯 Cómo se Configuran las Variables en Producción

### Frontend (Build Time)

Las variables se inyectan **durante el build** en `cloudbuild.yaml`:

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'VITE_API_URL=${_API_URL}'  # ← Variable de Cloud Build
      - '--build-arg'
      - 'VITE_GCP_PROJECT_ID=$PROJECT_ID'
      - '.'
```

Se configuran en el **trigger de Cloud Build**:
```bash
gcloud builds triggers create github \
  --substitutions=_API_URL="https://backend.run.app/api/v1"
```

### Backend (Runtime)

Las variables se configuran **en Cloud Run**:

```bash
# Variables normales
gcloud run services update propmanager-backend \
  --set-env-vars NODE_ENV=production \
  --set-env-vars CORS_ORIGIN=https://frontend.run.app

# Secrets desde Secret Manager
gcloud run services update propmanager-backend \
  --update-secrets DB_PASSWORD=propmanager-db-password:latest \
  --update-secrets JWT_SECRET=jwt-secret:latest
```

O en `cloudbuild.yaml`:
```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  args:
    - 'run'
    - 'deploy'
    - '--set-env-vars'
    - 'NODE_ENV=production'
    - '--update-secrets'
    - 'DB_PASSWORD=propmanager-db-password:latest'
```

---

## ✅ Verificación: ¿Qué se Sube a Git?

```bash
# Ver archivos ignorados
cat .gitignore | grep env

# Resultado:
.env                    # ← TU ARCHIVO LOCAL (ignorado)
.env.local
.env.*.local

# Ver qué SÍ está en Git
git ls-files | grep env

# Resultado:
.env.example            # ← Referencia (SÍ se sube)
.env.production         # ← Referencia (SÍ se sube)
backend/.env.example    # ← Referencia (SÍ se sube)
backend/.env.production # ← Referencia (SÍ se sube)
```

---

## 🚀 Flujo de Deployment Paso a Paso

### 1. Desarrollo Local
```bash
# Trabajas con .env local
echo "VITE_API_URL=http://localhost:3001/api/v1" > .env

npm run dev  # ✅ Usa .env
```

### 2. Commit y Push
```bash
git add .
git commit -m "feat: nueva feature"
git push origin main

# ⚠️ .env NO se sube (está en .gitignore)
```

### 3. Cloud Build Detecta Push
```bash
# Cloud Build se activa automáticamente
# Lee cloudbuild.yaml
# NO tiene acceso a tu .env local
```

### 4. Build con Variables de Producción
```bash
# Cloud Build usa variables de substitution
VITE_API_URL=https://propmanager-backend-XXX.run.app/api/v1

# Frontend: Variables embebidas en build
# Backend: Variables configuradas en Cloud Run
```

### 5. Deploy a Cloud Run
```bash
# Contenedores desplegados con variables de producción
# ✅ Frontend: VITE_API_URL apunta a backend en Cloud Run
# ✅ Backend: DB_HOST apunta a Cloud SQL
# ✅ Secrets desde Secret Manager
```

---

## 🔒 Seguridad

### ✅ Buenas Prácticas Implementadas

1. **`.env` en `.gitignore`**
   - Secrets locales NO se suben a Git
   - Cada desarrollador tiene su propio .env

2. **Secret Manager para Producción**
   - Passwords NO están en código
   - Acceso controlado por IAM
   - Versionamiento de secrets

3. **Variables por Entorno**
   - Dev: `localhost`
   - Prod: `*.run.app`
   - No hay mezcla

4. **Archivos `.example` como Documentación**
   - Otros desarrolladores saben qué variables necesitan
   - NO contienen valores reales

---

## 📋 Checklist: Antes de Deployment

- [x] `.env` está en `.gitignore` ✅
- [x] `.env.example` está en Git ✅
- [x] `.env.production` documenta variables de prod ✅
- [x] `cloudbuild.yaml` tiene substitutions ✅
- [x] Secret Manager configurado ✅
- [x] Variables de Cloud Run configuradas ✅

---

## 🎓 Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Mi `.env` local se sube a Git? | ❌ NO (está en `.gitignore`) |
| ¿Afecta el deployment a GCP? | ❌ NO (GCP usa sus propias variables) |
| ¿Dónde se configuran variables de producción? | ✅ Cloud Build (frontend) + Cloud Run (backend) |
| ¿Los secrets están seguros? | ✅ SÍ (en Secret Manager, no en código) |
| ¿Puedo tener diferentes valores dev/prod? | ✅ SÍ (exactamente para eso existe .env local) |

---

## 💡 Ejemplo Práctico

**Desarrollo Local:**
```env
# .env (local, NO en Git)
VITE_API_URL=http://localhost:3001/api/v1
```

**Producción en GCP:**
```yaml
# cloudbuild.yaml (SÍ en Git)
substitutions:
  _API_URL: 'https://propmanager-backend-abc123.run.app/api/v1'
```

**Resultado:**
- ✅ En desarrollo: Frontend llama a `localhost:3001`
- ✅ En producción: Frontend llama a `propmanager-backend-abc123.run.app`
- ✅ **Completamente separados y seguros**

---

## 🎯 Conclusión

**Tu `.env` local es SOLO para desarrollo local y NUNCA afecta producción.**

Cuando despliegues a Google Cloud:
1. Cloud Build usará las variables definidas en `cloudbuild.yaml`
2. Cloud Run usará las variables configuradas con `gcloud run services update`
3. Los secrets vendrán de Secret Manager
4. Tu `.env` local nunca será consultado ni usado

**¡Puedes trabajar tranquilo en local sin preocuparte por producción!** 🚀

---

**Última actualización:** 2025-11-26
**Autor:** DevOps Team PropManager
