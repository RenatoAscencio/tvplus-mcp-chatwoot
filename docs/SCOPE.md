# tvplus-mcp-chatwoot — Scope (v0.6.0)

## What This Project Covers

### API Coverage (5 Buckets, 133 Tools)

| Bucket | Tools | Enable Flag | Auth | Safe Mode |
|--------|------:|-------------|------|-----------|
| **Core** | 81 | Always on | `CHATWOOT_API_TOKEN` | `MCP_SAFE_MODE` (14 blocked) |
| **Public** | 12 | `MCP_ENABLE_PUBLIC_API=true` | `inbox_identifier` (no token) | N/A |
| **Platform** | 17 | `MCP_ENABLE_PLATFORM_API=true` | `CHATWOOT_PLATFORM_API_TOKEN` | `MCP_PLATFORM_SAFE_MODE` (11 blocked) |
| **Enterprise** | 8 | `MCP_ENABLE_ENTERPRISE=true` | `CHATWOOT_API_TOKEN` | `MCP_SAFE_MODE` (3 blocked) |
| **Help Center** | 15 | `MCP_ENABLE_HELP_CENTER=true` | `CHATWOOT_API_TOKEN` | `MCP_SAFE_MODE` (3 blocked) |

### Transport
- **STDIO** — For Claude Desktop, Claude Code, and other MCP-compatible clients
- **HTTP/SSE** — Streamable HTTP transport for remote access and multi-client scenarios

### Capabilities
- 133 MCP tools across 5 API buckets
- Multi-account support (optional `account_id` on every Application API tool)
- Dual safe mode: Application (`MCP_SAFE_MODE`) + Platform (`MCP_PLATFORM_SAFE_MODE`)
- Session management for HTTP mode with automatic cleanup

## Bucket Details

### Core (81 tools — 21 categories)

| # | Category | Tools | Read | Write | Delete |
|---|----------|-------|------|-------|--------|
| 1 | Health | 1 | 1 | — | — |
| 2 | Contacts | 10 | 5 | 3 | 2 |
| 3 | Contact Labels | 2 | 1 | 1 | — |
| 4 | Conversations | 11 | 4 | 6 | — |
| 5 | Messages | 3 | 1 | 1 | 1 |
| 6 | Agents | 2 | 2 | — | — |
| 7 | Teams | 9 | 3 | 4 | 2 |
| 8 | Inboxes | 3 | 3 | — | — |
| 9 | Inbox Members | 4 | 1 | 2 | 1 |
| 10 | Labels | 4 | 1 | 2 | 1 |
| 11 | Canned Responses | 4 | 1 | 2 | 1 |
| 12 | Reports (v2) | 7 | 7 | — | — |
| 13 | Webhooks | 4 | 1 | 2 | 1 |
| 14 | Custom Attributes | 5 | 2 | 2 | 1 |
| 15 | Automation Rules | 5 | 2 | 2 | 1 |
| 16 | Custom Filters | 5 | 2 | 2 | 1 |
| 17 | Integrations | 1 | 1 | — | — |
| 18 | Profile | 1 | 1 | — | — |
| 19 | Conversation Custom Attrs | 1 | — | 1 | — |
| 20 | Inbox Agent Bot | 1 | 1 | — | — |
| 21 | Contactable Inboxes | 1 | 1 | — | — |

**Totals**: 81 tools (40 read, 27 write, 14 delete/destructive)

### Public (12 tools)
Widget/client-facing API. Auth via `inbox_identifier` + `contact_identifier`.

| Category | Tools |
|----------|-------|
| Contacts | `public_create_contact`, `public_get_contact`, `public_update_contact` |
| Conversations | `public_create_conversation`, `public_list_conversations`, `public_get_conversation`, `public_resolve_conversation`, `public_toggle_typing`, `public_update_last_seen` |
| Messages | `public_create_message`, `public_list_messages`, `public_update_message` |

### Platform (17 tools)
Super-admin operations. Separate `CHATWOOT_PLATFORM_API_TOKEN`.

| Category | Tools |
|----------|-------|
| Accounts | `platform_create_account`, `platform_get_account`, `platform_update_account`, `platform_delete_account` |
| Agent Bots | `platform_list_agent_bots`, `platform_create_agent_bot`, `platform_get_agent_bot`, `platform_update_agent_bot`, `platform_delete_agent_bot` |
| Users | `platform_create_user`, `platform_get_user`, `platform_update_user`, `platform_delete_user`, `platform_get_user_sso_link` |
| Account Users | `platform_list_account_users`, `platform_create_account_user`, `platform_delete_account_user` |

