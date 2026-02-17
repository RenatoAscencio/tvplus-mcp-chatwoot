# Changelog

## [0.6.0] — 2026-02-17

### Added
- **Public API bucket** (12 tools): Widget/client-facing API with `inbox_identifier` auth
  - Contacts: create, get, update
  - Conversations: create, list, get, resolve, toggle typing, update last seen
  - Messages: create, list, update
- **Platform API bucket** (17 tools): Super-admin operations with separate token
  - Accounts: CRUD
  - Agent Bots: CRUD + list
  - Users: CRUD + SSO link
  - Account Users: list, create, delete
- **Enterprise bucket** (8 tools): Admin and Enterprise-only endpoints
  - Audit Logs: list
  - Reporting Events: account-level and conversation-level
  - Account Agent Bots: CRUD + list
- **Help Center bucket** (15 tools): Knowledge base management
  - Portals: CRUD + list
  - Articles: CRUD + list
  - Categories: CRUD + list
- **Dual safe mode**: `MCP_SAFE_MODE` (20 blocked) + `MCP_PLATFORM_SAFE_MODE` (11 blocked, default ON)
- **Conditional bucket loading**: Each bucket opt-in via environment flags
- **Separate auth**: Platform API uses independent `CHATWOOT_PLATFORM_API_TOKEN`
- **Live smoke test script**: `npm run smoke:live` (read-only, requires `LIVE_SMOKE=true`)
- **240 tests** across 9 test files (up from 169 in v0.5.0)
- Documentation: PLATFORM_SECURITY.md, ENTERPRISE.md, updated SCOPE.md

### Changed
- Tool routing in server.ts and http-server.ts uses name→bucket Set lookups
- SCOPE.md rewritten for 5 buckets
- .env.example updated with all bucket flags
- README updated with buckets overview table

## [0.5.0] — 2026-02-16

### Added
- Expanded from 28 to 81 core tools
- Reports v2 endpoints (7 tools)
- Custom Filters CRUD (5 tools)
- Automation Rules CRUD (5 tools)
- Custom Attributes CRUD (5 tools)
- Inbox Members management (4 tools)
- Contact Labels (2 tools)
- Conversation Custom Attributes
- MCP_SAFE_MODE blocking 14 destructive tools
- Multi-account support with optional `account_id`

## [0.2.0] — 2026-02-15

### Added
- Multi-account support with optional `account_id` parameter on all tools
- Documentation for multi-account usage

## [0.1.0] — 2026-02-15

### Added
- Initial release with 28 MCP tools
- STDIO and HTTP/SSE transport
- Docker support with multi-stage build
- Vitest + nock test suite
