# PropManager Backend API

REST API backend para el sistema de gestión de propiedades PropManager. Construido con Express, TypeScript y PostgreSQL, listo para desplegar en Google Cloud.

## 🚀 Características

- ✅ **API REST** con Express y TypeScript
- ✅ **Base de datos PostgreSQL** con esquemas completos
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Validación de inputs** con Zod
- ✅ **Seguridad** con Helmet, CORS, Rate Limiting
- ✅ **Logging** estructurado con Winston
- ✅ **Error handling** centralizado
- ✅ **Tests** con Jest y Supertest
- ✅ **Listo para Google Cloud** (Cloud Run + Cloud SQL)

## 📋 Requisitos

- Node.js 18+ y npm
- PostgreSQL 14+
- Google Cloud SDK (para despliegue)

## 🛠️ Instalación Local

### 1. Clonar e instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar PostgreSQL

```bash
# Crear base de datos
createdb propmanager

# O con psql:
psql -U postgres
CREATE DATABASE propmanager;
\q
```

### 4. Ejecutar migraciones (crear tablas)

```bash
# Conectar a PostgreSQL y ejecutar el schema
psql -U postgres -d propmanager -f src/config/schema.sql
```

### 5. Iniciar servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📡 Endpoints de API

### Autenticación

```
POST   /api/v1/auth/login                 - Login de usuario
POST   /api/v1/auth/register/owner        - Registro de propietario
POST   /api/v1/auth/register/tenant       - Registro de inquilino
GET    /api/v1/auth/profile               - Obtener perfil (requiere auth)
POST   /api/v1/auth/change-password       - Cambiar contraseña (requiere auth)
```

### Propiedades

```
GET    /api/v1/properties/my              - Mis propiedades (Owner)
GET    /api/v1/properties/search          - Buscar propiedades (SuperAdmin)
GET    /api/v1/properties/:id             - Obtener propiedad por ID
POST   /api/v1/properties                 - Crear propiedad (Owner)
PUT    /api/v1/properties/:id             - Actualizar propiedad
DELETE /api/v1/properties/:id             - Eliminar propiedad
```

### Health Check

```
GET    /api/v1/health                     - Estado del servidor
GET    /                                  - Información de la API
```

## 🧪 Tests

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🔒 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación.

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.prop@email.com",
    "password": "password123",
    "role": "owner"
  }'
```

### Usar token en requests

```bash
curl -X GET http://localhost:3001/api/v1/properties/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐳 Docker

### Build imagen

```bash
docker build -t propmanager-backend .
```

### Ejecutar con Docker

```bash
docker run -p 3001:3001 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  propmanager-backend
```

## ☁️ Despliegue en Google Cloud

### Prerrequisitos

1. Proyecto de Google Cloud creado
2. Cloud SQL PostgreSQL instancia creada
3. Bucket de Cloud Storage creado
4. gcloud CLI instalado y configurado

### Paso 1: Configurar Cloud SQL

```bash
# Crear instancia de PostgreSQL
gcloud sql instances create propmanager-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Crear base de datos
gcloud sql databases create propmanager \
  --instance=propmanager-db

# Crear usuario
gcloud sql users create propmanager-user \
  --instance=propmanager-db \
  --password=SECURE_PASSWORD
```

### Paso 2: Ejecutar migraciones en Cloud SQL

```bash
# Conectar a Cloud SQL
gcloud sql connect propmanager-db --user=postgres

# En psql, ejecutar:
\c propmanager
\i src/config/schema.sql
\q
```

### Paso 3: Desplegar en Cloud Run

```bash
# Construir y subir imagen
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/propmanager-backend

# Desplegar en Cloud Run
gcloud run deploy propmanager-backend \
  --image gcr.io/YOUR_PROJECT_ID/propmanager-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:propmanager-db \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "DB_HOST=/cloudsql/YOUR_PROJECT_ID:us-central1:propmanager-db" \
  --set-env-vars "DB_NAME=propmanager" \
  --set-env-vars "DB_USER=propmanager-user" \
  --set-secrets "DB_PASSWORD=propmanager-db-password:latest" \
  --set-secrets "JWT_SECRET=jwt-secret:latest"
```

### Paso 4: Configurar secrets

```bash
# Crear secrets en Secret Manager
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create propmanager-db-password --data-file=-
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# Dar permisos al servicio de Cloud Run
gcloud secrets add-iam-policy-binding propmanager-db-password \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

## 🔧 Variables de Entorno

Ver `.env.example` para la lista completa de variables. Las más importantes:

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NODE_ENV` | Ambiente (development/production) | ✅ |
| `PORT` | Puerto del servidor | ✅ |
| `DATABASE_URL` | URL de conexión PostgreSQL | ✅ |
| `DB_HOST` | Host de PostgreSQL | ✅ |
| `DB_PASSWORD` | Contraseña de PostgreSQL | ✅ |
| `JWT_SECRET` | Secret para firmar JWTs | ✅ |
| `CORS_ORIGIN` | Orígenes permitidos para CORS | ✅ |
| `GCS_BUCKET_NAME` | Bucket de Cloud Storage | ❌ |

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB, logger)
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── schema.sql
│   ├── controllers/     # Lógica de negocio
│   │   ├── authController.ts
│   │   └── propertyController.ts
│   ├── middleware/      # Middleware personalizado
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── models/          # Acceso a datos
│   │   ├── authModel.ts
│   │   └── propertyModel.ts
│   ├── routes/          # Rutas de API
│   │   ├── authRoutes.ts
│   │   ├── propertyRoutes.ts
│   │   └── index.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── validators/      # Esquemas de validación Zod
│   │   ├── authValidators.ts
│   │   └── propertyValidators.ts
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Entry point
├── .env.example         # Variables de entorno de ejemplo
├── .dockerignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

ISC

## 💡 Próximos pasos (TODO)

- [ ] Implementar endpoints de Contratos
- [ ] Implementar endpoints de Pagos
- [ ] Implementar endpoints de Tickets
- [ ] Implementar endpoints de Inquilinos
- [ ] Agregar upload de archivos a Cloud Storage
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar Swagger/OpenAPI documentation
- [ ] Implementar sistema de roles y permisos más granular
- [ ] Agregar tests de integración completos
- [ ] Implementar CI/CD con Cloud Build
