# Chatwoot API Coverage — Audit #2

Date: 2026-02-16
Source of truth: developers.chatwoot.com/llms.txt + individual endpoint docs

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Tools | 68 | 81 |
| Tests | 70 | 94 |
| Version | 0.4.0 | 0.5.0 |

## Methodology

1. Fetched complete endpoint index from `developers.chatwoot.com/llms.txt`
2. Cross-referenced every URL against implemented tools
3. Fetched individual endpoint docs for each candidate to verify: HTTP method, path, API version (v1/v2), API type (Application vs Client)
4. Applied criteria: GET endpoints = always implement; POST/PATCH/DELETE = implement if not super-admin/security-sensitive

## New Endpoints Implemented (13)

### Contact Labels (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/contacts/{id}/labels` | GET | `get_contact_labels` | Read-only, safe |
| `/contacts/{id}/labels` | POST | `add_labels_to_contact` | Sets label array on contact |

### Conversation Sub-resources (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/conversations/{id}/custom_attributes` | POST | `set_conversation_custom_attributes` | Tag conversations with metadata |

### Custom Attributes (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/custom_attribute_definitions/{id}` | GET | `get_custom_attribute` | Get single attribute definition by ID |

### Integrations (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/integrations/apps` | GET | `list_integrations` | Read-only, lists available apps |

### Inboxes (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/inboxes/{id}/agent_bot` | GET | `get_inbox_agent_bot` | Read-only, shows associated bot |

### Contacts (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/contacts/{id}/contactable_inboxes` | GET | `get_contactable_inboxes` | Read-only, available channels |

### Teams (v1)

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/teams/{id}/team_members` | PATCH | `update_team_members` | Replace member list |

### Reports v2 — Summary Reports

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/api/v2/.../summary_reports/{entity}` | GET | `get_conversation_statistics` | entity: agent, team, inbox, channel |
| `/api/v2/.../reports/conversations` | GET | `get_conversation_metrics` | type: account or agent |

### Reports v2 — Analytics

| Endpoint | Method | MCP Tool | Notes |
|----------|--------|----------|-------|
| `/api/v2/.../reports/first_response_time_distribution` | GET | `get_first_response_time_report` | Distribution by channel |
| `/api/v2/.../reports/inbox_label_matrix` | GET | `get_inbox_label_matrix_report` | Cross-reference inboxes × labels |
| `/api/v2/.../reports/outgoing_messages_count` | GET | `get_outgoing_messages_report` | Group by agent/team/inbox/label |

## Endpoints Confirmed as Client API (NOT Application API)

These endpoints appear in the docs but use `public/api/v1/inboxes/{inbox_identifier}/contacts/{contact_identifier}/...` path pattern — they are Client API, not Application API.

| Endpoint | Reason for Exclusion |
|----------|---------------------|
| Toggle Typing Status (`/public/api/v1/.../toggle_typing`) | Client API — requires inbox_identifier + contact_identifier |
| Update Last Seen (`/public/api/v1/.../update_last_seen`) | Client API — requires inbox_identifier + contact_identifier |
| Update Message (`/public/api/v1/.../messages/{id}`) | Client API — for bot responses with submitted_values |

## Still-Excluded Endpoints (with reasons)

| Endpoint | Method | Reason | Docs |
|----------|--------|--------|------|
| Agents CRUD | POST/PATCH/DELETE | Admin — risky for AI automation | [docs](https://developers.chatwoot.com/api-reference/agents/) |
| Inboxes Create/Update | POST/PATCH | Complex channel-specific config | [docs](https://developers.chatwoot.com/api-reference/inboxes/create-an-inbox.md) |
| Agent Bots CRUD | POST/PATCH/DELETE | Specialized feature, low demand | [docs](https://developers.chatwoot.com/api-reference/inboxes/add-or-remove-agent-bot.md) |
| Help Center / Portals | All | Separate content domain (roadmap) | — |
| Account Users CRUD | All | Super-admin, security-sensitive | — |
| Integration Hooks CRUD | POST/PATCH/DELETE | Platform-level config modifications | [docs](https://developers.chatwoot.com/api-reference/integrations/create-an-integration-hook.md) |
| Contact Inboxes POST | POST | Rarely needed, complex association | [docs](https://developers.chatwoot.com/api-reference/contacts/create-contact-inbox.md) |
| Audit Logs | GET | Enterprise only | — |
| CSAT Survey | GET | Niche, low demand | — |
| Account Reporting Events | GET | Admin-only (`/reporting_events`) | [docs](https://developers.chatwoot.com/api-reference/reports/account-reporting-events.md) |
| Conversation Reporting Events | GET | Per-conversation niche | [docs](https://developers.chatwoot.com/api-reference/conversations/conversation-reporting-events.md) |

## Coverage Gap Analysis

After this audit, the only remaining Application API v1/v2 endpoints NOT covered are:
1. **Admin-restricted endpoints** (agent CRUD, inbox CRUD, agent bots CRUD, integration hooks CRUD)
2. **Enterprise-only endpoints** (audit logs)
3. **Niche endpoints** (CSAT, reporting events, contact inboxes create)
4. **Content management** (Help Center/Portals — roadmap)

The MCP server now covers **all safe, generally-useful Application API endpoints** for Chatwoot v1/v2.

## Build Verification

```
npm run build → ✅ Clean (0 errors)
npm test     → ✅ 94 tests passing (3 test files)
```
