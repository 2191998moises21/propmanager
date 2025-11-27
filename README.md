# 🏢 PropManager - Property Management SaaS

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.18-38B2AC?logo=tailwind-css)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)

**PropManager** es una solución fullstack completa de gestión de propiedades diseñada específicamente para el mercado latinoamericano. Permite a propietarios e inquilinos gestionar propiedades, contratos, pagos y mantenimiento desde una interfaz moderna e intuitiva con un backend robusto y seguro.

---

## ✨ Características Principales

### Para Propietarios 🏠
- ✅ **Gestión de Propiedades**: CRUD completo con API REST
- ✅ **Gestión de Inquilinos**: Administración completa con base de datos
- ✅ **Contratos Inteligentes**: Creación, seguimiento y terminación
- ✅ **Control de Pagos**: Seguimiento en tiempo real con comprobantes
- ✅ **Dashboard Analítico**: Métricas en tiempo real desde PostgreSQL
- ✅ **Tickets de Mantenimiento**: Sistema completo de solicitudes
- ✅ **Autenticación Segura**: JWT + bcrypt para máxima seguridad

### Para Inquilinos 🏘️
- ✅ **Portal Personal**: Acceso a propiedad y contrato
- ✅ **Gestión de Pagos**: Carga de comprobantes validados
- ✅ **Tickets de Mantenimiento**: Creación con fotos
- ✅ **Documentación**: Acceso seguro a documentos del contrato

### Para Super Administradores 👨‍💼
- ✅ **Panel de Control Total**: Vista de toda la plataforma
- ✅ **Gestión de Usuarios**: Propietarios e inquilinos
- ✅ **Reportes Avanzados**: Analytics y estadísticas globales
- ✅ **Logs de Actividad**: Auditoría completa del sistema
- ✅ **Configuración del Sistema**: Parámetros globales

---

## 🚀 Tecnologías

### Frontend
- **React 19.2** - Última versión con React Compiler
- **TypeScript 5.8** - Tipado estático estricto
- **Tailwind CSS 3.4** - Estilos utilitarios modernos
- **Vite 6** - Build tool ultra-rápido
- **React Hook Form 7.66** - Gestión de formularios
- **Zod 4.1** - Validación de esquemas type-safe

### Backend (✨ NUEVO)
- **Express.js 4.18** - Framework web robusto
- **TypeScript 5.3** - Backend tipado
- **PostgreSQL 14+** - Base de datos relacional
- **JWT** - Autenticación segura con tokens
- **bcrypt** - Hash de contraseñas
- **Zod** - Validación de inputs
- **Winston** - Logging estructurado
- **Helmet + CORS** - Seguridad HTTP

### Herramientas de Desarrollo
- **ESLint 9** - Linting moderno
- **Prettier 3.6** - Formateo consistente
- **Vitest 4** - Testing ultra-rápido
- **Jest 29** - Testing backend
- **Docker** - Containerización
- **Google Cloud** - Despliegue en producción

---

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0 (recomendado 20.x LTS)
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git** >= 2.30.0
- **Google Cloud SDK** (para despliegue)

---

## 🛠️ Instalación Completa

### Opción 1: Instalación Rápida (Todo en uno)

```bash
# 1. Clonar repositorio
git clone https://github.com/2191998moises21/propmanager.git
cd propmanager

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Configurar PostgreSQL
createdb propmanager
psql -d propmanager -f src/config/schema.sql

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 6. Iniciar backend (Terminal 1)
npm run dev
# Backend corriendo en http://localhost:3001

# 7. Iniciar frontend (Terminal 2)
cd ..
npm run dev
# Frontend corriendo en http://localhost:5173
```

### Opción 2: Instalación Detallada

#### A. Frontend

```bash
# 1. Clonar e instalar
git clone https://github.com/2191998moises21/propmanager.git
cd propmanager
npm install

# 2. Configurar variables de entorno
cp .env.example .env
```

Editar `.env`:
```env
VITE_APP_NAME=PropManager
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:3001/api/v1
VITE_ENV=development
```

```bash
# 3. Iniciar frontend
npm run dev
```

#### B. Backend

```bash
# 1. Navegar al backend
cd backend
npm install

# 2. Configurar PostgreSQL
createdb propmanager

# 3. Ejecutar migraciones
psql -d propmanager -f src/config/schema.sql

# 4. Configurar variables de entorno
cp .env.example .env
```

