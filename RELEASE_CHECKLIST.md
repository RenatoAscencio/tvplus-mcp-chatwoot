# Release Checklist — v0.6.0

## Pre-release

- [x] `npm ci` — clean install, 0 vulnerabilities
- [x] `npm run build` — TypeScript compiles without errors
- [x] `npm test` — 240 tests pass (9 test files)
- [x] `npm run lint` — type checking passes

## Verification

- [x] Tool counts: Core=81, Public=12, Platform=17, Enterprise=8, HelpCenter=15 → Total=133
- [x] No duplicate tool names across all buckets
- [x] Naming conventions: `public_*`, `platform_*`, `enterprise_*`, `helpcenter_*`
- [x] Every tool has name, description, and inputSchema
- [x] `MCP_SAFE_MODE=true` blocks 20 tools (14 core + 3 enterprise + 3 helpcenter)
- [x] `MCP_PLATFORM_SAFE_MODE=true` blocks 11 platform write/delete tools
- [x] All blocked error messages include: tool name + flag + how to unblock
- [x] Read operations work under both safe modes
- [x] `getBucketConfig()` defaults all buckets disabled, platform safe mode ON

## Documentation

- [x] README.md — buckets overview table, test count updated to 240
- [x] docs/SCOPE.md — rewritten for 5 buckets with full tool listing
- [x] docs/PLATFORM_SECURITY.md — deployment examples added
- [x] docs/ENTERPRISE.md — complete
- [x] .env.example — all flags documented
- [x] CHANGELOG.md — v0.6.0 entry

## Smoke Test

- [x] `npm run smoke:live` — skips cleanly when `LIVE_SMOKE` is not set
- [ ] `LIVE_SMOKE=true npm run smoke:live` — passes against real Chatwoot (manual)

## Docker

- [x] Dockerfile verified (multi-stage, health check)
- [x] docker-compose.yml verified
- [ ] `docker build -t tvplus-mcp-chatwoot:0.6.0 .` — builds successfully (manual)
- [ ] Container starts and responds to `/health` (manual)

## Release

- [x] Version in package.json: `0.6.0`
- [x] Git tag: `v0.6.0` (SHA: c26ce8a)
- [x] Push to main (SHA: e77e21e)
- [x] GitHub release: https://github.com/RenatoAscencio/tvplus-mcp-chatwoot/releases/tag/v0.6.0
