# 🚀 Guía Rápida de Setup - PropManager (Desarrollo Local)

## Problema Actual
El error "Failed to fetch" ocurre porque el backend necesita PostgreSQL corriendo.

## ✅ Solución 1: Configurar PostgreSQL (Recomendado)

### Paso 1: Iniciar PostgreSQL

**En tu terminal local (fuera de Claude Code):**

```bash
# En macOS con Homebrew
brew services start postgresql@14

# En Ubuntu/Debian
sudo systemctl start postgresql

# En Windows
# Iniciar desde Services o pg_ctl start
```

### Paso 2: Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# En el prompt de psql:
CREATE DATABASE propmanager;
CREATE USER propmanager_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE propmanager TO propmanager_user;
\q
```

### Paso 3: Ejecutar Schema SQL

```bash
cd backend
psql -U postgres -d propmanager -f src/config/schema.sql
```

### Paso 4: Iniciar Backend

```bash
cd backend
npm install  # Si no lo has hecho
npm run dev
```

Deberías ver:
```
✅ Database connected successfully
🚀 Server listening on port 3001
```

### Paso 5: Iniciar Frontend

```bash
# En otra terminal
npm install  # Si no lo has hecho
npm run dev
```

El frontend estará en `http://localhost:5173`

---

## ✅ Solución 2: Docker Compose (Más Fácil)

### Crear docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: propmanager-db
    environment:
      POSTGRES_DB: propmanager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/config/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Iniciar con Docker

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Esperar a que esté listo
docker-compose ps

# Iniciar backend
cd backend
npm run dev

# En otra terminal, iniciar frontend
npm run dev
```

---

## ✅ Solución 3: Usar Datos Mock (Temporal)

Si solo quieres probar el frontend sin backend:

1. Edita `.env`:
```bash
VITE_ENABLE_MOCK_DATA=true
```

2. En `src/contexts/AppContext.tsx`, comenta temporalmente el `useEffect` que hace fetch.

---

## 🔍 Verificar que Todo Funciona

### 1. Backend Health Check
```bash
curl http://localhost:3001/api/v1/health
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-26T..."
  }
}
```

### 2. Test de Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propmanager.com",
    "password": "admin123",
    "role": "superadmin"
  }'
```

---

## 📝 Credenciales de Prueba

Una vez que el schema esté cargado, puedes crear usuarios de prueba:

```sql
-- Conectar a la base de datos
psql -U postgres -d propmanager

-- Insertar usuario de prueba (owner)
INSERT INTO owners (owner_id, nombre_completo, email, password_hash, telefono, direccion)
VALUES (
  gen_random_uuid(),
  'Carlos Propietario',
  'carlos@test.com',
  '$2a$10$YourHashedPasswordHere',
  '+1234567890',
  'Calle Principal 123'
);
```

O usar el endpoint de registro:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register/owner \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Carlos Test",
    "email": "carlos@test.com",
    "password": "password123",
    "telefono": "+1234567890",
    "direccion": "Calle Test 123"
  }'
```

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL no está corriendo
- Solución: Iniciar PostgreSQL (ver arriba)

### Error: "password authentication failed"
- Contraseña incorrecta en `backend/.env`
- Solución: Actualizar `DB_PASSWORD` en `backend/.env`

### Error: "database propmanager does not exist"
- Base de datos no creada
- Solución: Ejecutar `CREATE DATABASE propmanager;`

### Error: "relation owners does not exist"
- Schema SQL no ejecutado
- Solución: Ejecutar `psql -U postgres -d propmanager -f backend/src/config/schema.sql`

### Frontend: "Failed to fetch"
- Backend no está corriendo
- Solución: Iniciar backend con `npm run dev`

---

## 📊 Estado de los Servicios

Para verificar que todo está corriendo:

```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar Backend
curl http://localhost:3001/api/v1/health

# Verificar Frontend
# Abre http://localhost:5173 en tu navegador
```

---

## 🎯 Siguiente Paso

Una vez que todo esté configurado:

1. ✅ PostgreSQL corriendo
2. ✅ Backend corriendo (puerto 3001)
3. ✅ Frontend corriendo (puerto 5173)
4. ✅ Puedes hacer login!

**Credenciales para probar:**
- Email: Cualquiera que registres
- Password: La que uses al registrar
- Role: owner, tenant, o superadmin

---

## 💡 Tip Pro

Crea un archivo `start.sh` para iniciar todo:

```bash
#!/bin/bash
# Iniciar PostgreSQL (si usas Docker)
docker-compose up -d

# Esperar a que PostgreSQL esté listo
sleep 3

# Iniciar backend en background
cd backend && npm run dev &

# Esperar a que backend esté listo
sleep 3

# Iniciar frontend
cd .. && npm run dev
```

```bash
chmod +x start.sh
./start.sh
```

---

**¿Necesitas ayuda?** Revisa los logs:
- Backend: `backend/logs/app.log`
- Frontend: Console del navegador (F12)
