# Expansion Plan — v0.6.0

## Baseline
- v0.5.0: 81 Application API tools, 101 tests, MCP_SAFE_MODE
- Build: clean, all tests passing

## Bucket A — Client/Public API (12 tools)

**Prefix**: `public_*`
**Enable flag**: `MCP_ENABLE_PUBLIC_API=true` (default: false)
**Auth**: `inbox_identifier` (path) + `contact_identifier` (path/body) — NO api_access_token
**Base path**: `/public/api/v1/inboxes/{inbox_identifier}/...`

| # | Tool | Method | Path |
|---|------|--------|------|
| 1 | `public_create_contact` | POST | `/contacts` |
| 2 | `public_get_contact` | GET | `/contacts/{contact_identifier}` |
| 3 | `public_update_contact` | PATCH | `/contacts/{contact_identifier}` |
| 4 | `public_create_conversation` | POST | `/conversations` |
| 5 | `public_list_conversations` | GET | `/conversations` |
| 6 | `public_get_conversation` | GET | `/conversations/{conversation_id}` |
| 7 | `public_resolve_conversation` | POST | `/conversations/{conversation_id}/toggle_status` |
| 8 | `public_toggle_typing` | POST | `/conversations/{conversation_id}/toggle_typing` |
| 9 | `public_update_last_seen` | POST | `/conversations/{conversation_id}/update_last_seen` |
| 10 | `public_create_message` | POST | `/conversations/{conversation_id}/messages` |
| 11 | `public_list_messages` | GET | `/conversations/{conversation_id}/messages` |
| 12 | `public_update_message` | PATCH | `/conversations/{conversation_id}/messages/{message_id}` |

## Bucket B — Platform API (17 tools)

**Prefix**: `platform_*`
**Enable flag**: `MCP_ENABLE_PLATFORM_API=true` (default: false)
**Auth**: `api_access_token` header (separate `CHATWOOT_PLATFORM_API_TOKEN`)
**Safe mode**: `MCP_PLATFORM_SAFE_MODE=true` (default: true) blocks writes/deletes
**Base path**: `/platform/api/v1/...`

| # | Tool | Method | Path |
|---|------|--------|------|
| 1 | `platform_create_account` | POST | `/accounts` |
| 2 | `platform_get_account` | GET | `/accounts/{account_id}` |
| 3 | `platform_update_account` | PATCH | `/accounts/{account_id}` |
| 4 | `platform_delete_account` | DELETE | `/accounts/{account_id}` |
| 5 | `platform_list_agent_bots` | GET | `/agent_bots` |
| 6 | `platform_create_agent_bot` | POST | `/agent_bots` |
| 7 | `platform_get_agent_bot` | GET | `/agent_bots/{id}` |
| 8 | `platform_update_agent_bot` | PATCH | `/agent_bots/{id}` |
| 9 | `platform_delete_agent_bot` | DELETE | `/agent_bots/{id}` |
| 10 | `platform_create_user` | POST | `/users` |
| 11 | `platform_get_user` | GET | `/users/{id}` |
| 12 | `platform_update_user` | PATCH | `/users/{id}` |
| 13 | `platform_delete_user` | DELETE | `/users/{id}` |
| 14 | `platform_get_user_sso_link` | GET | `/users/{id}/login` |
| 15 | `platform_list_account_users` | GET | `/accounts/{account_id}/account_users` |
| 16 | `platform_create_account_user` | POST | `/accounts/{account_id}/account_users` |
| 17 | `platform_delete_account_user` | DELETE | `/accounts/{account_id}/account_users` |

## Bucket C — Enterprise/Niche (8 tools)

**Prefix**: `enterprise_*`
**Enable flag**: `MCP_ENABLE_ENTERPRISE=true` (default: false)
**Auth**: Application API `api_access_token` (same as existing tools)
**Base path**: `/api/v1/accounts/{id}/...`

| # | Tool | Method | Path |
|---|------|--------|------|
| 1 | `enterprise_list_audit_logs` | GET | `/audit_logs` |
| 2 | `enterprise_get_account_reporting_events` | GET | `/reporting_events` |
| 3 | `enterprise_get_conversation_reporting_events` | GET | `/conversations/{id}/reporting_events` |
| 4 | `enterprise_list_agent_bots` | GET | `/agent_bots` |
| 5 | `enterprise_get_agent_bot` | GET | `/agent_bots/{id}` |
| 6 | `enterprise_create_agent_bot` | POST | `/agent_bots` |
| 7 | `enterprise_update_agent_bot` | PATCH | `/agent_bots/{id}` |
| 8 | `enterprise_delete_agent_bot` | DELETE | `/agent_bots/{id}` |

## Bucket D — Help Center (15 tools)

**Prefix**: `helpcenter_*`
**Enable flag**: `MCP_ENABLE_HELP_CENTER=true` (default: false)
**Auth**: Application API `api_access_token` (same as existing tools)
**Base path**: `/api/v1/accounts/{id}/portals/...`

| # | Tool | Method | Path |
|---|------|--------|------|
| 1 | `helpcenter_list_portals` | GET | `/portals` |
| 2 | `helpcenter_create_portal` | POST | `/portals` |
| 3 | `helpcenter_get_portal` | GET | `/portals/{portal_id}` |
| 4 | `helpcenter_update_portal` | PATCH | `/portals/{portal_id}` |
| 5 | `helpcenter_delete_portal` | DELETE | `/portals/{portal_id}` |
| 6 | `helpcenter_list_articles` | GET | `/portals/{portal_id}/articles` |
| 7 | `helpcenter_create_article` | POST | `/portals/{portal_id}/articles` |
| 8 | `helpcenter_get_article` | GET | `/portals/{portal_id}/articles/{article_id}` |
| 9 | `helpcenter_update_article` | PATCH | `/portals/{portal_id}/articles/{article_id}` |
| 10 | `helpcenter_delete_article` | DELETE | `/portals/{portal_id}/articles/{article_id}` |
| 11 | `helpcenter_list_categories` | GET | `/portals/{portal_id}/categories` |
| 12 | `helpcenter_create_category` | POST | `/portals/{portal_id}/categories` |
| 13 | `helpcenter_get_category` | GET | `/portals/{portal_id}/categories/{category_id}` |
| 14 | `helpcenter_update_category` | PATCH | `/portals/{portal_id}/categories/{category_id}` |
| 15 | `helpcenter_delete_category` | DELETE | `/portals/{portal_id}/categories/{category_id}` |

Note: portal_id uses slug (string), not numeric ID.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_ENABLE_PUBLIC_API` | `false` | Enable Client/Public API tools |
| `MCP_ENABLE_PLATFORM_API` | `false` | Enable Platform API tools |
| `MCP_ENABLE_ENTERPRISE` | `false` | Enable Enterprise/Niche tools |
| `MCP_ENABLE_HELP_CENTER` | `false` | Enable Help Center tools |
| `CHATWOOT_PLATFORM_API_TOKEN` | — | Platform App API token (required if Platform bucket enabled) |
| `MCP_PLATFORM_SAFE_MODE` | `true` | Block Platform API writes/deletes |

## Total After Expansion
- Application API: 81 tools (unchanged)
- Public API: 12 tools
- Platform API: 17 tools
- Enterprise: 8 tools
- Help Center: 15 tools
- **Grand total: 133 tools**
