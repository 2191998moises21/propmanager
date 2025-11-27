# 📖 PropManager - Runbook Operacional

Guía de procedimientos operacionales para el equipo de SRE/DevOps que mantiene PropManager en producción.

---

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Procedimientos Diarios](#procedimientos-diarios)
3. [Monitoreo y Alertas](#monitoreo-y-alertas)
4. [Procedimientos de Incidentes](#procedimientos-de-incidentes)
5. [Mantenimiento Programado](#mantenimiento-programado)
6. [Backups y Restauración](#backups-y-restauración)
7. [Escalado de Recursos](#escalado-de-recursos)
8. [Troubleshooting Común](#troubleshooting-común)
9. [Contactos y Escalación](#contactos-y-escalación)
10. [Comandos de Referencia Rápida](#comandos-de-referencia-rápida)

---

## 📊 Información General

### Información del Sistema

```yaml
Aplicación: PropManager
Ambiente: Production
Project ID: propmanager-production-478716
Región: us-central1
Owner: Equipo PropManager
On-call: Ver PagerDuty/Slack
```

### URLs Importantes

```
Frontend: https://propmanager-frontend-HASH.a.run.app
Backend API: https://propmanager-backend-HASH.a.run.app
Health Check: https://propmanager-backend-HASH.a.run.app/api/v1/health

Cloud Console: https://console.cloud.google.com/home/dashboard?project=propmanager-production-478716
Cloud Run: https://console.cloud.google.com/run?project=propmanager-production-478716
Cloud SQL: https://console.cloud.google.com/sql/instances?project=propmanager-production-478716
Logs: https://console.cloud.google.com/logs?project=propmanager-production-478716
Monitoring: https://console.cloud.google.com/monitoring?project=propmanager-production-478716
```

### SLAs y SLOs

```
Availability SLO: 99.5% (uptime)
Error Rate SLO: < 1%
Latency SLO (p95): < 2 seconds
Latency SLO (p99): < 5 seconds

Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): 24 hours (daily backups)
```

---

## 🌅 Procedimientos Diarios

### Checklist Matutino (9:00 AM)

```bash
# 1. Verificar estado de servicios
gcloud run services list --project=propmanager-production-478716

# 2. Verificar health checks
curl https://propmanager-backend-HASH.a.run.app/api/v1/health

# 3. Revisar errores de las últimas 24 horas
gcloud logging read \
  "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=50 \
  --format=json \
  --project=propmanager-production-478716

# 4. Verificar métricas de la base de datos
gcloud sql operations list \
  --instance=propmanager-db \
  --limit=10 \
  --project=propmanager-production-478716

# 5. Revisar uso de recursos
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/cpu/utilizations"' \
  --format=json \
  --project=propmanager-production-478716
```

### Checklist de Tarde (5:00 PM)

```bash
# 1. Verificar backups diarios
gcloud sql backups list \
  --instance=propmanager-db \
  --limit=1 \
  --project=propmanager-production-478716

# 2. Revisar alertas pendientes
# (Ir a Cloud Console → Monitoring → Alerting)

# 3. Verificar builds del día
gcloud builds list \
  --limit=10 \
  --project=propmanager-production-478716

# 4. Revisar costos del día
# (Ir a Cloud Console → Billing → Reports)
```

---

## 📡 Monitoreo y Alertas

### Dashboards Principales

1. **Cloud Run Metrics**
   - Request count
   - Request latency (p50, p95, p99)
   - Error rate
   - Container instances
   - CPU utilization
   - Memory utilization

2. **Cloud SQL Metrics**
   - Connections
   - CPU utilization
   - Memory utilization
   - Disk usage
   - Query latency

3. **Application Metrics**
   - API response times por endpoint
   - Login success rate
   - Payment processing rate
   - Ticket creation rate

### Alertas Configuradas

| Alerta | Condición | Acción |
|--------|-----------|--------|
| High Error Rate | Error rate > 5% for 5 min | PagerDuty + Slack |
| High Latency | p95 latency > 2s for 5 min | Slack notification |
| Low Uptime | Uptime < 99% | PagerDuty |
| DB Connections High | Connections > 18/20 | Slack + Auto-scale |
| Disk Usage High | Disk > 80% | Email + Slack |
| Failed Backup | Backup failed | PagerDuty |

### Cómo Revisar Alertas

```bash
# Listar políticas de alerta
gcloud alpha monitoring policies list \
  --project=propmanager-production-478716

# Ver detalles de una alerta
gcloud alpha monitoring policies describe POLICY_NAME \
  --project=propmanager-production-478716

# Ver incidentes abiertos
gcloud alpha monitoring policies conditions list \
  --policy=POLICY_NAME \
  --project=propmanager-production-478716
```

---

## 🚨 Procedimientos de Incidentes

### Severidad de Incidentes

**SEV 1 - Crítico**
- Sistema completamente caído
- Pérdida de datos
- Brecha de seguridad
- **Respuesta:** Inmediata (< 15 min)

**SEV 2 - Alto**
- Funcionalidad principal degradada
- Error rate > 10%
- Latencia > 10 segundos
- **Respuesta:** < 1 hora

**SEV 3 - Medio**
- Funcionalidad secundaria afectada
- Error rate 5-10%
- Latencia 5-10 segundos
- **Respuesta:** < 4 horas

**SEV 4 - Bajo**
- Issues menores
- No afecta usuarios
- **Respuesta:** < 24 horas

### Procedimiento General de Incidentes

#### 1. Detección y Alerta
```bash
# Verificar estado actual
gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --project=propmanager-production-478716

# Ver logs en tiempo real
gcloud run services logs tail propmanager-backend \
  --region=us-central1 \
  --project=propmanager-production-478716
```

#### 2. Evaluación
```bash
# Revisar métricas recientes
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"' \
  --format=json \
  --project=propmanager-production-478716

# Verificar estado de Cloud SQL
gcloud sql instances describe propmanager-db \
  --project=propmanager-production-478716
```

#### 3. Comunicación
```
1. Actualizar status page (si existe)
2. Notificar en Slack #incidents
3. Crear incident ticket
4. Notificar stakeholders si SEV 1 o SEV 2
```

#### 4. Mitigación
```bash
# Ver sección específica según el tipo de incidente
```

#### 5. Resolución
```bash
# Verificar que el servicio esté OK
curl https://propmanager-backend-HASH.a.run.app/api/v1/health

# Verificar métricas post-incidente
# (Esperar 15-30 minutos)
```

#### 6. Post-Mortem
```
- Documentar incidente
- Root cause analysis
- Action items para prevenir recurrencia
- Compartir learnings con el equipo
```

---

## 🔧 Procedimientos Específicos por Tipo de Incidente

### Incidente: API No Responde (504 Gateway Timeout)

**Síntomas:**
- Health check falla
- Timeouts en requests
- Cloud Run muestra instancias crashed

**Investigación:**
```bash
# 1. Ver logs de errores
gcloud run services logs read propmanager-backend \
  --region=us-central1 \
  --limit=100 \
  --project=propmanager-production-478716 | grep -i error

# 2. Verificar estado de las revisiones
gcloud run revisions list \
  --service=propmanager-backend \
  --region=us-central1 \
  --project=propmanager-production-478716

# 3. Verificar conectividad con Cloud SQL
gcloud sql operations list \
  --instance=propmanager-db \
  --limit=10 \
  --project=propmanager-production-478716
```

**Mitigación:**
```bash
# Opción 1: Restart (cambiar traffic a nueva revisión)
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --project=propmanager-production-478716

# Opción 2: Rollback a revisión anterior
PREVIOUS_REVISION=$(gcloud run revisions list \
  --service=propmanager-backend \
  --region=us-central1 \
  --format="value(name)" \
  --limit=2 | tail -n1)

gcloud run services update-traffic propmanager-backend \
  --to-revisions=$PREVIOUS_REVISION=100 \
  --region=us-central1 \
  --project=propmanager-production-478716

# Opción 3: Aumentar recursos temporalmente
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --memory=1Gi \
  --cpu=2 \
  --project=propmanager-production-478716
```

### Incidente: Base de Datos No Responde

**Síntomas:**
- Errors "ECONNREFUSED" o "connection timeout"
- Cloud SQL muestra CPU/Memory al 100%
- Queries lentas

**Investigación:**
```bash
# 1. Verificar estado de la instancia
gcloud sql instances describe propmanager-db \
  --project=propmanager-production-478716

# 2. Ver operaciones recientes
gcloud sql operations list \
  --instance=propmanager-db \
  --limit=20 \
  --project=propmanager-production-478716

# 3. Verificar conexiones activas
# (Conectar a la DB)
gcloud sql connect propmanager-db --user=propmanager-user

# En psql:
SELECT count(*) FROM pg_stat_activity;
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Mitigación:**
```bash
# Opción 1: Restart de Cloud SQL
gcloud sql instances restart propmanager-db \
  --project=propmanager-production-478716

# Opción 2: Terminar conexiones colgadas
# (Desde psql)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'propmanager'
  AND pid <> pg_backend_pid()
  AND state = 'idle'
  AND state_change < current_timestamp - INTERVAL '15 minutes';

# Opción 3: Escalar tier temporalmente
gcloud sql instances patch propmanager-db \
  --tier=db-n1-standard-1 \
  --project=propmanager-production-478716
```

### Incidente: High Memory Usage

**Síntomas:**
- Cloud Run crashea con "OOMKilled"
- Memory utilization > 90%

**Investigación:**
```bash
# Ver logs de memory issues
gcloud run services logs read propmanager-backend \
  --region=us-central1 \
  --limit=100 \
  --project=propmanager-production-478716 | grep -i "memory\|oom"

# Ver métricas de memoria
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/memory/utilizations"' \
  --format=json \
  --project=propmanager-production-478716
```

**Mitigación:**
```bash
# Aumentar memoria
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --memory=1Gi \
  --project=propmanager-production-478716

# Reiniciar servicio
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --project=propmanager-production-478716
```

### Incidente: Deployment Failed

**Síntomas:**
- Cloud Build falla
- Nueva revisión no se crea
- Errors en build logs

**Investigación:**
```bash
# Ver último build
gcloud builds list --limit=1 --project=propmanager-production-478716

# Ver logs del build
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID --project=propmanager-production-478716
```

**Mitigación:**
```bash
# Re-trigger build
gcloud builds submit \
  --config=backend/cloudbuild.yaml \
  --project=propmanager-production-478716

# O hacer rollback manual
# (Ver procedimiento de rollback más abajo)
```

---

## 🔄 Mantenimiento Programado

### Actualizaciones de Seguridad

**Frecuencia:** Mensual (primer domingo del mes, 2:00 AM)

```bash
# 1. Notificar a usuarios (24h antes)
# 2. Crear backup manual
gcloud sql backups create \
  --instance=propmanager-db \
  --description="Pre-maintenance backup" \
  --project=propmanager-production-478716

# 3. Actualizar dependencias
cd backend
npm audit fix
npm update

cd ../
npm audit fix
npm update

# 4. Ejecutar tests
npm test

# 5. Deploy a staging primero (si existe)
# 6. Deploy a producción
git add .
git commit -m "chore: security updates"
git push origin main

# 7. Monitorear por 30 minutos
# 8. Notificar completado
```

### Limpieza de Recursos

**Frecuencia:** Semanal (domingo, 3:00 AM)

```bash
# 1. Limpiar imágenes viejas de Container Registry
# (Mantener últimas 10 versiones)
for image in $(gcloud container images list --repository=gcr.io/propmanager-production-478716 --format="value(name)"); do
  gcloud container images list-tags $image --limit=999 --sort-by=TIMESTAMP \
    --format="get(digest)" | tail -n +11 | \
    xargs -I {} gcloud container images delete "$image@{}" --quiet
done

# 2. Limpiar logs viejos (> 30 días)
# (Cloud Logging hace esto automáticamente con retention policy)

# 3. Limpiar versiones viejas de secrets (> 10 versiones)
gcloud secrets versions list propmanager-db-password \
  --format="value(name)" | tail -n +11 | \
  xargs -I {} gcloud secrets versions destroy {} --secret=propmanager-db-password --quiet

# 4. Verificar uso de Cloud Storage
gsutil du -sh gs://propmanager-uploads
```

---

## 💾 Backups y Restauración

### Backups Automáticos

```bash
# Verificar configuración de backups
gcloud sql instances describe propmanager-db \
  --format="value(settings.backupConfiguration)" \
  --project=propmanager-production-478716

# Listar backups existentes
gcloud sql backups list \
  --instance=propmanager-db \
  --project=propmanager-production-478716

# Programación actual:
# - Daily automated backups at 03:00 UTC
# - Retention: 7 days
# - Point-in-time recovery: Enabled (last 7 days)
```

### Crear Backup Manual

```bash
# Antes de cambios importantes
gcloud sql backups create \
  --instance=propmanager-db \
  --description="Manual backup before [REASON]" \
  --project=propmanager-production-478716
```

### Restaurar desde Backup

**⚠️ PROCEDIMIENTO CRÍTICO - Requiere aprobación del tech lead**

```bash
# 1. Crear backup del estado actual (por si acaso)
gcloud sql backups create \
  --instance=propmanager-db \
  --description="Pre-restore backup" \
  --project=propmanager-production-478716

# 2. Poner aplicación en modo mantenimiento
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=0 \
  --project=propmanager-production-478716

# 3. Listar backups disponibles
gcloud sql backups list \
  --instance=propmanager-db \
  --project=propmanager-production-478716

# 4. Restaurar backup
BACKUP_ID=[ID_DEL_BACKUP]
gcloud sql backups restore $BACKUP_ID \
  --backup-instance=propmanager-db \
  --project=propmanager-production-478716

# 5. Esperar a que complete (puede tomar 10-30 minutos)

# 6. Verificar integridad
gcloud sql connect propmanager-db --user=propmanager-user
# En psql:
SELECT COUNT(*) FROM owners;
SELECT COUNT(*) FROM properties;
SELECT COUNT(*) FROM contracts;
\q

# 7. Reactivar aplicación
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=10 \
  --project=propmanager-production-478716

# 8. Monitorear logs y health checks
```

### Point-in-Time Recovery

```bash
# Restaurar a un timestamp específico
gcloud sql instances restore-backup propmanager-db \
  --backup-id=BACKUP_ID \
  --backup-instance=propmanager-db \
  --project=propmanager-production-478716
```

---

## 📈 Escalado de Recursos

### Escalar Cloud Run (Backend/Frontend)

**Aumentar capacidad:**
```bash
# Aumentar instancias máximas
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --max-instances=20 \
  --project=propmanager-production-478716

# Aumentar CPU y memoria
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --cpu=2 \
  --memory=1Gi \
  --project=propmanager-production-478716

# Configurar instancias mínimas (reduce cold starts)
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=2 \
  --project=propmanager-production-478716
```

**Reducir capacidad (optimizar costos):**
```bash
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=10 \
  --cpu=1 \
  --memory=512Mi \
  --project=propmanager-production-478716
```

### Escalar Cloud SQL

**Aumentar tier:**
```bash
# De db-f1-micro a db-g1-small
gcloud sql instances patch propmanager-db \
  --tier=db-g1-small \
  --project=propmanager-production-478716

# De db-g1-small a db-n1-standard-1
gcloud sql instances patch propmanager-db \
  --tier=db-n1-standard-1 \
  --project=propmanager-production-478716
```

**Aumentar storage:**
```bash
gcloud sql instances patch propmanager-db \
  --storage-size=20GB \
  --project=propmanager-production-478716
```

**Habilitar High Availability:**
```bash
gcloud sql instances patch propmanager-db \
  --availability-type=REGIONAL \
  --project=propmanager-production-478716
```

---

## 🔍 Troubleshooting Común

### Problema: "ECONNREFUSED" errors

**Causa probable:** Cloud Run no puede conectar a Cloud SQL

**Solución:**
```bash
# 1. Verificar connection name
gcloud sql instances describe propmanager-db \
  --format="value(connectionName)" \
  --project=propmanager-production-478716

# 2. Verificar que Cloud Run tiene Cloud SQL connection configurada
gcloud run services describe propmanager-backend \
  --region=us-central1 \
  --format="value(metadata.annotations)" \
  --project=propmanager-production-478716 | grep cloudsql

# 3. Actualizar connection
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --add-cloudsql-instances=propmanager-production-478716:us-central1:propmanager-db \
  --project=propmanager-production-478716
```

### Problema: CORS errors en frontend

**Causa:** Backend no tiene frontend origin en CORS_ORIGIN

**Solución:**
```bash
# Obtener URL del frontend
FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
  --region=us-central1 \
  --format="value(status.url)" \
  --project=propmanager-production-478716)

# Actualizar backend CORS
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --update-env-vars=CORS_ORIGIN="$FRONTEND_URL,https://propmanager.com" \
  --project=propmanager-production-478716
```

### Problema: Secrets not found

**Solución:**
```bash
# Verificar que existen
gcloud secrets list --project=propmanager-production-478716

# Verificar permisos
PROJECT_NUMBER=$(gcloud projects describe propmanager-production-478716 --format="value(projectNumber)")
gcloud secrets get-iam-policy propmanager-db-password --project=propmanager-production-478716

# Agregar permisos si faltan
gcloud secrets add-iam-policy-binding propmanager-db-password \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=propmanager-production-478716
```

### Problema: Build failures

**Solución:**
```bash
# Ver último error
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)" --project=propmanager-production-478716)
gcloud builds log $BUILD_ID --project=propmanager-production-478716

# Retry build
gcloud builds submit \
  --config=backend/cloudbuild.yaml \
  --project=propmanager-production-478716
```

---

## 📞 Contactos y Escalación

### Equipo On-Call

```
Primary On-Call: Ver PagerDuty
Backup On-Call: Ver PagerDuty
Tech Lead: [email protected]
DevOps Lead: [email protected]
```

### Escalación Matrix

| Tiempo sin resolución | Acción |
|----------------------|--------|
| 15 minutos (SEV 1) | Escalar a Backup On-Call |
| 30 minutos (SEV 1) | Escalar a Tech Lead |
| 1 hora (SEV 1) | Escalar a Engineering Manager |
| 4 horas (SEV 2) | Escalar a Tech Lead |

### Canales de Comunicación

```
Slack: #propmanager-alerts
PagerDuty: PropManager Production
Email: devops@propmanager.com
Phone: Disponible en PagerDuty
```

---

## ⚡ Comandos de Referencia Rápida

### Ver Logs
```bash
# Backend logs (últimos 50)
gcloud run services logs read propmanager-backend --region=us-central1 --limit=50

# Seguir logs en tiempo real
gcloud run services logs tail propmanager-backend --region=us-central1

# Solo errores
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=50

# Buscar texto específico
gcloud logging read 'jsonPayload.message=~"database"' --limit=100
```

### Ver Estado de Servicios
```bash
# Estado de Cloud Run
gcloud run services describe propmanager-backend --region=us-central1

# Estado de Cloud SQL
gcloud sql instances describe propmanager-db

# Health check
curl https://propmanager-backend-HASH.a.run.app/api/v1/health
```

### Deploy y Rollback
```bash
# Deploy
gcloud builds submit --config=backend/cloudbuild.yaml

# Rollback
PREVIOUS=$(gcloud run revisions list --service=propmanager-backend --region=us-central1 --format="value(name)" --limit=2 | tail -n1)
gcloud run services update-traffic propmanager-backend --to-revisions=$PREVIOUS=100 --region=us-central1
```

### Restart Services
```bash
# Restart Cloud Run
gcloud run services update propmanager-backend --region=us-central1

# Restart Cloud SQL
gcloud sql instances restart propmanager-db
```

### Ver Métricas
```bash
# Cloud Run requests
gcloud monitoring time-series list --filter='metric.type="run.googleapis.com/request_count"' --format=json

# Cloud SQL connections
gcloud sql operations list --instance=propmanager-db --limit=10
```

---

## 📚 Referencias Adicionales

- [GOOGLE_CLOUD_DEPLOYMENT.md](./GOOGLE_CLOUD_DEPLOYMENT.md) - Guía de despliegue
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) - Plan de recuperación
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)

---

**Última actualización:** 2025-11-19
**Versión:** 1.0
**Mantenido por:** DevOps Team
