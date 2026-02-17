# Enterprise & Niche Endpoints

## Overview

The Enterprise bucket provides access to endpoints that are either Enterprise-only features (audit logs) or niche admin-level endpoints (reporting events, account-scoped agent bots).

## Enable Flag

```env
MCP_ENABLE_ENTERPRISE=true
```

Disabled by default. These tools use the standard Application API token (`CHATWOOT_API_TOKEN`).

## Tools (8)

### Audit Logs (Enterprise-only)

| Tool | Method | Description |
|------|--------|-------------|
| `enterprise_list_audit_logs` | GET | List audit log entries (paginated). Requires `audit_logs` feature enabled on the Chatwoot instance. Returns 403 if not enterprise or feature disabled. |

Parameters: `page` (optional, default: 1), `account_id` (optional)

### Reporting Events (Admin-only)

| Tool | Method | Description |
|------|--------|-------------|
| `enterprise_get_account_reporting_events` | GET | Get raw reporting events (first_response, resolution times). Admin-only. |
| `enterprise_get_conversation_reporting_events` | GET | Get reporting events for a specific conversation. |

Parameters for account events: `page`, `since` (Unix timestamp), `until` (Unix timestamp), `inbox_id`, `user_id`, `name` (event type filter)

### Account Agent Bots

These are account-scoped bots (not global platform bots):

| Tool | Method | Description |
|------|--------|-------------|
| `enterprise_list_agent_bots` | GET | List all agent bots in the account |
| `enterprise_get_agent_bot` | GET | Get bot details by ID |
| `enterprise_create_agent_bot` | POST | Create a new account-scoped bot |
| `enterprise_update_agent_bot` | PATCH | Update an existing bot |
| `enterprise_delete_agent_bot` | DELETE | Delete a bot |

Bot parameters: `name`, `description`, `outgoing_url` (webhook), `avatar_url`, `bot_type` (0=webhook), `bot_config`

## Safe Mode

When `MCP_SAFE_MODE=true`, the following enterprise tools are blocked:

- `enterprise_create_agent_bot`
- `enterprise_update_agent_bot`
- `enterprise_delete_agent_bot`

Read-only tools (audit logs, reporting events, list/get bots) are always allowed.

## Differences from Platform Agent Bots

| Aspect | Enterprise (Account Bots) | Platform (Global Bots) |
|--------|--------------------------|----------------------|
| Scope | Single account | All accounts |
| API Path | `/api/v1/accounts/{id}/agent_bots` | `/platform/api/v1/agent_bots` |
| Auth | Application API token | Platform API token |
| Tool Prefix | `enterprise_*` | `platform_*` |
| Enable Flag | `MCP_ENABLE_ENTERPRISE` | `MCP_ENABLE_PLATFORM_API` |