### Enterprise (8 tools)
Admin and Enterprise-only endpoints.

| Category | Tools |
|----------|-------|
| Audit Logs | `enterprise_list_audit_logs` |
| Reporting Events | `enterprise_get_account_reporting_events`, `enterprise_get_conversation_reporting_events` |
| Account Agent Bots | `enterprise_list_agent_bots`, `enterprise_get_agent_bot`, `enterprise_create_agent_bot`, `enterprise_update_agent_bot`, `enterprise_delete_agent_bot` |

### Help Center (15 tools)
Knowledge base management.

| Category | Tools |
|----------|-------|
| Portals | `helpcenter_list_portals`, `helpcenter_create_portal`, `helpcenter_get_portal`, `helpcenter_update_portal`, `helpcenter_delete_portal` |
| Articles | `helpcenter_list_articles`, `helpcenter_create_article`, `helpcenter_get_article`, `helpcenter_update_article`, `helpcenter_delete_article` |
| Categories | `helpcenter_list_categories`, `helpcenter_create_category`, `helpcenter_get_category`, `helpcenter_update_category`, `helpcenter_delete_category` |

## Safe Mode — Blocked Tools

### MCP_SAFE_MODE=true (20 tools)

**Core (14)**:
`delete_contact`, `delete_message`, `delete_team`, `delete_label`, `delete_canned_response`, `delete_webhook`, `delete_custom_attribute`, `delete_automation_rule`, `delete_custom_filter`, `remove_inbox_agents`, `remove_team_members`, `merge_contacts`, `create_webhook`, `update_webhook`

**Enterprise (3)**:
`enterprise_create_agent_bot`, `enterprise_update_agent_bot`, `enterprise_delete_agent_bot`

**Help Center (3)**:
`helpcenter_delete_portal`, `helpcenter_delete_article`, `helpcenter_delete_category`

### MCP_PLATFORM_SAFE_MODE=true (11 tools, default ON)

`platform_create_account`, `platform_update_account`, `platform_delete_account`, `platform_create_agent_bot`, `platform_update_agent_bot`, `platform_delete_agent_bot`, `platform_create_user`, `platform_update_user`, `platform_delete_user`, `platform_create_account_user`, `platform_delete_account_user`

## What This Project Does NOT Cover

### Not Supported
- **File attachments** — Messages with binary attachments require multipart upload, not practical for MCP
- **Real-time events** — Chatwoot WebSocket events are not exposed; use webhooks instead
- **Bulk operations** — No batch endpoints exist in Chatwoot's API

### Excluded Application API Endpoints

| Category | Endpoints | Reason |
|----------|-----------|--------|
| Agents CRUD | POST/PATCH/DELETE | Admin operation — risky for AI automation |
| Inboxes Create/Update | POST/PATCH | Complex channel-specific configuration |
| Integration Hooks CRUD | POST/PATCH/DELETE | Platform-level config modifications |
| Contact Inboxes Create | POST | Rarely needed, complex association |
| Account Users | All | Super-admin, security-sensitive |
| CSAT Survey | GET | Niche, low demand |
| Inbox Agent Bot Set | POST | Modifies inbox automation config |

## Conventions

### Tool Naming
- Core tools: `verb_noun` (e.g., `list_contacts`, `get_team`)
- Bucket tools: `{bucket}_verb_noun` (e.g., `public_create_contact`, `platform_get_account`)
- Valid bucket prefixes: `public_`, `platform_`, `enterprise_`, `helpcenter_`
- All names use snake_case

### ID Parameters
- All entity IDs use `*_id` suffix: `contact_id`, `conversation_id`, `team_id`, `inbox_id`, etc.
- `account_id` is always optional on Application API tools (defaults to `CHATWOOT_ACCOUNT_ID`)

### HTTP Methods
- `list_*` / `get_*` / `search_*` → GET
- `create_*` / `send_*` / `add_*` / `assign_*` / `merge_*` / `set_*` / `filter_*` → POST
- `update_*` → PATCH
- `delete_*` / `remove_*` → DELETE

### API Versions
- All tools use API v1 except Reports (7 tools) which use API v2
- Public API: `/public/api/v1/inboxes/{inbox_identifier}/...`
- Platform API: `/platform/api/v1/...`

### Error Handling
- All API errors return `isError: true` with status code and message
- Unknown tools return `isError: true` with `Unknown tool: {name}`
- Safe mode blocked tools return `isError: true` with tool name, flag, and how to unblock