Editar `backend/.env`:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=propmanager
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu-secret-super-seguro-cambialo
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

```bash
# 5. Iniciar backend
npm run dev
```

---

## 📡 API REST Completa

### Endpoints Disponibles (31 endpoints)

#### **Autenticación**
```
POST   /api/v1/auth/login                 - Login de usuario
POST   /api/v1/auth/register/owner        - Registro de propietario
POST   /api/v1/auth/register/tenant       - Registro de inquilino
GET    /api/v1/auth/profile               - Obtener perfil
POST   /api/v1/auth/change-password       - Cambiar contraseña
```

#### **Propiedades**
```
GET    /api/v1/properties/my              - Mis propiedades
GET    /api/v1/properties/search          - Buscar (SuperAdmin)
GET    /api/v1/properties/:id             - Obtener propiedad
POST   /api/v1/properties                 - Crear propiedad
PUT    /api/v1/properties/:id             - Actualizar propiedad
DELETE /api/v1/properties/:id             - Eliminar propiedad
```

#### **Contratos**
```
GET    /api/v1/contracts/my               - Mis contratos
GET    /api/v1/contracts/:id              - Obtener contrato
POST   /api/v1/contracts                  - Crear contrato
PUT    /api/v1/contracts/:id              - Actualizar contrato
POST   /api/v1/contracts/:id/terminate    - Terminar contrato
GET    /api/v1/contracts/:id/documents    - Obtener documentos
POST   /api/v1/contracts/:id/documents    - Agregar documento
```

#### **Pagos**
```
GET    /api/v1/payments/my                - Mis pagos
GET    /api/v1/payments/pending           - Pagos pendientes
GET    /api/v1/payments/contract/:id      - Pagos por contrato
GET    /api/v1/payments/:id               - Obtener pago
POST   /api/v1/payments                   - Crear pago
PUT    /api/v1/payments/:id               - Actualizar pago
POST   /api/v1/payments/:id/proof         - Subir comprobante
```

#### **Tickets**
```
GET    /api/v1/tickets/my                 - Mis tickets
GET    /api/v1/tickets/property/:id       - Tickets por propiedad
GET    /api/v1/tickets/:id                - Obtener ticket
POST   /api/v1/tickets                    - Crear ticket
PUT    /api/v1/tickets/:id                - Actualizar ticket
DELETE /api/v1/tickets/:id                - Eliminar ticket
```

#### **Inquilinos**
```
GET    /api/v1/tenants                    - Listar inquilinos
GET    /api/v1/tenants/:id                - Obtener inquilino
PUT    /api/v1/tenants/:id                - Actualizar inquilino
DELETE /api/v1/tenants/:id                - Eliminar inquilino
```

#### **Health Check**
```
GET    /api/v1/health                     - Estado del servidor
```

Ver documentación completa en `backend/README.md`

---

## 📦 Scripts Disponibles

### Frontend
```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build producción
npm run preview          # Preview del build
npm run test             # Tests
npm run test:ui          # UI de testing
npm run test:coverage    # Cobertura
npm run lint             # ESLint
npm run lint:fix         # Auto-fix ESLint
npm run format           # Prettier
npm run type-check       # TypeScript check
```

### Backend
```bash
cd backend
npm run dev              # Servidor desarrollo (hot-reload)
npm run build            # Compilar TypeScript
npm run start            # Producción
npm run test             # Tests
npm run test:coverage    # Cobertura
npm run lint             # ESLint
npm run migrate          # Ejecutar migraciones
npm run seed             # Seed de datos
```

---

## 🎭 Usuarios de Prueba

### Propietario
```
Email: carlos.prop@email.com
Password: password123
```

### Inquilino
```
Email: maria.r@email.com
Password: password123
```

### Super Admin
```
Email: admin@propmanager.com
Password: admin123
```

**Nota:** Las contraseñas están hasheadas con bcrypt en la base de datos.

---

## 🏗️ Estructura del Proyecto

