# 🏗️ PropManager - Arquitectura del Sistema

Documentación técnica de la arquitectura de PropManager, un sistema completo de gestión de propiedades construido con tecnologías modernas y diseñado para Google Cloud Platform.

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura Frontend](#arquitectura-frontend)
5. [Arquitectura Backend](#arquitectura-backend)
6. [Modelo de Datos](#modelo-de-datos)
7. [Flujo de Autenticación](#flujo-de-autenticación)
8. [APIs y Endpoints](#apis-y-endpoints)
9. [Infraestructura Cloud](#infraestructura-cloud)
10. [Seguridad](#seguridad)
11. [Escalabilidad](#escalabilidad)
12. [Patrones de Diseño](#patrones-de-diseño)

---

## 🎯 Visión General

PropManager es una aplicación SaaS (Software as a Service) para la gestión integral de propiedades inmobiliarias. El sistema permite a propietarios gestionar sus inmuebles, contratos de alquiler, pagos y tickets de mantenimiento, mientras que los inquilinos pueden visualizar su información, realizar pagos y solicitar soporte.

### Características Principales

- ✅ Gestión de propiedades multi-tenant
- ✅ Sistema de contratos con vencimientos
- ✅ Seguimiento de pagos con estados
- ✅ Sistema de tickets de mantenimiento
- ✅ Portal diferenciado por roles (Owner/Tenant/SuperAdmin)
- ✅ Dashboard con métricas en tiempo real
- ✅ Autenticación JWT con refresh tokens
- ✅ API RESTful completa
- ✅ Despliegue cloud-native en GCP

---

## 🏛️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                       │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Landlord Portal  │  │  Tenant Portal   │  │ SuperAdmin Portal│  │
│  │  (React + TS)    │  │  (React + TS)    │  │  (React + TS)    │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│           └─────────────────────┼──────────────────────┘             │
│                                 │                                    │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │  API Gateway   │
                          │  (Nginx/Cloud) │
                          └───────┬────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────────────┐
│                           CAPA DE APLICACIÓN                         │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────┐    │
│  │                    Express.js REST API                       │    │
│  │                      (Node.js + TypeScript)                  │    │
│  └──┬────────┬─────────┬──────────┬──────────┬──────────┬──────┘    │
│     │        │         │          │          │          │            │
│  ┌──▼──┐ ┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼───┐  ┌───▼───┐        │
│  │Auth │ │Props│  │Contracts│ │Payments│ │Tickets│ │Tenants│       │
│  │Ctrl │ │Ctrl │  │  Ctrl   │ │  Ctrl  │ │ Ctrl │ │ Ctrl  │        │
│  └──┬──┘ └──┬──┘  └───┬───┘  └───┬───┘  └──┬───┘  └───┬───┘        │
│     │       │         │          │         │          │              │
└─────┼───────┼─────────┼──────────┼─────────┼──────────┼──────────────┘
      │       │         │          │         │          │
┌─────┼───────┼─────────┼──────────┼─────────┼──────────┼──────────────┐
│     │       │         │          │         │          │              │
│  ┌──▼───────▼─────────▼──────────▼─────────▼──────────▼──┐           │
│  │              CAPA DE ACCESO A DATOS                    │           │
│  │              (PostgreSQL Client - pg)                  │           │
│  └──────────────────────────┬─────────────────────────────┘           │
│                             │                                         │
└─────────────────────────────┼─────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────────┐
│                       CAPA DE PERSISTENCIA                            │
│                             │                                         │
│     ┌──────────────────┐   │   ┌──────────────────┐                  │
│     │  Cloud Storage   │   │   │   PostgreSQL     │                  │
│     │   (Archivos)     │   │   │  (Cloud SQL)     │                  │
│     │                  │   │   │  - 11 Tablas     │                  │
│     │ - Documentos     │   │   │  - 11 ENUMs      │                  │
│     │ - Fotos          │   │   │  - Relaciones FK │                  │
│     │ - Comprobantes   │   └──►│  - Índices       │                  │
│     └──────────────────┘       └──────────────────┘                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                        SERVICIOS AUXILIARES                           │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Secret    │  │   Cloud      │  │   Cloud      │                │
│  │  Manager    │  │   Build      │  │  Logging     │                │
│  │             │  │   (CI/CD)    │  │ & Monitoring │                │
│  └─────────────┘  └──────────────┘  └──────────────┘                │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 19.2.0 | Framework UI con React Compiler |
| **TypeScript** | 5.8.2 | Type safety y mejor DX |
| **Vite** | 6.0 | Build tool ultra-rápido |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS |
| **React Hook Form** | 7.66.0 | Gestión de formularios |
| **Zod** | 4.1.12 | Validación de schemas |
| **Heroicons** | 2.2.0 | Iconos SVG |

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.18.2 | Web framework |
| **TypeScript** | 5.3.3 | Type safety |
| **PostgreSQL** | 14+ | Base de datos relacional |
| **pg** | 8.11.3 | PostgreSQL client |
| **JWT** | 9.0.2 | Autenticación stateless |
| **bcryptjs** | 2.4.3 | Hash de passwords |
| **Winston** | 3.11.0 | Logging estructurado |
| **Helmet** | 7.1.0 | Seguridad HTTP |
| **Zod** | 3.22.4 | Validación de inputs |

### Cloud Infrastructure

| Servicio | Propósito |
|----------|-----------|
| **Cloud Run** | Hosting de contenedores serverless |
| **Cloud SQL** | PostgreSQL managed |
| **Cloud Storage** | Almacenamiento de archivos |
| **Secret Manager** | Gestión de secretos |
| **Cloud Build** | CI/CD pipeline |
| **Container Registry** | Registry de imágenes Docker |
| **Cloud Logging** | Logs centralizados |
| **Cloud Monitoring** | Métricas y alertas |

---

## 🎨 Arquitectura Frontend

### Estructura de Directorios

```
src/
├── components/           # Componentes React
│   ├── layout/          # Header, Sidebar, Footer
│   ├── shared/          # Componentes reutilizables
│   ├── ui/              # Componentes base (Button, Card, Modal)
│   └── views/           # Vistas específicas por feature
│       ├── superadmin/  # 7 componentes admin
│       └── tenant/      # 6 componentes tenant
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Estado de autenticación
│   ├── AppContext.tsx   # Estado global de la app
│   └── SuperAdminContext.tsx
├── hooks/               # Custom React hooks
│   ├── useLogin.ts
│   ├── useAuth.ts
│   └── useToast.ts
├── pages/               # Páginas de la aplicación
│   └── LoginPage.tsx
├── portals/             # Portales por rol
│   ├── LandlordPortal.tsx
│   ├── TenantPortal.tsx
│   └── SuperAdminPortal.tsx
├── services/            # Capa de servicios
│   └── api.ts           # Cliente API REST
├── types/               # TypeScript types/interfaces
│   └── index.ts
├── utils/               # Funciones utilitarias
└── data/                # Mock data (desarrollo)
```

### Flujo de Datos (Unidirectional Data Flow)

```
┌────────────────┐
│   User Input   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Event Handler │ (onClick, onSubmit, etc.)
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   API Call     │ (services/api.ts)
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Backend API    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   Response     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Update State  │ (useState, Context)
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Re-render UI  │ (React reconciliation)
└────────────────┘
```

### Gestión de Estado

1. **Local State**: `useState` para estado de componentes individuales
2. **Global State**: React Context API
   - `AuthContext`: Usuario autenticado, token, rol
   - `AppContext`: Propiedades, contratos, pagos, tickets
   - `SuperAdminContext`: Datos específicos de superadmin
3. **Form State**: React Hook Form
4. **Server State**: Fetch directo desde API (no usa React Query aún)

### Routing

```typescript
// Routing por rol
if (user.role === 'owner') {
  return <LandlordPortal />;
} else if (user.role === 'tenant') {
  return <TenantPortal />;
} else if (user.role === 'superadmin') {
  return <SuperAdminPortal />;
} else {
  return <LoginPage />;
}
```

Cada portal maneja su propio routing interno mediante state.

---

## ⚙️ Arquitectura Backend

### Estructura de Directorios

```
backend/src/
├── config/              # Configuraciones
│   ├── database.ts      # Pool de PostgreSQL
│   ├── logger.ts        # Winston logger
│   └── schema.sql       # Schema de base de datos
├── controllers/         # Lógica de negocio
│   ├── authController.ts
│   ├── propertyController.ts
│   ├── contractController.ts
│   ├── paymentController.ts
│   ├── ticketController.ts
│   └── tenantController.ts
├── models/              # Capa de acceso a datos
│   ├── ownerModel.ts
│   ├── propertyModel.ts
│   ├── contractModel.ts
│   ├── paymentModel.ts
│   ├── ticketModel.ts
│   └── tenantModel.ts
├── routes/              # Definición de rutas
│   ├── authRoutes.ts
│   ├── propertyRoutes.ts
│   ├── contractRoutes.ts
│   ├── paymentRoutes.ts
│   ├── ticketRoutes.ts
│   └── tenantRoutes.ts
├── middleware/          # Middleware Express
│   ├── auth.ts          # Autenticación y autorización
│   ├── errorHandler.ts  # Manejo de errores
│   └── validator.ts     # Validación con Zod
├── validators/          # Schemas de Zod
│   └── schemas.ts
├── types/               # TypeScript types
│   └── express.d.ts
├── app.ts               # Express app configuration
└── server.ts            # Entry point
```

### Capas de la Arquitectura (Layered Architecture)

```
┌─────────────────────────────────────┐
│         ROUTES LAYER                │  Definición de endpoints
│  (authRoutes, propertyRoutes, etc.) │  HTTP methods, paths
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       MIDDLEWARE LAYER              │  Autenticación, validación
│  (auth, validator, errorHandler)    │  CORS, rate limiting
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      CONTROLLER LAYER               │  Lógica de negocio
│  (authController, propertyController)│  Orchestración
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         MODEL LAYER                 │  Acceso a datos
│  (ownerModel, propertyModel, etc.)  │  Queries SQL
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       DATABASE LAYER                │  PostgreSQL
│        (Cloud SQL)                  │  Persistencia
└─────────────────────────────────────┘
```

### Middleware Stack

```
Request
  │
  ▼
1. CORS Middleware
  │
  ▼
2. Helmet (Security Headers)
  │
  ▼
3. Rate Limiting (100 req/15min)
  │
  ▼
4. JSON Body Parser
  │
  ▼
5. Cookie Parser
  │
  ▼
6. Logger (Winston)
  │
  ▼
7. Authentication (JWT verify)
  │
  ▼
8. Authorization (Role check)
  │
  ▼
9. Validation (Zod schemas)
  │
  ▼
10. Controller Logic
  │
  ▼
11. Error Handler
  │
  ▼
Response
```

---

## 🗄️ Modelo de Datos

### Diagrama ER (Entity-Relationship)

```
┌──────────────┐
│   owners     │
│──────────────│
│ owner_id (PK)│───┐
│ email        │   │
│ password_hash│   │
│ nombre       │   │
│ telefono     │   │
│ direccion    │   │
└──────────────┘   │
                   │
                   │ 1:N
                   │
         ┌─────────▼──────────┐
         │   properties       │
         │────────────────────│
         │ property_id (PK)   │───┐
         │ owner_id (FK)      │   │
         │ title              │   │
         │ address            │   │
         │ price              │   │
         │ type               │   │
         │ status             │   │
         └────────────────────┘   │
                                  │
                                  │ 1:N
                                  │
                   ┌──────────────▼────────────┐
                   │      contracts            │
                   │───────────────────────────│
                   │ contract_id (PK)          │
                   │ property_id (FK)          │───┐
                   │ tenant_id (FK)            │   │
                   │ start_date                │   │
                   │ end_date                  │   │
                   │ monthly_rent              │   │
                   │ status                    │   │
                   └───────────────────────────┘   │
                              │                     │
                              │                     │
                              │                     │ 1:N
                   ┌──────────┤                     │
                   │          │                     │
                   │ N:1      │ 1:N                 │
                   │          │                     │
         ┌─────────▼──┐  ┌────▼──────────┐  ┌──────▼────────┐
         │  tenants   │  │   payments     │  │contract_docs  │
         │────────────│  │────────────────│  │───────────────│
         │tenant_id(PK│  │payment_id (PK) │  │document_id(PK)│
         │email       │  │contract_id (FK)│  │contract_id(FK)│
         │password    │  │amount          │  │file_url       │
         │nombre      │  │payment_date    │  │file_name      │
         │telefono    │  │status          │  └───────────────┘
         │direccion   │  │method          │
         └────────────┘  │proof_url       │
                         └────────────────┘

┌──────────────┐          ┌──────────────┐
│  tickets     │          │ contractors  │
│──────────────│          │──────────────│
│ ticket_id(PK)│          │contractor_id │
│property_id(FK│─────┐    │ nombre       │
│tenant_id (FK)│     │    │ especialidad │
│contractor_id │─────┼───►│ telefono     │
│description   │     │    └──────────────┘
│urgency       │     │
│status        │     │
└──────────────┘     │
       │             │
       │ 1:N         │
       ▼             │
┌──────────────┐     │
│ticket_photos │     │
│──────────────│     │
│ photo_id (PK)│     │
│ ticket_id(FK)│─────┘
│ photo_url    │
└──────────────┘

┌───────────────┐          ┌──────────────────┐
│ superadmins   │          │ activity_logs    │
│───────────────│          │──────────────────│
│ admin_id (PK) │          │ log_id (PK)      │
│ email         │          │ user_id          │
│ password_hash │          │ user_type        │
│ nombre        │          │ action           │
└───────────────┘          │ ip_address       │
                           │ user_agent       │
                           └──────────────────┘
```

### ENUMs Personalizados

```sql
-- Tipos de propiedad
CREATE TYPE property_type AS ENUM (
  'casa', 'apartamento', 'local', 'oficina', 'bodega'
);

-- Monedas
CREATE TYPE currency AS ENUM ('USD');

-- Estado de ocupación
CREATE TYPE occupancy_status AS ENUM (
  'disponible', 'ocupada', 'mantenimiento'
);

-- Estado de contrato
CREATE TYPE contract_status AS ENUM (
  'activo', 'vencido', 'terminado', 'renovado'
);

-- Estado de pago
CREATE TYPE payment_status AS ENUM (
  'pendiente', 'pagado', 'atrasado', 'parcial', 'en revisión'
);

-- Método de pago
CREATE TYPE payment_method AS ENUM (
  'efectivo', 'transferencia', 'cheque', 'tarjeta', 'deposito'
);

-- Estado de ticket
CREATE TYPE ticket_status AS ENUM (
  'abierto', 'en progreso', 'cerrado'
);

-- Urgencia de ticket
CREATE TYPE ticket_urgency AS ENUM (
  'baja', 'media', 'alta'
);

-- Estado de usuario
CREATE TYPE user_status AS ENUM (
  'activo', 'suspendido', 'inactivo'
);

-- Rol de usuario
CREATE TYPE user_role AS ENUM (
  'owner', 'tenant', 'superadmin'
);
```

### Índices para Performance

```sql
-- Índices en owners
CREATE INDEX idx_owners_email ON owners(email);

-- Índices en properties
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(occupancy_status);

-- Índices en contracts
CREATE INDEX idx_contracts_property_id ON contracts(property_id);
CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Índices en payments
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Índices en tickets
CREATE INDEX idx_tickets_property_id ON tickets(property_id);
CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Índices en tenants
CREATE INDEX idx_tenants_email ON tenants(email);
```

---

## 🔐 Flujo de Autenticación

### Registro de Usuario

```
1. User → Frontend: Completa formulario de registro
2. Frontend → API: POST /api/v1/auth/register/{role}
3. API → Validator: Valida datos con Zod schema
4. API → bcrypt: Hash password (10 rounds)
5. API → Database: INSERT nuevo usuario
6. API → JWT: Genera access token (7 días)
7. API → Frontend: Retorna {user, token}
8. Frontend: Guarda token en localStorage
9. Frontend: Redirige a portal correspondiente
```

### Login

```
1. User → Frontend: Email, password, role
2. Frontend → API: POST /api/v1/auth/login
3. API → Database: SELECT user WHERE email AND role
4. API → bcrypt: Compare(password, hash)
5. API → JWT: Generate token
6. API → Frontend: {user, token}
7. Frontend: Store token → Redirect
```

### Request Autenticado

```
GET /api/v1/properties/my
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..."
}

1. Request → authenticate middleware
2. Extract token from header
3. JWT.verify(token, SECRET)
4. Decode payload → {userId, email, role}
5. Attach to req.user
6. Next() → Controller
```

### Autorización por Rol

```typescript
// Middleware authorize
export const authorize = (...allowedRoles: string[]) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Uso en rutas
router.get('/properties',
  authenticate,
  authorize('owner', 'superadmin'),
  propertyController.getProperties
);
```

---

## 🔌 APIs y Endpoints

### Estructura de URL

```
Base URL: https://propmanager-backend-HASH.a.run.app
API Version: /api/v1
Full URL: https://propmanager-backend-HASH.a.run.app/api/v1
```

### Grupos de Endpoints

#### Authentication (5 endpoints)
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register/owner
POST   /api/v1/auth/register/tenant
GET    /api/v1/auth/profile         [Auth Required]
POST   /api/v1/auth/change-password [Auth Required]
```

#### Properties (6 endpoints)
```
GET    /api/v1/properties/my        [Owner/SuperAdmin]
GET    /api/v1/properties/search    [SuperAdmin]
GET    /api/v1/properties/:id       [Auth Required]
POST   /api/v1/properties           [Owner]
PUT    /api/v1/properties/:id       [Owner]
DELETE /api/v1/properties/:id       [Owner]
```

#### Contracts (7 endpoints)
```
GET    /api/v1/contracts/my
GET    /api/v1/contracts/:id
POST   /api/v1/contracts
PUT    /api/v1/contracts/:id
POST   /api/v1/contracts/:id/terminate
GET    /api/v1/contracts/:id/documents
POST   /api/v1/contracts/:id/documents
```

#### Payments (8 endpoints)
```
GET    /api/v1/payments/my
GET    /api/v1/payments/pending
GET    /api/v1/payments/contract/:id
GET    /api/v1/payments/:id
POST   /api/v1/payments
PUT    /api/v1/payments/:id
POST   /api/v1/payments/:id/proof
DELETE /api/v1/payments/:id
```

#### Tickets (6 endpoints)
```
GET    /api/v1/tickets/my
GET    /api/v1/tickets/property/:id
GET    /api/v1/tickets/:id
POST   /api/v1/tickets
PUT    /api/v1/tickets/:id
DELETE /api/v1/tickets/:id
```

#### Tenants (4 endpoints)
```
GET    /api/v1/tenants
GET    /api/v1/tenants/:id
PUT    /api/v1/tenants/:id
DELETE /api/v1/tenants/:id
```

### Response Format

**Success Response:**
```json
{
  "data": {...},
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": ["validation error 1", "validation error 2"]
}
```

---

## ☁️ Infraestructura Cloud

### Google Cloud Platform Services

```
┌─────────────────────────────────────────────────────┐
│                 CLOUD RUN SERVICES                  │
├─────────────────────────────────────────────────────┤
│ propmanager-backend    │ Container: Node.js + Express│
│ Port: 8080            │ Memory: 512Mi, CPU: 1       │
│ Min instances: 0      │ Max instances: 10           │
│ Timeout: 300s         │ Concurrency: 80             │
├─────────────────────────────────────────────────────┤
│ propmanager-frontend   │ Container: Nginx + React    │
│ Port: 8080            │ Memory: 256Mi, CPU: 1       │
│ Min instances: 0      │ Max instances: 10           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  CLOUD SQL (PostgreSQL)             │
├─────────────────────────────────────────────────────┤
│ Instance: propmanager-db                            │
│ Version: PostgreSQL 14                              │
│ Tier: db-f1-micro (shared CPU, 0.6GB RAM)          │
│ Storage: 10GB SSD (auto-increase enabled)          │
│ Backups: Daily at 03:00 UTC                        │
│ HA: Zonal (single zone)                            │
│ Connection: Unix socket (/cloudsql/...)            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              CLOUD STORAGE BUCKETS                  │
├─────────────────────────────────────────────────────┤
│ propmanager-uploads                                 │
│ - Contract documents                                │
│ - Ticket photos                                     │
│ - Payment proofs                                    │
│ Class: Standard                                     │
│ Location: us-central1                               │
│ Public access: Controlled (CORS enabled)            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                SECRET MANAGER                       │
├─────────────────────────────────────────────────────┤
│ Secret: propmanager-db-password                     │
│ Secret: jwt-secret                                  │
│ Replication: Automatic (multi-region)               │
│ Access: Cloud Run service account                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 CLOUD BUILD (CI/CD)                 │
├─────────────────────────────────────────────────────┤
│ Trigger: backend (on push to main, backend/**)     │
│ Trigger: frontend (on push to main, src/**)        │
│ Build: Docker image → Push GCR → Deploy Cloud Run  │
│ Timeout: 1200s                                      │
│ Machine: N1_HIGHCPU_8                               │
└─────────────────────────────────────────────────────┘
```

### Network Architecture

```
Internet
   │
   ▼
Google Cloud
Load Balancer ──► Cloud CDN (optional)
   │
   ├──► Cloud Run (Frontend)
   │    Port: 8080
   │    Public URL: https://propmanager-frontend-*.run.app
   │
   └──► Cloud Run (Backend)
        Port: 8080
        Public URL: https://propmanager-backend-*.run.app
        │
        ├──► Cloud SQL (Private)
        │    Connection: Unix socket
        │    IP: Private only
        │
        ├──► Cloud Storage
        │    Access: IAM controlled
        │
        └──► Secret Manager
             Access: Service Account
```

---

## 🛡️ Seguridad

### Autenticación y Autorización

1. **JWT Tokens**
   - Algorithm: HS256
   - Expiration: 7 days (configurable)
   - Payload: {userId, email, role, name}
   - Secret: Stored in Secret Manager

2. **Password Security**
   - Algorithm: bcrypt
   - Salt rounds: 10
   - Minimum length: 8 characters
   - Never stored in plain text

3. **Role-Based Access Control (RBAC)**
   - 3 roles: owner, tenant, superadmin
   - Middleware: `authorize(...roles)`
   - Resource ownership validation

### HTTP Security

```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### Input Validation

```typescript
// Usando Zod para validación type-safe
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['owner', 'tenant', 'superadmin'])
});

// Middleware validator
export const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
  };
};
```

### SQL Injection Prevention

```typescript
// Siempre usar parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// NUNCA hacer string concatenation
// ❌ BAD: `SELECT * FROM users WHERE email = '${email}'`
```

### Secrets Management

- ✅ Database passwords → Secret Manager
- ✅ JWT secrets → Secret Manager
- ✅ API keys → Secret Manager
- ✅ Service account keys → Workload Identity
- ❌ NEVER commit secrets to Git

---

## 📈 Escalabilidad

### Horizontal Scaling

**Cloud Run Auto-scaling:**
```yaml
Min Instances: 0    # Scale to zero cuando no hay tráfico
Max Instances: 10   # Máximo 10 instancias concurrentes
Concurrency: 80     # 80 requests por instancia
CPU: 1              # 1 vCPU por instancia
Memory: 512Mi       # 512MB RAM por instancia
```

**Triggers de Scaling:**
- Requests per second
- CPU utilization
- Memory utilization
- Custom metrics

### Vertical Scaling

**Database Scaling (Cloud SQL):**
```
Tier Progression:
1. db-f1-micro    → 0.6GB RAM, Shared CPU  ($7/mes)
2. db-g1-small    → 1.7GB RAM, Shared CPU  ($25/mes)
3. db-n1-standard-1 → 3.75GB RAM, 1 vCPU   ($50/mes)
4. db-n1-standard-2 → 7.5GB RAM, 2 vCPU    ($100/mes)
5. db-n1-standard-4 → 15GB RAM, 4 vCPU     ($200/mes)
```

### Caching Strategy (Future Enhancement)

```
Level 1: Browser Cache
  - Static assets (1 year)
  - HTML (no-cache)

Level 2: CDN Cache (Cloud CDN)
  - Frontend assets
  - Public images

Level 3: Application Cache (Redis - not implemented yet)
  - Session data
  - Frequently accessed queries
  - Rate limit counters

Level 4: Database Query Cache
  - PostgreSQL query cache (automatic)
```

### Connection Pooling

```typescript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20,                    // Max 20 connections
  idleTimeoutMillis: 30000,   // Close idle after 30s
  connectionTimeoutMillis: 10000  // Timeout after 10s
});
```

---

## 🎨 Patrones de Diseño

### 1. MVC (Model-View-Controller)

```
Frontend (View)
    ↓
Backend API (Controller)
    ↓
Database Models (Model)
```

### 2. Repository Pattern

```typescript
// Model layer abstracts database access
class PropertyModel {
  async findById(id: string) {
    return await pool.query('SELECT * FROM properties WHERE property_id = $1', [id]);
  }

  async create(data: Property) {
    // Insert logic
  }
}
```

### 3. Middleware Chain Pattern

```typescript
// Composable middleware
router.get('/properties',
  authenticate,           // Check JWT
  authorize('owner'),     // Check role
  validate(propertySchema),  // Validate input
  propertyController.get  // Business logic
);
```

### 4. Dependency Injection

```typescript
// Logger injected via config
import { logger } from './config/logger';

// Database pool injected
import { pool } from './config/database';
```

### 5. Factory Pattern

```typescript
// JWT token factory
export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};
```

### 6. Singleton Pattern

```typescript
// Database pool singleton
let instance: Pool;

export const getPool = () => {
  if (!instance) {
    instance = new Pool(config);
  }
  return instance;
};
```

---

## 📝 Conclusión

PropManager está construido con una arquitectura moderna, escalable y segura, siguiendo las mejores prácticas de la industria:

✅ **Separación de responsabilidades** (Frontend/Backend/Database)
✅ **Type-safety** completo con TypeScript
✅ **Cloud-native** desde el diseño
✅ **Seguridad por capas** (Auth, RBAC, Input validation, HTTPS)
✅ **Escalabilidad horizontal y vertical**
✅ **CI/CD automatizado**
✅ **Logging y monitoring** integrados
✅ **Documentación completa**

**Próximas mejoras recomendadas:**
- Implementar Redis para caching
- Agregar WebSockets para notificaciones en tiempo real
- Implementar tests E2E con Playwright
- Configurar Cloud CDN para el frontend
- Agregar GraphQL como alternativa a REST
- Implementar event sourcing para audit logs

---

**Última actualización:** 2025-11-19
**Versión de la arquitectura:** 1.0
**Autor:** Equipo PropManager
