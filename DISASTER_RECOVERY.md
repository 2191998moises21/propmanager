# 🚨 PropManager - Plan de Recuperación ante Desastres (DRP)

**Disaster Recovery Plan (DRP) para PropManager**

Este documento describe los procedimientos para recuperar PropManager de desastres catastróficos o fallas críticas del sistema.

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Objetivos y Métricas](#objetivos-y-métricas)
3. [Escenarios de Desastre](#escenarios-de-desastre)
4. [Estrategia de Backup](#estrategia-de-backup)
5. [Procedimientos de Recuperación](#procedimientos-de-recuperación)
6. [Plan de Comunicación](#plan-de-comunicación)
7. [Testing del DRP](#testing-del-drp)
8. [Roles y Responsabilidades](#roles-y-responsabilidades)

---

## 📊 Resumen Ejecutivo

### Propósito

Este Plan de Recuperación ante Desastres (DRP) establece procedimientos para:
- Minimizar el impacto de interrupciones del servicio
- Garantizar la continuidad del negocio
- Proteger los datos de usuarios y propietarios
- Restaurar operaciones normales en el menor tiempo posible

### Alcance

Este plan cubre:
- ✅ Aplicación web (Frontend y Backend)
- ✅ Base de datos PostgreSQL
- ✅ Archivos almacenados (Cloud Storage)
- ✅ Configuraciones y secretos
- ✅ Infraestructura de Google Cloud Platform

### Última Actualización

**Fecha:** 2025-11-19
**Versión:** 1.0
**Próxima Revisión:** 2025-02-19 (trimestral)

---

## 🎯 Objetivos y Métricas

### Recovery Time Objective (RTO)

**RTO:** Tiempo máximo aceptable para restaurar el servicio

| Componente | RTO Target | Prioridad |
|-----------|------------|-----------|
| Backend API | 1 hora | Crítico |
| Frontend Web | 1 hora | Crítico |
| Base de Datos | 2 horas | Crítico |
| Cloud Storage | 4 horas | Alto |
| CI/CD Pipeline | 24 horas | Medio |

### Recovery Point Objective (RPO)

**RPO:** Cantidad máxima aceptable de pérdida de datos

| Tipo de Dato | RPO Target | Método de Backup |
|--------------|------------|------------------|
| Base de Datos | 24 horas | Backup diario automático |
| Archivos | 24 horas | Versionamiento de Cloud Storage |
| Código | 0 (sin pérdida) | Git + GitHub |
| Configuración | 0 (sin pérdida) | Infrastructure as Code |

### Service Level Objectives (SLOs)

```
Uptime SLO: 99.5% mensual
 - Downtime permitido: ~3.6 horas/mes
 - Downtime permitido: ~43 minutos/semana

Error Rate SLO: < 1%
Data Loss SLO: 0% (para datos de producción)
```

---

## 🌪️ Escenarios de Desastre

### Nivel 1: Crítico - Sistema Caído

**Síntomas:**
- Frontend y/o Backend completamente inaccesible
- Error rate > 50%
- Todos los usuarios afectados

**Posibles Causas:**
- Falla regional de GCP
- Error en deployment que crashea todos los servicios
- Ataque DDoS
- Corrupción de base de datos

**Impacto:** Alto
**RTO:** 1 hora
**Procedimiento:** [Ver Nivel 1](#procedimiento-nivel-1-sistema-caído)

---

### Nivel 2: Alto - Pérdida de Datos

**Síntomas:**
- Datos faltantes o corruptos
- Inconsistencias en la base de datos
- Usuarios reportan información perdida

**Posibles Causas:**
- Error en migración de base de datos
- Eliminación accidental de datos
- Fallo en disco de Cloud SQL

**Impacto:** Alto
**RTO:** 2 horas
**RPO:** 24 horas
**Procedimiento:** [Ver Nivel 2](#procedimiento-nivel-2-pérdida-de-datos)

---

### Nivel 3: Medio - Degradación del Servicio

**Síntomas:**
- Alta latencia (> 10 segundos)
- Error rate 10-50%
- Algunos usuarios afectados

**Posibles Causas:**
- Base de datos sobrecargada
- Memory leaks
- Conexiones agotadas

**Impacto:** Medio
**RTO:** 4 horas
**Procedimiento:** [Ver Nivel 3](#procedimiento-nivel-3-degradación-del-servicio)

---

### Nivel 4: Bajo - Falla de Componente

**Síntomas:**
- Un feature específico no funciona
- Error rate < 10%
- Pocos usuarios afectados

**Posibles Causas:**
- Bug en código
- API externa caída
- Problema con Cloud Storage

**Impacto:** Bajo
**RTO:** 24 horas
**Procedimiento:** [Ver RUNBOOK.md](#)

---

## 💾 Estrategia de Backup

### Backups Automáticos

#### Base de Datos (Cloud SQL)

```yaml
Frecuencia: Diaria
Hora: 03:00 UTC (11:00 PM hora local)
Retención: 7 días
Tipo: Full backup + Point-in-time recovery
Storage: Regional (us-central1)
```

**Verificación:**
```bash
# Listar backups
gcloud sql backups list --instance=propmanager-db

# Verificar último backup
gcloud sql backups list --instance=propmanager-db --limit=1
```

#### Cloud Storage

```yaml
Versionamiento: Habilitado
Retención de versiones: 10 versiones
Lifecycle policy: Eliminar versiones > 30 días
```

**Verificación:**
```bash
# Verificar versionamiento
gsutil versioning get gs://propmanager-uploads

# Ver versiones de un archivo
gsutil ls -a gs://propmanager-uploads/path/to/file
```

#### Código Fuente

```yaml
Sistema: Git + GitHub
Branches protegidas: main
Backup: GitHub automático + copia local
Frecuencia: Continua (cada push)
```

### Backups Manuales

**Antes de cambios importantes:**

```bash
# Crear backup manual
./scripts/backup.sh "Pre-migration backup - $(date +%Y%m%d)"

# Verificar
gcloud sql backups list --instance=propmanager-db --limit=5
```

### Restauración de Backups

Ver [Procedimientos de Recuperación](#procedimientos-de-recuperación)

---

## 🔄 Procedimientos de Recuperación

### Procedimiento Nivel 1: Sistema Caído

**Tiempo estimado:** 1-2 horas
**Personal requerido:** 2 personas (On-call + Backup)

#### Paso 1: Evaluación Inicial (5 min)

```bash
# 1. Verificar estado de servicios
./scripts/health-check.sh

# 2. Ver logs recientes
gcloud logging read \
  "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit=100 \
  --format=json

# 3. Verificar métricas
# (Ir a Cloud Console → Monitoring)
```

#### Paso 2: Identificar Causa (15 min)

**Checklist:**
- [ ] ¿Hay un incident de GCP? ([status.cloud.google.com](https://status.cloud.google.com))
- [ ] ¿Hubo un deployment reciente?
- [ ] ¿Cambió alguna configuración?
- [ ] ¿Hay ataques DDoS?
- [ ] ¿La base de datos está accesible?

#### Paso 3: Mitigación Inmediata (30 min)

**Opción A: Rollback a versión anterior**

```bash
# Listar revisiones
gcloud run revisions list \
  --service=propmanager-backend \
  --region=us-central1

# Rollback
PREVIOUS=$(gcloud run revisions list \
  --service=propmanager-backend \
  --region=us-central1 \
  --format="value(name)" \
  --limit=2 | tail -n1)

gcloud run services update-traffic propmanager-backend \
  --to-revisions=$PREVIOUS=100 \
  --region=us-central1

# Repetir para frontend si es necesario
```

**Opción B: Restart de servicios**

```bash
# Restart backend
gcloud run services update propmanager-backend \
  --region=us-central1

# Restart frontend
gcloud run services update propmanager-frontend \
  --region=us-central1

# Restart Cloud SQL (solo si es necesario)
gcloud sql instances restart propmanager-db
```

**Opción C: Escalar recursos**

```bash
# Aumentar instancias
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=2 \
  --max-instances=20

# Aumentar CPU y memoria
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --cpu=2 \
  --memory=1Gi
```

#### Paso 4: Verificación (10 min)

```bash
# Health check
curl https://propmanager-backend-HASH.a.run.app/api/v1/health

# Monitorear logs
gcloud run services logs tail propmanager-backend \
  --region=us-central1

# Verificar métricas por 10 minutos
```

#### Paso 5: Comunicación

```bash
# Actualizar status page
# Notificar en Slack
# Email a stakeholders si > 1 hora downtime
```

---

### Procedimiento Nivel 2: Pérdida de Datos

**Tiempo estimado:** 2-4 horas
**Personal requerido:** 3 personas (On-call + Backup + DBA/Tech Lead)

#### Paso 1: Stop the Bleeding (5 min)

```bash
# 1. Poner aplicación en modo read-only
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=0

# 2. Crear backup del estado actual
./scripts/backup.sh "Pre-recovery backup - EMERGENCY"
```

#### Paso 2: Evaluar Daño (15 min)

```bash
# Conectar a base de datos
gcloud sql connect propmanager-db --user=propmanager-user

# Verificar integridad
SELECT COUNT(*) FROM owners;
SELECT COUNT(*) FROM properties;
SELECT COUNT(*) FROM contracts;
SELECT COUNT(*) FROM payments;
SELECT COUNT(*) FROM tenants;

# Identificar datos faltantes/corruptos
# (Queries específicos según el caso)
```

#### Paso 3: Identificar Backup Apropiado (10 min)

```bash
# Listar backups disponibles
gcloud sql backups list \
  --instance=propmanager-db

# Verificar con stakeholders:
# ¿Cuándo fue la última vez que los datos estaban correctos?
# ¿Qué tan críticos son los datos desde ese momento?
```

#### Paso 4: Restaurar Backup (60-120 min)

```bash
# ⚠️ ADVERTENCIA: Esto sobrescribirá toda la base de datos

# 1. Verificar backup seleccionado
BACKUP_ID="SELECTED_BACKUP_ID"
gcloud sql backups describe $BACKUP_ID \
  --instance=propmanager-db

# 2. Restaurar
gcloud sql backups restore $BACKUP_ID \
  --backup-instance=propmanager-db

# 3. Esperar (puede tomar 30-120 minutos)
# Monitorear estado
watch -n 30 'gcloud sql operations list \
  --instance=propmanager-db \
  --limit=1'
```

#### Paso 5: Verificar Restauración (30 min)

```bash
# Conectar a DB
gcloud sql connect propmanager-db --user=propmanager-user

# Verificar datos
SELECT COUNT(*) FROM owners;
SELECT MAX(created_at) FROM properties;
SELECT * FROM contracts ORDER BY created_at DESC LIMIT 10;

# Verificar integridad referencial
SELECT COUNT(*) FROM contracts c
LEFT JOIN properties p ON c.property_id = p.property_id
WHERE p.property_id IS NULL;

\q
```

#### Paso 6: Recuperar Datos Perdidos (si es posible)

```bash
# Si hay datos entre el backup y el desastre que se pueden recuperar:
# - Revisar logs de aplicación
# - Revisar Cloud Logging
# - Contactar usuarios afectados si es necesario
# - Insertar manualmente datos críticos
```

#### Paso 7: Reactivar Aplicación (15 min)

```bash
# Reactivar backend
gcloud run services update propmanager-backend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=10

# Health check
curl https://propmanager-backend-HASH.a.run.app/api/v1/health

# Monitorear por 30 minutos
```

---

### Procedimiento Nivel 3: Degradación del Servicio

**Ver RUNBOOK.md para procedimientos detallados**

Resumen de acciones:
1. Identificar cuellos de botella
2. Escalar recursos temporalmente
3. Optimizar queries lentas
4. Aumentar connection pool
5. Limpiar recursos no usados

---

## 📞 Plan de Comunicación

### Matriz de Comunicación

| Severidad | Stakeholder | Método | Tiempo Máximo |
|-----------|-------------|--------|---------------|
| SEV 1 | On-call Team | PagerDuty | Inmediato |
| SEV 1 | Tech Lead | Phone/Slack | 15 min |
| SEV 1 | Engineering Manager | Phone | 30 min |
| SEV 1 | Usuarios | Status Page | 30 min |
| SEV 2 | On-call Team | PagerDuty | Inmediato |
| SEV 2 | Tech Lead | Slack | 30 min |
| SEV 2 | Usuarios | Email | 2 horas |
| SEV 3 | On-call Team | Slack | 1 hora |
| SEV 3 | Tech Lead | Email | 4 horas |

### Templates de Comunicación

#### Template: Incident Notification (SEV 1)

```
Subject: [SEV 1] PropManager Service Disruption

Estimado equipo,

Estamos experimentando una interrupción del servicio de PropManager.

Status: INVESTIGATING / IDENTIFIED / MONITORING / RESOLVED
Severity: SEV 1 - Critical
Impact: [Descripción del impacto]
Affected Users: [Número/porcentaje]
Start Time: [Timestamp]
ETA: [Tiempo estimado de resolución]

Current Actions:
- [Acción 1]
- [Acción 2]

Next Update: [Timestamp]

Incident Commander: [Nombre]
```

#### Template: Resolution Notice

```
Subject: [RESOLVED] PropManager Service Restored

El servicio de PropManager ha sido completamente restaurado.

Incident Summary:
- Start: [Timestamp]
- End: [Timestamp]
- Duration: [X horas Y minutos]
- Root Cause: [Descripción breve]
- Impact: [Usuarios afectados, pérdida de datos, etc.]

Resolution:
- [Pasos tomados]

Data Loss: [Yes/No - Detalles]

Next Steps:
- Post-mortem meeting: [Fecha y hora]
- Preventive measures: [Lista]

Gracias por su paciencia.
```

---

## 🧪 Testing del DRP

### Frecuencia de Pruebas

```yaml
Backups Test: Mensual
  - Verificar que backups se están creando
  - Probar restauración en ambiente de prueba

Full DR Drill: Trimestral
  - Simular desastre completo
  - Medir RTO/RPO real
  - Documentar lecciones aprendidas

Tabletop Exercise: Semestral
  - Reunión del equipo
  - Walkthrough del plan
  - Identificar gaps
```

### DR Drill Checklist

**Preparación (1 semana antes):**
- [ ] Programar fecha y hora
- [ ] Notificar a todos los participantes
- [ ] Preparar ambiente de testing
- [ ] Crear backup reciente

**Ejecución (día del drill):**
- [ ] Briefing inicial (15 min)
- [ ] Simular desastre (elegir escenario)
- [ ] Ejecutar procedimientos de recovery
- [ ] Cronometrar cada paso
- [ ] Documentar problemas encontrados

**Post-drill (1 semana después):**
- [ ] Reunión de retrospectiva
- [ ] Actualizar documentación
- [ ] Implementar mejoras identificadas
- [ ] Compartir reporte con stakeholders

---

## 👥 Roles y Responsabilidades

### Incident Commander

**Responsabilidades:**
- Coordinar respuesta al desastre
- Tomar decisiones críticas
- Comunicar con stakeholders
- Declarar cuando el incidente está resuelto

**Contacto:** Ver PagerDuty rotation

### Technical Lead

**Responsabilidades:**
- Ejecutar procedimientos técnicos
- Diagnosticar causa raíz
- Implementar soluciones
- Documentar acciones tomadas

**Contacto:** [email protected]

### Database Administrator

**Responsabilidades:**
- Gestionar backups y restauraciones
- Verificar integridad de datos
- Optimizar performance de base de datos

**Contacto:** [email protected]

### Communications Manager

**Responsabilidades:**
- Comunicar con usuarios
- Actualizar status page
- Preparar notificaciones
- Gestionar expectativas

**Contacto:** [email protected]

---

## 📚 Anexos

### Anexo A: Contactos de Emergencia

```
Google Cloud Support:
  - Phone: +1-877-355-5787
  - Web: https://cloud.google.com/support

On-Call Team:
  - PagerDuty: https://propmanager.pagerduty.com
  - Slack: #propmanager-incidents

Escalation Chain:
  1. On-call Engineer
  2. Backup On-call
  3. Tech Lead
  4. Engineering Manager
  5. CTO
```

### Anexo B: Herramientas y Accesos

```
Cloud Console: https://console.cloud.google.com
Monitoring: https://console.cloud.google.com/monitoring
Logs: https://console.cloud.google.com/logs
GitHub: https://github.com/2191998moises21/propmanager

Credenciales: Ver 1Password/LastPass
VPN: [Si aplica]
```

### Anexo C: Checklist Post-Incident

- [ ] Escribir post-mortem detallado
- [ ] Identificar causa raíz
- [ ] Crear tickets para action items
- [ ] Actualizar este documento con lecciones aprendidas
- [ ] Compartir learnings con el equipo
- [ ] Actualizar runbooks si es necesario
- [ ] Revisar y mejorar monitoreo/alertas

---

## 🔄 Mantenimiento del Plan

Este documento debe ser:
- Revisado trimestralmente
- Actualizado después de cada incident mayor
- Actualizado después de cada DR drill
- Versionado en Git

**Próxima Revisión:** 2025-02-19

---

## 📝 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-19 | DevOps Team | Versión inicial |

---

**¿Preguntas sobre este plan?**
Contacta al equipo de DevOps en #devops o devops@propmanager.com

---

**IMPORTANTE:** Este es un documento vivo. Si encuentras información desactualizada o faltante, por favor crea un PR para actualizarlo.