```
propmanager/
├── backend/                      # 🆕 Backend Express + TypeScript
│   ├── src/
│   │   ├── config/              # Configuración (DB, logger, schema)
│   │   ├── controllers/         # Controladores de API (6 módulos)
│   │   ├── middleware/          # Auth, validación, errores
│   │   ├── models/              # Acceso a datos PostgreSQL
│   │   ├── routes/              # Rutas de API (31 endpoints)
│   │   ├── types/               # Tipos TypeScript
│   │   ├── validators/          # Esquemas Zod
│   │   ├── tests/               # Tests de integración
│   │   ├── app.ts               # Configuración Express
│   │   └── server.ts            # Entry point
│   ├── Dockerfile               # Container para Cloud Run
│   ├── cloudbuild.yaml          # CI/CD Google Cloud
│   ├── jest.config.js           # Configuración Jest
│   ├── package.json             # Dependencias backend
│   ├── tsconfig.json            # TypeScript config
│   └── README.md                # Documentación backend
├── src/                          # Frontend React
│   ├── components/
│   │   ├── layout/              # Header, Sidebar
│   │   ├── shared/              # Componentes compartidos
│   │   ├── ui/                  # UI base (Button, Card, Modal)
│   │   └── views/               # Vistas principales
│   ├── contexts/                # React Contexts (Auth, App)
│   ├── hooks/                   # Custom hooks
│   ├── pages/                   # Páginas
│   ├── portals/                 # Portales (Owner, Tenant, Admin)
│   ├── services/                # 🆕 API service layer
│   ├── types/                   # Tipos TypeScript
│   ├── utils/                   # Utilidades
│   ├── App.tsx                  # Componente raíz
│   └── main.tsx                 # Entry point
├── public/                      # Archivos estáticos
├── .env.example                 # Variables de entorno frontend
├── .gcloudignore               # 🆕 Despliegue Google Cloud
├── package.json                 # Dependencias frontend
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Configuración Vite
└── README.md                    # Este archivo
```

---

## 🌐 Despliegue en Google Cloud

### Prerrequisitos
- Cuenta de Google Cloud
- gcloud CLI instalado
- Proyecto de GCP creado

### 1. Backend en Cloud Run + Cloud SQL

```bash
# Crear instancia Cloud SQL PostgreSQL
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

# Conectar y ejecutar migraciones
gcloud sql connect propmanager-db --user=postgres
# En psql: \c propmanager
# Copiar y pegar contenido de backend/src/config/schema.sql

# Crear secrets
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create propmanager-db-password --data-file=-
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# Desplegar backend en Cloud Run
cd backend
gcloud run deploy propmanager-backend \
  --source=. \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances=YOUR_PROJECT:us-central1:propmanager-db \
  --set-env-vars="NODE_ENV=production" \
  --update-secrets="DB_PASSWORD=propmanager-db-password:latest" \
  --update-secrets="JWT_SECRET=jwt-secret:latest"
```

### 2. Frontend en Cloud Storage + Cloud CDN

```bash
# Build frontend
npm run build

# Crear bucket
gsutil mb -l us-central1 gs://propmanager-frontend

# Configurar para hosting web
gsutil web set -m index.html -e index.html gs://propmanager-frontend

# Subir archivos
gsutil -m cp -r dist/* gs://propmanager-frontend

# Hacer público
gsutil iam ch allUsers:objectViewer gs://propmanager-frontend
```

### CI/CD Automático

El proyecto incluye `cloudbuild.yaml` para despliegue automático:

```bash
# Conectar repositorio a Cloud Build
gcloud builds submit --config=backend/cloudbuild.yaml

# Deploy automático en cada push a main
gcloud builds triggers create github \
  --repo-name=propmanager \
  --branch-pattern="^main$" \
  --build-config=backend/cloudbuild.yaml
```

Ver más detalles en `backend/README.md`

---

## 🧪 Testing

### Frontend
```bash
npm run test              # Tests con Vitest
npm run test:ui           # UI interactiva
npm run test:coverage     # Coverage report
```

### Backend
```bash
cd backend
npm run test              # Tests con Jest
npm run test:coverage     # Coverage report
```

---

## 📊 Base de Datos

### Schema PostgreSQL

El proyecto incluye un schema completo con:
- ✅ 11 tablas relacionales
- ✅ 11 tipos enum personalizados
- ✅ Índices optimizados
- ✅ Triggers automáticos
- ✅ Foreign keys y constraints
- ✅ Datos de ejemplo

