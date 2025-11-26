# 🚀 Local Development Setup - Quick Start

## Current Status

✅ **Code is ready** - Frontend and backend are fully integrated
✅ **GCP deployment ready** - All infrastructure files and documentation complete
⚠️ **Database needed** - PostgreSQL must be running to start the backend

## The "Failed to fetch" Error - Root Cause

When you see "Failed to fetch" during login, it means:
- ❌ Backend API is not running (port 3001)
- ❌ Backend can't start without PostgreSQL
- ❌ PostgreSQL is not running

## 🎯 Three Ways to Get Started (Choose One)

### Option 1: Docker Compose (Recommended - Easiest)

**Requirements:** Docker installed on your machine

```bash
# 1. Start PostgreSQL (auto-initializes schema)
docker-compose up -d

# 2. Wait for database to be ready (5 seconds)
sleep 5

# 3. Install backend dependencies (if not already done)
cd backend
npm install

# 4. Start backend
npm run dev

# Expected output:
# ✅ Database connected successfully
# 🚀 Server listening on port 3001
```

**In another terminal:**
```bash
# 5. Install frontend dependencies (if not already done)
npm install

# 6. Start frontend
npm run dev

# Frontend will be at: http://localhost:5173
```

---

### Option 2: Native PostgreSQL

**Requirements:** PostgreSQL 14+ installed on your machine

```bash
# 1. Start PostgreSQL service
# macOS:
brew services start postgresql@14

# Ubuntu/Debian:
sudo systemctl start postgresql

# Windows:
# Start from Services or: pg_ctl start -D "C:\Program Files\PostgreSQL\14\data"

# 2. Create database and user
psql -U postgres
```

```sql
-- In psql prompt:
CREATE DATABASE propmanager;
CREATE USER propmanager_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE propmanager TO propmanager_user;
\q
```

```bash
# 3. Load schema
cd backend
psql -U postgres -d propmanager -f src/config/schema.sql

# 4. Install dependencies and start backend
npm install
npm run dev
```

**In another terminal:**
```bash
# 5. Start frontend
npm install
npm run dev
```

---

### Option 3: Temporary Mock Data (Testing UI Only)

**Use this if you just want to test the UI without backend**

```bash
# 1. Edit .env file
echo "VITE_ENABLE_MOCK_DATA=true" >> .env

# 2. Temporarily comment out API calls in src/contexts/AppContext.tsx
# (Lines 75-120: the fetchData useEffect)

# 3. Start frontend only
npm install
npm run dev
```

---

## ✅ Verify Everything Works

### 1. Test Backend Health
```bash
curl http://localhost:3001/api/v1/health
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-26T..."
  }
}
```

### 2. Test Login Endpoint
```bash
curl -X POST http://localhost:3001/api/v1/auth/register/owner \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "telefono": "+1234567890",
    "direccion": "Test Address 123"
  }'
```

### 3. Login via Frontend
1. Open http://localhost:5173
2. Click "Registrarse"
3. Register as "Propietario"
4. Fill in the form and submit
5. You should be logged in successfully!

---

## 🐛 Common Issues

### "ECONNREFUSED 127.0.0.1:5432"
- **Problem:** PostgreSQL not running
- **Solution:** Start PostgreSQL (see options above)

### "database propmanager does not exist"
- **Problem:** Database not created
- **Solution:** Run `CREATE DATABASE propmanager;` in psql

### "relation owners does not exist"
- **Problem:** Schema not loaded
- **Solution:** Run `psql -U postgres -d propmanager -f backend/src/config/schema.sql`

### Backend exits immediately
- **Problem:** Can't connect to database
- **Solution:** Verify PostgreSQL is running with `pg_isready -h localhost -p 5432`

### "Failed to fetch" in browser
- **Problem:** Backend not running
- **Solution:** Start backend with `cd backend && npm run dev`

---

## 📦 What's Included in This Repository

### Development Files
- ✅ `docker-compose.yml` - One-command PostgreSQL setup
- ✅ `backend/.env` - Backend development configuration
- ✅ `.env` - Frontend development configuration
- ✅ `QUICK_SETUP.md` - Detailed setup guide with troubleshooting

### Documentation
- ✅ `GOOGLE_CLOUD_DEPLOYMENT.md` - Complete GCP deployment guide
- ✅ `ARCHITECTURE.md` - Technical architecture documentation
- ✅ `RUNBOOK.md` - Operational procedures
- ✅ `DISASTER_RECOVERY.md` - DR plan with RTO/RPO
- ✅ `ENV_FLOW.md` - Environment variables explained

### Automation Scripts
- ✅ `scripts/setup-gcp.sh` - Automated GCP infrastructure setup
- ✅ `scripts/deploy-backend.sh` - Backend deployment
- ✅ `scripts/deploy-frontend.sh` - Frontend deployment
- ✅ `scripts/health-check.sh` - System health verification
- ✅ `scripts/backup.sh` - Database backup
- ✅ `scripts/run-schema.sh` - Execute schema on Cloud SQL

### Infrastructure
- ✅ `Dockerfile` - Multi-stage frontend build
- ✅ `nginx.conf` - Production-ready nginx config
- ✅ `cloudbuild.yaml` - Frontend CI/CD pipeline
- ✅ `backend/cloudbuild.yaml` - Backend CI/CD pipeline
- ✅ `backend/.gcloudignore` - Optimize Cloud Build uploads

---

## 🎓 Next Steps After Local Setup Works

Once you have the app running locally:

### 1. Test the Application
- ✅ Register as owner
- ✅ Create properties
- ✅ Add tenants
- ✅ Create contracts
- ✅ Record payments
- ✅ Create maintenance tickets

### 2. Deploy to Google Cloud (Optional)
```bash
# Run the automated setup script
./scripts/setup-gcp.sh

# Deploy backend
./scripts/deploy-backend.sh

# Deploy frontend
./scripts/deploy-frontend.sh

# Verify deployment
./scripts/health-check.sh
```

See `GOOGLE_CLOUD_DEPLOYMENT.md` for complete deployment guide.

---

## 💡 Quick Reference

| Service | URL | Status Command |
|---------|-----|----------------|
| Frontend | http://localhost:5173 | Open in browser |
| Backend API | http://localhost:3001/api/v1 | `curl http://localhost:3001/api/v1/health` |
| PostgreSQL | localhost:5432 | `pg_isready -h localhost -p 5432` |

---

## 🆘 Need Help?

1. **Setup Issues:** See `QUICK_SETUP.md` for detailed troubleshooting
2. **Environment Variables:** See `ENV_FLOW.md` for dev vs production
3. **Deployment:** See `GOOGLE_CLOUD_DEPLOYMENT.md` for GCP guide
4. **Architecture:** See `ARCHITECTURE.md` for technical details

---

**Remember:** Your local `.env` files are in `.gitignore` and will never affect Google Cloud deployment. See `ENV_FLOW.md` for details.

**Last Updated:** 2025-11-26
