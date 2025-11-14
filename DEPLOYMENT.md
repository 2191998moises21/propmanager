# 🚀 Guía de Despliegue - PropManager

Esta guía proporciona instrucciones paso a paso para desplegar PropManager en producción utilizando diferentes plataformas de hosting.

---

## 📋 Tabla de Contenidos

1. [Preparación para Producción](#preparación-para-producción)
2. [Despliegue en Vercel](#1-vercel-recomendado)
3. [Despliegue en Netlify](#2-netlify)
4. [Despliegue en AWS Amplify](#3-aws-amplify)
5. [Despliegue en DigitalOcean](#4-digitalocean-app-platform)
6. [Despliegue en Render](#5-render)
7. [Despliegue con Docker](#6-docker-avanzado)
8. [Configuración de Dominio Personalizado](#configuración-de-dominio-personalizado)
9. [Monitoreo y Análisis](#monitoreo-y-análisis)
10. [Checklist de Producción](#checklist-de-producción)

---

## Preparación para Producción

Antes de desplegar, asegúrate de completar estos pasos:

### 1. Build Local

Verifica que el build funciona correctamente:

```bash
npm run build
npm run preview
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.production`:

```env
VITE_APP_NAME=PropManager
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.tudominio.com
VITE_API_TIMEOUT=30000
VITE_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

### 3. Optimizaciones de Build

El proyecto ya incluye optimizaciones en `vite.config.ts`:

- ✅ Code splitting automático
- ✅ Minificación de assets
- ✅ Tree shaking
- ✅ Compresión gzip

---

## 1. Vercel (Recomendado)

### Por qué Vercel?

- ✅ Deploy en segundos
- ✅ CDN global automático
- ✅ HTTPS gratis
- ✅ Preview deployments para PRs
- ✅ Analytics integrados
- ✅ Excelente para proyectos Vite/React

### Método 1: Deploy con GitHub (Recomendado)

**Paso 1:** Push tu código a GitHub

```bash
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

**Paso 2:** Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y regístrate con GitHub
2. Click en "New Project"
3. Importa tu repositorio `propmanager`
4. Vercel detectará automáticamente que es un proyecto Vite

**Paso 3:** Configurar el Proyecto

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Paso 4:** Agregar Variables de Entorno

En la sección "Environment Variables":

```
VITE_APP_NAME=PropManager
VITE_API_URL=https://api.tudominio.com
VITE_ENV=production
```

**Paso 5:** Deploy

Click en "Deploy" y espera ~60 segundos.

### Método 2: Deploy con CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Configuración Avanzada (vercel.json)

Crea `vercel.json` en la raíz:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 2. Netlify

### Por qué Netlify?

- ✅ Deploy gratuito ilimitado
- ✅ Forms y Functions integradas
- ✅ CDN global
- ✅ Split testing

### Método 1: Deploy con Git

**Paso 1:** Push a GitHub/GitLab/Bitbucket

```bash
git push origin main
```

**Paso 2:** Conectar en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Selecciona tu repositorio

**Paso 3:** Configuración de Build

```
Build command: npm run build
Publish directory: dist
```

**Paso 4:** Variables de Entorno

Site settings → Build & deploy → Environment → Add variables

### Método 2: Deploy con Drag & Drop

```bash
npm run build
```

Arrastra la carpeta `dist` a [app.netlify.com/drop](https://app.netlify.com/drop)

### Método 3: Netlify CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

### Configuración (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 3. AWS Amplify

### Configuración

**Paso 1:** Crear app en Amplify Console

1. Ve a AWS Console → Amplify
2. Click "New app" → "Host web app"
3. Conecta tu repositorio

**Paso 2:** Build settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Paso 3:** Variables de entorno

Environment variables → Add:

```
VITE_API_URL=https://api.tudominio.com
VITE_ENV=production
```

---

## 4. DigitalOcean App Platform

### Deploy desde GitHub

**Paso 1:** Crear App

1. App Platform → Create App
2. Selecciona GitHub repository

**Paso 2:** Configuración

```
Type: Static Site
Build Command: npm run build
Output Directory: dist
```

**Paso 3:** Plan

- Basic ($5/mes)
- Professional ($12/mes) - Recomendado para producción

---

## 5. Render

### Deploy Gratuito

**Paso 1:** Crear Static Site

1. Dashboard → New → Static Site
2. Conecta repositorio

**Paso 2:** Configuración

```
Build Command: npm run build
Publish Directory: dist
```

**Nota**: Plan gratuito tiene algunas limitaciones de ancho de banda

---

## 6. Docker (Avanzado)

### Crear Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Crear nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### Build y Run

```bash
# Build
docker build -t propmanager .

# Run
docker run -p 8080:80 propmanager

# Con Docker Compose
docker-compose up -d
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## Configuración de Dominio Personalizado

### Vercel

1. Settings → Domains
2. Add domain: `tudominio.com`
3. Configurar DNS:
   - Type: A → Value: `76.76.21.21`
   - Type: CNAME → Value: `cname.vercel-dns.com`

### Netlify

1. Domain settings → Add custom domain
2. DNS Settings:
   - Type: A → Value: `75.2.60.5`
   - Type: CNAME → Value: `<tu-sitio>.netlify.app`

---

## Monitoreo y Análisis

### Herramientas Recomendadas

1. **Vercel Analytics** (Gratis con Vercel)
2. **Google Analytics** - Tracking de usuarios
3. **Sentry** - Error monitoring
4. **LogRocket** - Session replay
5. **Hotjar** - Heatmaps y grabaciones

### Implementar Google Analytics

```typescript
// src/utils/analytics.ts
export const initAnalytics = () => {
  if (import.meta.env.VITE_ENV === 'production') {
    // Agregar script de GA
  }
};
```

---

## Checklist de Producción

Antes de lanzar a producción:

### Seguridad
- [ ] HTTPS configurado
- [ ] Variables de entorno seguras
- [ ] No hay API keys expuestas en el código
- [ ] Headers de seguridad configurados
- [ ] CORS configurado correctamente

### Rendimiento
- [ ] Build optimizado (`npm run build`)
- [ ] Assets comprimidos (gzip/brotli)
- [ ] Imágenes optimizadas
- [ ] Code splitting funcionando
- [ ] Lighthouse score > 90

### SEO
- [ ] Meta tags configurados
- [ ] robots.txt creado
- [ ] sitemap.xml generado
- [ ] Open Graph tags
- [ ] Canonical URLs

### Funcionalidad
- [ ] Todos los flujos testeados
- [ ] Formularios validados
- [ ] Error boundaries implementados
- [ ] Loading states configurados
- [ ] 404 page personalizada

### Monitoreo
- [ ] Analytics configurado
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## URLs de Ejemplo

### Producción
```
https://propmanager.vercel.app
https://propmanager.netlify.app
https://tudominio.com
```

### Staging
```
https://staging.propmanager.vercel.app
https://dev--propmanager.netlify.app
```

---

## Soporte y Ayuda

Si encuentras problemas durante el despliegue:

1. Revisa los logs de build
2. Verifica variables de entorno
3. Consulta la documentación de la plataforma
4. Abre un issue en GitHub

---

## Actualizaciones y Mantenimiento

### Actualizaciones Automáticas

Con GitHub conectado, cada push a `main` despliega automáticamente.

### Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
Deployments → Selecciona deploy anterior → Publish deploy

---

## Costos Estimados (2025)

| Plataforma | Plan Gratuito | Plan Pro | Límites Free |
|------------|---------------|----------|--------------|
| **Vercel** | Sí | $20/mes | 100GB bandwidth |
| **Netlify** | Sí | $19/mes | 100GB bandwidth |
| **AWS Amplify** | 12 meses gratis | ~$15/mes | 15GB servido |
| **DigitalOcean** | No | $5/mes | N/A |
| **Render** | Sí | $7/mes | 100GB bandwidth |

**Recomendación**: Comienza con el plan gratuito de Vercel o Netlify. Ambos son suficientes para miles de usuarios.

---

## Conclusión

PropManager está optimizado para deployarse en minutos en cualquier plataforma moderna. **Vercel** es nuestra recomendación principal por su excelente integración con Vite y React.

¿Preguntas? Abre un issue en GitHub o consulta la documentación de tu plataforma elegida.

---

**Happy Deploying! 🚀**
