# CLAUDE.md — tvplus-mcp-chatwoot

## Project Overview

MCP (Model Context Protocol) server for Chatwoot. Exposes Chatwoot Application API v1 as MCP tools for AI agents.

- **Runtime**: Node.js >= 20, TypeScript ESM (`"type": "module"`)
- **Version**: see `package.json`
- **Transports**: STDIO (default) and HTTP/SSE

## Architecture

```
src/
├── index.ts              # Entry point — selects STDIO or HTTP mode
├── server.ts             # MCP Server with STDIO transport
├── http-server.ts        # Express 5 HTTP server with StreamableHTTP transport
├── api/
│   ├── client.ts         # ChatwootClient — axios wrapper, one method per API endpoint
│   └── types.ts          # TypeScript interfaces for Chatwoot entities
├── tools/
│   ├── definitions.ts    # MCP tool schemas (name + inputSchema per tool)
│   └── handlers.ts       # Tool dispatch — switch/case mapping tool name → client method
└── utils/
    ├── config.ts         # Environment config (dotenv)
    └── logger.ts         # Structured logger (debug/info/warn/error to stderr)
```

## Adding a New Tool (3-file pattern)

Every new MCP tool requires changes in exactly 3 files:

1. **`src/api/client.ts`** — Add method to `ChatwootClient`
   - Use `this.forAccount(accountId)` for multi-account support
   - Follow existing method signatures: `async methodName(params, accountId?: number)`
   - All HTTP calls go through the axios instance from `forAccount()`

2. **`src/tools/definitions.ts`** — Add tool schema to the `tools` array
   - Include `...accountIdProperty` in every tool's properties
   - Use clear `description` for each tool and each property
   - Mark required fields in `required` array
   - Naming: `verb_noun` (e.g., `list_contacts`, `create_label`, `delete_webhook`)

3. **`src/tools/handlers.ts`** — Add case in `dispatch()` switch
   - Use `acct(args)` to extract optional account_id
   - Return `jsonResult(data)` for data responses
   - Return `textResult(message)` for simple messages
   - Errors are caught by `handleToolCall()` wrapper → `errorResult()`

## Multi-Account

All tools accept optional `account_id`. When omitted, uses `CHATWOOT_ACCOUNT_ID` env var.
The `ChatwootClient.forAccount(accountId)` method creates a scoped axios instance for alternate accounts.

## Key Conventions

- **ESM imports**: Always use `.js` extension in imports (e.g., `'./server.js'`)
- **No default exports**: Use named exports
- **Error handling**: `ChatwootApiError` class in `client.ts` wraps API errors with statusCode + details
- **Logging**: Use `logger` from `utils/logger.ts`, logs to stderr (never stdout — stdout is for MCP STDIO transport)
- **Type safety**: Strict TypeScript. Prefer explicit types over `any`. Use `unknown` for untyped API responses.

## Commands

```bash
npm run dev          # Dev with hot reload (tsx)
npm run dev:http     # Dev in HTTP mode
npm run build        # TypeScript compile (tsc)
npm start            # Run compiled (STDIO mode)
npm run start:http   # Run compiled (HTTP mode)
npm run lint         # Type check (tsc --noEmit)
npm test             # Run tests (vitest)
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| CHATWOOT_BASE_URL | Yes | — | Chatwoot instance URL |
| CHATWOOT_ACCOUNT_ID | Yes | — | Default account ID |
| CHATWOOT_API_TOKEN | Yes | — | API access token |
| MCP_MODE | No | stdio | Transport: `stdio` or `http` |
| PORT | No | 3000 | HTTP server port |
| AUTH_TOKEN | No | — | Bearer token for HTTP mode |
| LOG_LEVEL | No | info | debug, info, warn, error |

## Definition of Done (PRs)

- [ ] `npm run build` passes with no errors
- [ ] `npm test` passes
- [ ] New tools follow the 3-file pattern
- [ ] All tools include `account_id` optional parameter
- [ ] Tool names use `verb_noun` convention
- [ ] README.md tool table is updated
- [ ] `docs/API_COVERAGE.md` reflects changes
