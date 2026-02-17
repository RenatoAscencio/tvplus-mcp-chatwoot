# Chatwoot API Coverage Audit

**Fecha:** 2026-02-16
**Fuente primaria:** [developers.chatwoot.com](https://developers.chatwoot.com)
**Versión pre-auditoría:** 0.3.0 (59 tools)

---

## 1. Hallazgos Críticos

### 1.1 Reports apuntan a v1 pero la API oficial usa v2

| Tool actual | Ruta implementada (v1) | Ruta oficial (v2) |
|-------------|------------------------|---------------------|
| `get_account_report` | `GET /api/v1/.../reports` | `GET /api/v2/accounts/{id}/reports` |
| `get_report_summary` | `GET /api/v1/.../reports/summary` | `GET /api/v2/accounts/{id}/reports/summary` |

**Impacto:** Las llamadas a reports pueden fallar con 404 en instancias que no exponen v1 para reports.
**Corrección:** Agregar método `forAccountV2()` y redirigir los métodos de reports.

### 1.2 `update_contact` usa PUT en vez de PATCH

- **Actual:** `http.put('/contacts/${contactId}', data)` (client.ts:100)
- **Oficial:** `PATCH /api/v1/accounts/{id}/contacts/{contactId}`
- **Impacto:** Bajo (Rails acepta ambos), pero PATCH es semánticamente correcto para actualizaciones parciales.

### 1.3 `getProfile()` existe en client pero no tiene MCP tool

- El método `client.getProfile()` (client.ts:586) está implementado pero no hay tool en definitions.ts ni handler en handlers.ts.

---

## 2. Endpoints Faltantes (Aplicables)

### 2.1 Conversations — filter

| Método | Ruta oficial | Estado |
|--------|-------------|--------|
| POST | `/api/v1/accounts/{id}/conversations/filter` | **FALTANTE** |

Simétrico con `filter_contacts`. Acepta payload de filtros con `attribute_key`, `filter_operator`, `values`, `query_operator`.

### 2.2 Contacts — merge

| Método | Ruta oficial | Estado |
|--------|-------------|--------|
| POST | `/api/v1/accounts/{id}/actions/contact_merge` | **FALTANTE** |

Body: `{ base_contact_id, mergee_contact_id }`. El contacto mergee se elimina permanentemente.

### 2.3 Inbox Members (agent assignments)

| Método | Ruta oficial | Descripción | Estado |
|--------|-------------|-------------|--------|
| GET | `/inbox_members/{inbox_id}` | Listar agentes en inbox | **FALTANTE** |
| POST | `/inbox_members` | Agregar agentes a inbox | **FALTANTE** |
| PATCH | `/inbox_members` | Actualizar agentes en inbox | **FALTANTE** |
| DELETE | `/inbox_members` | Eliminar agentes de inbox | **FALTANTE** |

**Nota:** El usuario solicitó verificar específicamente estos endpoints.

### 2.4 Team Members — add/remove

| Método | Ruta oficial | Descripción | Estado |
|--------|-------------|-------------|--------|
| POST | `/teams/{id}/team_members` | Agregar miembros al team | **FALTANTE** |
| DELETE | `/teams/{id}/team_members` | Eliminar miembros del team | **FALTANTE** |

Ya tenemos `get_team_members` (GET), pero falta agregar y eliminar.

### 2.5 Profile — MCP tool

| Método | Ruta oficial | Estado |
|--------|-------------|--------|
| GET | `/profile` | Client method existe, **FALTA MCP TOOL** |

---

## 3. Endpoints Excluidos (con justificación)

| Endpoint | Razón de exclusión |
|----------|-------------------|
| Agents CRUD (POST/PATCH/DELETE) | Operación admin — crear/modificar/eliminar agentes es riesgoso para automatización AI |
| Inboxes CRUD (POST/PATCH) | Config compleja de canal, no apta para MCP |
| Agent Bots CRUD | Feature especializada, baja demanda |
| Integrations/Hooks CRUD | Config de plataforma, no por conversación |
| Help Center / Portals | Dominio separado de gestión de contenido (roadmap) |
| Account Users CRUD | Super-admin, sensible a seguridad |
| Audit Logs | Solo Enterprise |
| CSAT Survey | Nicho, baja demanda |
| Contact Inboxes POST | Raramente necesario, asociación compleja |
| Contact Labels | Manejable via custom_attributes o conversation labels |
| Contactable Inboxes GET | Caso de uso muy específico |
| Conversation Reporting Events | Nicho, endpoint por conversación individual |

---

## 4. Verificaciones Específicas Solicitadas

### 4.1 Inbox Agent Assignments
**Resultado:** SÍ existen en docs oficiales como `/inbox_members`. Se implementarán 4 endpoints (GET, POST, PATCH, DELETE).

### 4.2 Reports — rutas y versiones
**Resultado:** Reports son **v2** (`/api/v2/accounts/{id}/reports`). Nuestro código actual apunta a v1. Se corregirá.

### 4.3 Messages — attachments vía multipart
**Resultado:** La API oficial soporta `multipart/form-data` para enviar attachments (`attachments[]` field). Sin embargo, esto requiere file I/O y upload de archivos binarios, lo cual NO es práctico para un MCP tool (los LLMs no generan archivos binarios). Se documenta como limitación conocida.

---

## 5. Resumen de Acciones

| Acción | Tipo | Detalle |
|--------|------|---------|
| Fix reports v2 | CORRECCIÓN | Agregar `forAccountV2()`, actualizar `getAccountReport` y `getReportSummary` |
| Fix update_contact | CORRECCIÓN | Cambiar `http.put()` → `http.patch()` |
| Expose get_profile | CORRECCIÓN | Agregar tool + handler para `getProfile()` existente |
| filter_conversations | NUEVO | POST /conversations/filter |
| merge_contacts | NUEVO | POST /actions/contact_merge |
| list_inbox_agents | NUEVO | GET /inbox_members/{inbox_id} |
| add_inbox_agents | NUEVO | POST /inbox_members |
| update_inbox_agents | NUEVO | PATCH /inbox_members |
| remove_inbox_agents | NUEVO | DELETE /inbox_members |
| add_team_members | NUEVO | POST /teams/{id}/team_members |
| remove_team_members | NUEVO | DELETE /teams/{id}/team_members |

**Tools antes:** 59
**Tools después (estimado):** 68 (+9 nuevos)
**Correcciones:** 3 (reports v2, update_contact PATCH, profile tool)
