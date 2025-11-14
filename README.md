# 🏢 PropManager - Property Management SaaS

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC?logo=tailwind-css)

**PropManager** es una solución integral de gestión de propiedades diseñada específicamente para el mercado latinoamericano. Permite a propietarios e inquilinos gestionar propiedades, contratos, pagos y mantenimiento desde una interfaz moderna e intuitiva.

---

## ✨ Características Principales

### Para Propietarios 🏠
- ✅ **Gestión de Propiedades**: CRUD completo de propiedades con información detallada
- ✅ **Gestión de Inquilinos**: Administración de datos de inquilinos y documentos
- ✅ **Contratos Inteligentes**: Creación, seguimiento y terminación de contratos
- ✅ **Control de Pagos**: Seguimiento de pagos mensuales con comprobantes
- ✅ **Dashboard Analítico**: Visualización de ingresos, ocupación y métricas clave
- ✅ **Tickets de Mantenimiento**: Gestión de solicitudes de reparación
- ✅ **Multi-moneda**: Soporte para USD y monedas latinoamericanas

### Para Inquilinos 🏘️
- ✅ **Portal Personal**: Vista de propiedad arrendada y contrato activo
- ✅ **Gestión de Pagos**: Carga de comprobantes y historial de pagos
- ✅ **Tickets de Mantenimiento**: Creación y seguimiento de solicitudes
- ✅ **Documentación**: Acceso a contrato y documentos importantes

---

## 🚀 Tecnologías

### Frontend
- **React 19.2** - Última versión con mejoras de rendimiento
- **TypeScript 5.8** - Tipado estático robusto
- **Tailwind CSS 4** - Estilos utilitarios modernos
- **Vite 6** - Build tool ultra-rápido
- **React Hook Form** - Gestión de formularios performante
- **Zod** - Validación de esquemas type-safe

### Herramientas de Desarrollo
- **ESLint 9** - Linting con configuración moderna
- **Prettier** - Formateo de código consistente
- **Vitest** - Testing framework rápido
- **React Testing Library** - Testing de componentes

### Gestión de Estado
- **Context API** - Estado global sin dependencias externas
- **Custom Hooks** - Lógica reutilizable y encapsulada

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0 (recomendado 20.x LTS)
- **npm** >= 9.0.0 o **yarn** >= 1.22.0 o **pnpm** >= 8.0.0
- **Git** >= 2.30.0

---

## 🛠️ Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/2191998moises21/propmanager.git
cd propmanager
```

### 2. Instalar Dependencias

```bash
npm install
```

O con yarn:
```bash
yarn install
```

O con pnpm:
```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y ajusta según necesites:

```bash
cp .env.example .env
```

Edita `.env` según tu configuración:

```env
VITE_APP_NAME=PropManager
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_ENABLE_DEBUG_MODE=true
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build
npm run build            # Compila para producción
npm run preview          # Preview del build de producción

# Testing
npm run test             # Ejecuta tests en modo watch
npm run test:ui          # Abre UI de testing
npm run test:coverage    # Genera reporte de cobertura

# Linting y Formateo
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores de ESLint
npm run format           # Formatea código con Prettier
npm run format:check     # Verifica formateo

# Type Checking
npm run type-check       # Verifica tipos de TypeScript
```

---

## 🎭 Usuarios de Demostración

### Propietarios
```
Email: carlos.prop@email.com
Contraseña: cualquiera (modo demo)
```

### Inquilinos
```
Email: maria.r@email.com
Contraseña: cualquiera (modo demo)

Email: carlos.silva@email.com.br
Contraseña: cualquiera (modo demo)
```

---

## 🏗️ Estructura del Proyecto

```
propmanager/
├── src/
│   ├── components/          # Componentes React
│   │   ├── icons/          # Iconos personalizados
│   │   ├── layout/         # Componentes de layout (Header, Sidebar)
│   │   ├── shared/         # Componentes compartidos
│   │   ├── ui/             # Componentes UI base (Button, Card, Modal)
│   │   └── views/          # Vistas principales
│   │       └── tenant/     # Vistas específicas de inquilinos
│   ├── contexts/           # React Contexts (Auth, App)
│   ├── data/               # Datos mock para desarrollo
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Librerías y validaciones (Zod schemas)
│   ├── pages/              # Páginas de la aplicación
│   ├── portals/            # Portales (Landlord, Tenant)
│   ├── styles/             # Estilos globales y Tailwind
│   ├── types/              # Definiciones de tipos TypeScript
│   ├── utils/              # Utilidades (formatters, auth, constants)
│   ├── __tests__/          # Tests
│   ├── App.tsx             # Componente raíz
│   └── index.tsx           # Punto de entrada
├── public/                 # Archivos estáticos
├── .env.example            # Ejemplo de variables de entorno
├── eslint.config.js        # Configuración ESLint
├── .prettierrc             # Configuración Prettier
├── tailwind.config.js      # Configuración Tailwind
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
├── vitest.config.ts        # Configuración Vitest
└── package.json            # Dependencias y scripts
```

---

## 🌐 Despliegue en Producción

Para instrucciones detalladas de despliegue, consulta **DEPLOYMENT.md** (ver abajo).

### Opciones de Hosting Recomendadas

1. **Vercel** (Recomendado) - Deploy automático con Git
2. **Netlify** - CI/CD integrado y CDN global
3. **AWS Amplify** - Infraestructura escalable
4. **DigitalOcean App Platform** - Precio competitivo
5. **Render** - Despliegue simple y gratuito

### Build para Producción

```bash
npm run build
```

Esto genera una carpeta `dist/` lista para desplegar.

---

## 🧪 Testing

El proyecto incluye configuración para testing con Vitest y React Testing Library.

```bash
# Ejecutar tests
npm run test

# Tests con UI
npm run test:ui

# Coverage
npm run test:coverage
```

---

## 📝 Roadmap

### Versión 1.1 (Q1 2025)
- [ ] Integración con backend real (API REST)
- [ ] Autenticación JWT completa
- [ ] Notificaciones push
- [ ] Exportación de reportes PDF
- [ ] Panel de analytics avanzado

### Versión 1.2 (Q2 2025)
- [ ] Aplicación móvil (React Native)
- [ ] Pagos en línea (Stripe/MercadoPago)
- [ ] Chat entre propietario e inquilino
- [ ] Firma electrónica de contratos
- [ ] Multi-idioma (ES, EN, PT)

### Versión 2.0 (Q3 2025)
- [ ] WhatsApp Business integration
- [ ] Reconocimiento de comprobantes con IA
- [ ] Recomendaciones de precios con ML
- [ ] Marketplace de servicios (plomeros, electricistas)
- [ ] Integración bancaria automática

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🙏 Agradecimientos

- Diseño de iconos por [Heroicons](https://heroicons.com/)
- Generador de avatares por [Pravatar](https://pravatar.cc/)
- Inspiración de UI por la comunidad de Tailwind CSS

---

**Hecho con ❤️ para la comunidad latinoamericana**
