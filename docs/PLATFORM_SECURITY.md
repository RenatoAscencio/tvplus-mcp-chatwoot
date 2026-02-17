# Platform API — Security Guide

## Overview

The Platform API provides super-admin level operations: creating/deleting accounts, managing users across the entire Chatwoot instance, and managing global agent bots. These operations have high blast radius and require careful access control.

## Authentication

The Platform API uses a **separate token** (`CHATWOOT_PLATFORM_API_TOKEN`) that is distinct from the Application API token (`CHATWOOT_API_TOKEN`).

To obtain a Platform API token:
1. Log into Chatwoot as a super admin
2. Navigate to Super Admin → Platform Apps
3. Create a new Platform App
4. Copy the generated `access_token`

## Enable Flag

The Platform bucket is **disabled by default**. To enable:

```env
MCP_ENABLE_PLATFORM_API=true
CHATWOOT_PLATFORM_API_TOKEN=your-platform-token
```

If `MCP_ENABLE_PLATFORM_API=true` but `CHATWOOT_PLATFORM_API_TOKEN` is not set, the bucket remains disabled with a warning.

## Platform Safe Mode

By default, `MCP_PLATFORM_SAFE_MODE=true` which **blocks all write and delete operations** on the Platform API, allowing only read operations.

### Blocked operations (11 tools)

| Tool | Operation |
|------|-----------|
| `platform_create_account` | Creates a new Chatwoot account |
| `platform_update_account` | Modifies account settings |
| `platform_delete_account` | **Permanently deletes** an account and all data |
| `platform_create_agent_bot` | Creates a global agent bot |
| `platform_update_agent_bot` | Modifies a global agent bot |
| `platform_delete_agent_bot` | Removes a global agent bot |
| `platform_create_user` | Creates a new user |
| `platform_update_user` | Modifies user settings |
| `platform_delete_user` | **Permanently deletes** a user |
| `platform_create_account_user` | Assigns a user to an account |
| `platform_delete_account_user` | Removes a user from an account |

### Allowed operations (6 tools)

| Tool | Operation |
|------|-----------|
| `platform_get_account` | Read account details |
| `platform_list_agent_bots` | List all global agent bots |
| `platform_get_agent_bot` | Read agent bot details |
| `platform_get_user` | Read user details |
| `platform_get_user_sso_link` | Get SSO login link |
| `platform_list_account_users` | List users in an account |

### Disabling Safe Mode

To enable full write access:

```env
MCP_PLATFORM_SAFE_MODE=false
```

**Warning**: This allows AI agents to create/delete accounts, users, and bots. Only disable in controlled environments.

## Risk Assessment

| Risk | Tool | Consequence |
|------|------|-------------|
| CRITICAL | `platform_delete_account` | Permanently deletes account + all conversations, contacts, data |
| CRITICAL | `platform_delete_user` | Permanently removes user from all accounts |
| HIGH | `platform_create_account` | Creates new accounts consuming resources |
| HIGH | `platform_create_user` | Creates users with potential access |
| MEDIUM | `platform_update_account` | Can change account name/locale |
| MEDIUM | `platform_create_account_user` | Grants account access to users |
| MEDIUM | `platform_delete_account_user` | Revokes account access |
| LOW | `platform_create_agent_bot` | Creates webhook-receiving bot |

## Deployment Examples

### Read-only Platform access (recommended)

```json
{
  "mcpServers": {
    "chatwoot": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "CHATWOOT_BASE_URL": "https://your-chatwoot.com",
        "CHATWOOT_API_TOKEN": "app-token",
        "MCP_ENABLE_PLATFORM_API": "true",
        "CHATWOOT_PLATFORM_API_TOKEN": "platform-token"
      }
    }
  }
}
```

`MCP_PLATFORM_SAFE_MODE` defaults to `true` — only read operations are allowed.

### HTTP mode with AUTH_TOKEN + Platform write

```bash
MCP_MODE=http \
AUTH_TOKEN=strong-random-bearer-token \
CHATWOOT_BASE_URL=https://your-chatwoot.com \
CHATWOOT_API_TOKEN=app-token \
MCP_ENABLE_PLATFORM_API=true \
CHATWOOT_PLATFORM_API_TOKEN=platform-token \
MCP_PLATFORM_SAFE_MODE=false \
node dist/index.js
```

**Warning**: Only use `MCP_PLATFORM_SAFE_MODE=false` in controlled environments with `AUTH_TOKEN` protection.

## Recommendations

1. **Never expose** `CHATWOOT_PLATFORM_API_TOKEN` in client-side code or logs
2. **Keep** `MCP_PLATFORM_SAFE_MODE=true` unless you specifically need write operations
3. **Use HTTP mode** with `AUTH_TOKEN` when exposing Platform API remotely
4. **Audit** platform operations through Chatwoot's audit log (Enterprise feature)
5. **Rotate** the Platform API token periodically