Ver `backend/src/config/schema.sql`

---

## 🔐 Seguridad

- ✅ **JWT Authentication** - Tokens seguros con expiración
- ✅ **bcrypt** - Hash de contraseñas (10 rounds)
- ✅ **Helmet** - Headers de seguridad HTTP
- ✅ **CORS** - Configurado para orígenes permitidos
- ✅ **Rate Limiting** - 100 requests/15min por IP
- ✅ **Input Validation** - Zod en todos los endpoints
- ✅ **SQL Injection Prevention** - Prepared statements
- ✅ **XSS Prevention** - Sanitización de inputs

---

## 📝 Roadmap Futuro

### Versión 1.1 (Q1 2025)
- [ ] Notificaciones push en tiempo real
- [ ] Exportación de reportes PDF
- [ ] Integración con Stripe/MercadoPago
- [ ] Upload de archivos a Cloud Storage

### Versión 1.2 (Q2 2025)
- [ ] Aplicación móvil (React Native)
- [ ] Chat en tiempo real (WebSockets)
- [ ] Firma electrónica de contratos
- [ ] Multi-idioma (ES, EN, PT)

### Versión 2.0 (Q3 2025)
- [ ] WhatsApp Business API
- [ ] OCR para comprobantes con IA
- [ ] ML para predicción de precios
- [ ] Marketplace de servicios

---

## 📚 Documentación

PropManager incluye documentación completa organizada por categorías:

### 🚀 Deployment y Configuración
- **[Guía de Google Cloud Platform](docs/deployment/google-cloud.md)** - Guía completa de deployment en GCP (recomendado)
  - 9 fases paso a paso desde cero hasta producción
  - Cloud Run, Cloud SQL, Secret Manager, Cloud Storage
  - CI/CD automatizado con Cloud Build
  - Costos estimados y optimización
- **[Plataformas Alternativas](docs/deployment/alternative-platforms.md)** - Vercel, Netlify, AWS, DigitalOcean, Render
- **[Variables de Entorno](docs/development/environment-variables.md)** - Flujo dev vs producción explicado

### 💻 Desarrollo
- **[Setup Local](docs/development/local-setup.md)** - Guía rápida para empezar a desarrollar
  - 3 opciones: Docker Compose, PostgreSQL nativo, o datos mock
  - Troubleshooting de errores comunes
  - Test de la aplicación
- **[Arquitectura Técnica](docs/development/architecture.md)** - Diseño del sistema completo
  - Stack detallado (frontend + backend)
  - 31 endpoints API documentados
  - 11 tablas de base de datos con ER diagrams
  - Patrones de autenticación y seguridad

### 🛠️ Operaciones
- **[Runbook](docs/operations/runbook.md)** - Procedimientos operacionales
  - Checklists diarios, semanales, mensuales
  - Procedimientos de incidentes (SEV 1-4)
  - Troubleshooting común
  - SLAs y métricas
- **[Plan de Recuperación de Desastres](docs/operations/disaster-recovery.md)** - DRP completo
  - 4 escenarios de desastre con procedimientos
  - RTO: 1 hora, RPO: 24 horas
  - Estrategias de backup y restauración
  - Plantillas de comunicación

### 📖 Referencia Adicional
- **[Backend README](backend/README.md)** - Documentación específica del backend
  - Estructura del código backend
  - Guía de desarrollo del API
  - Testing y debugging

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🙏 Agradecimientos

- Diseño de iconos por [Heroicons](https://heroicons.com/)
- Generador de avatares por [Pravatar](https://pravatar.cc/)
- Inspiración de UI por la comunidad de Tailwind CSS

---

## 📞 Soporte

Para preguntas o problemas:
- 📧 Email: support@propmanager.com
- 🐛 Issues: [GitHub Issues](https://github.com/2191998moises21/propmanager/issues)
- 📖 Docs: Ver la [sección de documentación](#-documentación) arriba
- 🚀 Deployment: [Guía de Google Cloud](docs/deployment/google-cloud.md)
- 💻 Setup Local: [Guía de desarrollo local](docs/development/local-setup.md)

---

**Hecho con ❤️ para la comunidad latinoamericana**

**Stack:** React 19 + TypeScript + Tailwind CSS + Express + PostgreSQL + Google Cloud
