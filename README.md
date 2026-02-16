# tvplus-mcp-chatwoot

MCP (Model Context Protocol) server for [Chatwoot](https://www.chatwoot.com/) — manage conversations, contacts, messages, agents, teams, and more through AI tools.

## Features

- **28 tools** covering Chatwoot's Application API
- **Dual transport**: STDIO (Claude Desktop, Claude Code) and HTTP/SSE (remote access)
- **Docker ready**: Multi-stage build with health checks
- **Session management**: Multi-session HTTP with automatic cleanup

### Available Tools

| Category | Tools |
|----------|-------|
| **Health** | `chatwoot_health` |
| **Contacts** | `list_contacts`, `get_contact`, `create_contact`, `update_contact`, `search_contacts`, `get_contact_conversations` |
| **Conversations** | `list_conversations`, `get_conversation`, `create_conversation`, `update_conversation_status`, `assign_conversation`, `add_labels_to_conversation`, `set_conversation_priority` |
| **Messages** | `send_message`, `list_messages` |
| **Agents** | `list_agents` |
| **Teams** | `list_teams`, `get_team_members` |
| **Inboxes** | `list_inboxes` |
| **Labels** | `list_labels`, `create_label` |
| **Canned Responses** | `list_canned_responses`, `create_canned_response` |
| **Reports** | `get_account_report` |
| **Webhooks** | `list_webhooks` |
| **Custom Attributes** | `list_custom_attributes` |

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

## Claude Code Configuration

Add to your project's `.mcp.json` or `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "chatwoot": {
      "type": "stdio",
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

## HTTP Mode (Remote Server)

For remote deployment or multi-client access:

```bash
# Start server
MCP_MODE=http PORT=3000 AUTH_TOKEN=your_secret node dist/index.js

# Health check
curl http://localhost:3000/health

# MCP call
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer your_secret" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

### Remote MCP Config

```json
{
  "mcpServers": {
    "chatwoot": {
      "type": "streamable-http",
      "url": "https://your-server.com/mcp",
      "headers": {
        "Authorization": "Bearer your_secret"
      }
    }
  }
}
```

## Docker

```bash
# Build
docker build -t tvplus-mcp-chatwoot .

# Run
docker run -p 3000:3000 \
  -e CHATWOOT_BASE_URL=https://your-chatwoot.com \
  -e CHATWOOT_ACCOUNT_ID=1 \
  -e CHATWOOT_API_TOKEN=your_token \
  -e AUTH_TOKEN=your_secret \
  tvplus-mcp-chatwoot
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CHATWOOT_BASE_URL` | Yes | — | Chatwoot instance URL |
| `CHATWOOT_ACCOUNT_ID` | Yes | — | Chatwoot account ID |
| `CHATWOOT_API_TOKEN` | Yes | — | API access token |
| `MCP_MODE` | No | `stdio` | Transport mode: `stdio` or `http` |
| `PORT` | No | `3000` | HTTP server port |
| `AUTH_TOKEN` | No | — | Bearer token for HTTP mode |
| `LOG_LEVEL` | No | `info` | Log level: `debug`, `info`, `warn`, `error` |

## Architecture

```
src/
├── index.ts              # Entry point (STDIO/HTTP mode selection)
├── server.ts             # MCP Server (STDIO transport)
├── http-server.ts        # HTTP/SSE server with session management
├── api/
│   ├── client.ts         # Chatwoot API client (axios)
│   └── types.ts          # TypeScript interfaces
├── tools/
│   ├── definitions.ts    # Tool schemas (28 tools)
│   └── handlers.ts       # Tool execution handlers
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

# Build
npm run build
```

## Roadmap

- [ ] Platform API support (super admin operations)
- [ ] Public API support (widget/external integrations)
- [ ] Webhook trigger events as MCP notifications
- [ ] File attachment support in messages
- [ ] Conversation filter tool with advanced queries
- [ ] Bulk operations (assign, label, status)
- [ ] CSAT survey data access
- [ ] Help Center (articles, portals) management

## License

MIT
