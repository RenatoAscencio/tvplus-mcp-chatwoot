# tvplus-mcp-chatwoot

MCP (Model Context Protocol) server for [Chatwoot](https://www.chatwoot.com/) — manage conversations, contacts, messages, agents, teams, and more through AI tools.

## Features

- **133 tools** covering Chatwoot's Application, Public, Platform, Enterprise, and Help Center APIs
- **Modular buckets**: Each API group is opt-in with environment flags
- **Multi-account**: All tools accept an optional `account_id` to target any account
- **Dual transport**: STDIO (Claude Desktop, Claude Code) and HTTP/SSE (remote access)
- **Docker ready**: Multi-stage build with health checks
- **Session management**: Multi-session HTTP with automatic cleanup
- **Safe mode**: Block destructive operations at both Application and Platform API levels
- **Tested**: Vitest + nock with 240 tests

### Buckets Overview

| Bucket | Tools | Enable Flag | Auth | Safe Mode |
|--------|------:|-------------|------|-----------|
| **Core** | 81 | Always on | `CHATWOOT_API_TOKEN` | `MCP_SAFE_MODE` (14 blocked) |
| **Public** | 12 | `MCP_ENABLE_PUBLIC_API=true` | `inbox_identifier` | N/A |
| **Platform** | 17 | `MCP_ENABLE_PLATFORM_API=true` | `CHATWOOT_PLATFORM_API_TOKEN` | `MCP_PLATFORM_SAFE_MODE` (11 blocked) |
| **Enterprise** | 8 | `MCP_ENABLE_ENTERPRISE=true` | `CHATWOOT_API_TOKEN` | `MCP_SAFE_MODE` (3 blocked) |
| **Help Center** | 15 | `MCP_ENABLE_HELP_CENTER=true` | `CHATWOOT_API_TOKEN` | `MCP_SAFE_MODE` (3 blocked) |

### Core Tools (81 — always enabled)

| Category | Tools |
|----------|-------|
| **Health** | `chatwoot_health` |
| **Contacts** | `list_contacts`, `get_contact`, `create_contact`, `update_contact`, `delete_contact`, `search_contacts`, `filter_contacts`, `get_contact_conversations`, `merge_contacts`, `get_contactable_inboxes` |
| **Contact Labels** | `get_contact_labels`, `add_labels_to_contact` |
| **Conversations** | `list_conversations`, `get_conversation`, `create_conversation`, `update_conversation_status`, `assign_conversation`, `add_labels_to_conversation`, `get_conversation_labels`, `set_conversation_priority`, `get_conversation_counts`, `filter_conversations`, `set_conversation_custom_attributes` |
| **Messages** | `send_message`, `list_messages`, `delete_message` |
| **Agents** | `list_agents`, `get_agent` |
| **Teams** | `list_teams`, `get_team`, `get_team_members`, `create_team`, `update_team`, `delete_team`, `add_team_members`, `update_team_members`, `remove_team_members` |
| **Inboxes** | `list_inboxes`, `get_inbox`, `get_inbox_agent_bot` |
| **Inbox Members** | `list_inbox_agents`, `add_inbox_agents`, `update_inbox_agents`, `remove_inbox_agents` |
| **Labels** | `list_labels`, `create_label`, `update_label`, `delete_label` |
| **Canned Responses** | `list_canned_responses`, `create_canned_response`, `update_canned_response`, `delete_canned_response` |
| **Reports** (v2) | `get_account_report`, `get_report_summary`, `get_conversation_statistics`, `get_conversation_metrics`, `get_first_response_time_report`, `get_inbox_label_matrix_report`, `get_outgoing_messages_report` |
| **Webhooks** | `list_webhooks`, `create_webhook`, `update_webhook`, `delete_webhook` |
| **Custom Attributes** | `list_custom_attributes`, `get_custom_attribute`, `create_custom_attribute`, `update_custom_attribute`, `delete_custom_attribute` |
| **Automation Rules** | `list_automation_rules`, `get_automation_rule`, `create_automation_rule`, `update_automation_rule`, `delete_automation_rule` |
| **Custom Filters** | `list_custom_filters`, `get_custom_filter`, `create_custom_filter`, `update_custom_filter`, `delete_custom_filter` |
| **Integrations** | `list_integrations` |
| **Profile** | `get_profile` |

### Public API Tools (12 — `MCP_ENABLE_PUBLIC_API=true`)

Widget/client-facing API using `inbox_identifier` + `contact_identifier` for auth.

| Category | Tools |
|----------|-------|
| **Contacts** | `public_create_contact`, `public_get_contact`, `public_update_contact` |
| **Conversations** | `public_create_conversation`, `public_list_conversations`, `public_get_conversation`, `public_resolve_conversation`, `public_toggle_typing`, `public_update_last_seen` |
| **Messages** | `public_create_message`, `public_list_messages`, `public_update_message` |

### Platform API Tools (17 — `MCP_ENABLE_PLATFORM_API=true`)

Super-admin operations. Requires separate `CHATWOOT_PLATFORM_API_TOKEN`. See [docs/PLATFORM_SECURITY.md](docs/PLATFORM_SECURITY.md).

| Category | Tools |
|----------|-------|
| **Accounts** | `platform_create_account`, `platform_get_account`, `platform_update_account`, `platform_delete_account` |
| **Agent Bots** | `platform_list_agent_bots`, `platform_create_agent_bot`, `platform_get_agent_bot`, `platform_update_agent_bot`, `platform_delete_agent_bot` |
| **Users** | `platform_create_user`, `platform_get_user`, `platform_update_user`, `platform_delete_user`, `platform_get_user_sso_link` |
| **Account Users** | `platform_list_account_users`, `platform_create_account_user`, `platform_delete_account_user` |

### Enterprise Tools (8 — `MCP_ENABLE_ENTERPRISE=true`)

Admin and Enterprise-only endpoints. See [docs/ENTERPRISE.md](docs/ENTERPRISE.md).

| Category | Tools |
|----------|-------|
| **Audit Logs** | `enterprise_list_audit_logs` |
| **Reporting Events** | `enterprise_get_account_reporting_events`, `enterprise_get_conversation_reporting_events` |
| **Account Agent Bots** | `enterprise_list_agent_bots`, `enterprise_get_agent_bot`, `enterprise_create_agent_bot`, `enterprise_update_agent_bot`, `enterprise_delete_agent_bot` |

### Help Center Tools (15 — `MCP_ENABLE_HELP_CENTER=true`)

Knowledge base management for portals, articles, and categories.

| Category | Tools |
|----------|-------|
| **Portals** | `helpcenter_list_portals`, `helpcenter_create_portal`, `helpcenter_get_portal`, `helpcenter_update_portal`, `helpcenter_delete_portal` |
| **Articles** | `helpcenter_list_articles`, `helpcenter_create_article`, `helpcenter_get_article`, `helpcenter_update_article`, `helpcenter_delete_article` |
| **Categories** | `helpcenter_list_categories`, `helpcenter_create_category`, `helpcenter_get_category`, `helpcenter_update_category`, `helpcenter_delete_category` |

## Quick Start

### 1. Install

```bash
git clone https://github.com/RenatoAscencio/tvplus-mcp-chatwoot.git
cd tvplus-mcp-chatwoot
npm install
npm run build
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your Chatwoot credentials:
#   CHATWOOT_BASE_URL=https://your-chatwoot.com
#   CHATWOOT_ACCOUNT_ID=1
#   CHATWOOT_API_TOKEN=your_token
```

**Where to find your API token**: In Chatwoot, go to Profile Settings → Access Token.

### 3. Run

**STDIO mode** (for Claude Desktop / Claude Code):
```bash
npm start
```

**HTTP mode** (for remote access):
```bash
MCP_MODE=http AUTH_TOKEN=your_secret npm start
```

## Claude Desktop Configuration

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "chatwoot": {
      "command": "node",
      "args": ["/path/to/tvplus-mcp-chatwoot/dist/index.js"],
      "env": {
        "CHATWOOT_BASE_URL": "https://your-chatwoot.com",
        "CHATWOOT_ACCOUNT_ID": "1",
        "CHATWOOT_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

### Enabling Optional Buckets

```json
{
  "mcpServers": {
    "chatwoot": {
      "command": "node",
      "args": ["/path/to/tvplus-mcp-chatwoot/dist/index.js"],
      "env": {
        "CHATWOOT_BASE_URL": "https://your-chatwoot.com",
        "CHATWOOT_ACCOUNT_ID": "1",
        "CHATWOOT_API_TOKEN": "your_api_token",
        "MCP_ENABLE_PUBLIC_API": "true",
        "MCP_ENABLE_ENTERPRISE": "true",
        "MCP_ENABLE_HELP_CENTER": "true",
        "MCP_ENABLE_PLATFORM_API": "true",
        "CHATWOOT_PLATFORM_API_TOKEN": "your_platform_token",
        "MCP_PLATFORM_SAFE_MODE": "false"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CHATWOOT_BASE_URL` | Yes | — | Chatwoot instance URL |
| `CHATWOOT_ACCOUNT_ID` | Yes | — | Default Chatwoot account ID |
| `CHATWOOT_API_TOKEN` | Yes | — | Application API access token |
| `MCP_MODE` | No | `stdio` | Transport mode: `stdio` or `http` |
| `PORT` | No | `3000` | HTTP server port |
| `AUTH_TOKEN` | No | — | Bearer token for HTTP mode |
| `LOG_LEVEL` | No | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `MCP_SAFE_MODE` | No | `false` | Block destructive Application API operations |
| `MCP_ENABLE_PUBLIC_API` | No | `false` | Enable Public/Client API tools (12) |
| `MCP_ENABLE_PLATFORM_API` | No | `false` | Enable Platform API tools (17) |
| `CHATWOOT_PLATFORM_API_TOKEN` | No | — | Platform App API token (required if Platform enabled) |
| `MCP_PLATFORM_SAFE_MODE` | No | `true` | Block Platform API writes/deletes |
| `MCP_ENABLE_ENTERPRISE` | No | `false` | Enable Enterprise/Niche tools (8) |
| `MCP_ENABLE_HELP_CENTER` | No | `false` | Enable Help Center tools (15) |

## Safety

### Application API Safe Mode

When `MCP_SAFE_MODE=true`, blocks 14 destructive core tools plus 6 Enterprise/Help Center destructive tools. See [docs/SCOPE.md](docs/SCOPE.md) for the full list.

### Platform API Safe Mode

When `MCP_PLATFORM_SAFE_MODE=true` (default), blocks all 11 write/delete Platform API tools. Only read operations are allowed. See [docs/PLATFORM_SECURITY.md](docs/PLATFORM_SECURITY.md) for details.

## Architecture

```
src/
├── index.ts              # Entry point (STDIO/HTTP mode selection)
├── server.ts             # MCP Server (STDIO transport)
├── http-server.ts        # HTTP/SSE server with session management
├── api/
│   ├── client.ts         # Application API client (81 + Enterprise + Help Center)
│   ├── public-client.ts  # Public/Client API client
│   ├── platform-client.ts # Platform API client
│   └── types.ts          # TypeScript interfaces
├── tools/
│   ├── definitions.ts    # Core tool schemas (81 tools)
│   ├── handlers.ts       # Core tool execution handlers
│   ├── public/           # Public API bucket
│   ├── platform/         # Platform API bucket
│   ├── enterprise/       # Enterprise/Niche bucket
│   └── helpcenter/       # Help Center bucket
└── utils/
    ├── config.ts         # Environment configuration
    └── logger.ts         # Structured logging
```

## Development

```bash
# Dev with hot reload
npm run dev

# Dev in HTTP mode
npm run dev:http

# Type check
npm run lint

# Run tests
npm test

# Build
npm run build
```

## Multi-Account Support

All Application API tools accept an optional `account_id` parameter. When omitted, uses the default `CHATWOOT_ACCOUNT_ID` from the environment.

## API Coverage

- [docs/API_COVERAGE.md](docs/API_COVERAGE.md) — Application API coverage matrix
- [docs/EXPANSION_PLAN.md](docs/EXPANSION_PLAN.md) — Full expansion plan (all 4 buckets)
- [docs/PLATFORM_SECURITY.md](docs/PLATFORM_SECURITY.md) — Platform API security guide
- [docs/ENTERPRISE.md](docs/ENTERPRISE.md) — Enterprise endpoints documentation

## License

MIT
