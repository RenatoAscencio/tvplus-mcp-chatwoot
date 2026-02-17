# Deploy Report — v0.6.0 → EasyPanel

**Date**: 2026-02-17
**Server**: easy.convo.chat (SSH port 2525)
**Project**: `general`
**Service**: `general_chatwoot-mcp`

---

## Pre-deploy State

| Field | Value |
|-------|-------|
| Image | `ghcr.io/renatoascencio/tvplus-mcp-chatwoot:main` |
| Image SHA | `sha256:c03cb3d68c0baad497ab5fc7035f794e22aa2dabaf7496ef28ee30db58e391b8` |
| OCI Revision | `15caf53` (v0.2.0) |
| Container | `general_chatwoot-mcp.1.3nhktltlwp1uxeon8ojg7jd7b` |
| Uptime | ~29 hours |
| Mode | HTTP on port 3000 |
| Node | `node:22.22.0-alpine` |
| Memory | 512 MB limit / 256 MB reservation |
| Networks | `easypanel-general`, `easypanel` |

### Environment Variables

| Variable | Value |
|----------|-------|
| `MCP_MODE` | `http` |
| `PORT` | `3000` |
| `LOG_LEVEL` | `info` |
| `AUTH_TOKEN` | `***` (set) |
| `CHATWOOT_BASE_URL` | `https://chat.convo.chat` |
| `CHATWOOT_API_TOKEN` | `***` (set) |
| `NODE_ENV` | `production` |

---

## Deploy Action

```bash
docker service update \
  --image ghcr.io/renatoascencio/tvplus-mcp-chatwoot:main \
  --force general_chatwoot-mcp
```

- **Strategy**: `start-first` (zero-downtime)
- **Result**: Service converged successfully
- **CI Build**: GitHub Actions run #22088100293 (commit `889b24e`)

---

## Post-deploy State

| Field | Value |
|-------|-------|
| Image SHA | `sha256:ec9cc65510d213cad31379570595f8dad041daedb719e24079d4f3a866426cc6` |
| OCI Revision | `889b24e` (v0.6.0 + release checklist) |
| OCI Created | `2026-02-17T06:18:08.481Z` |
| Container | `general_chatwoot-mcp.1.rzcpe4of2ptsqenxa8mlec8j3` |
| Health | `healthy` |
| Restarts | 0 |

### Health Endpoint Response

```json
{
  "status": "ok",
  "server": "tvplus-mcp-chatwoot",
  "version": "0.6.0",
  "activeSessions": 0,
  "tools": 81
}
```

### Startup Logs

```
[2026-02-17T06:27:30.808Z] [INFO] Starting in HTTP mode...
[2026-02-17T06:27:30.818Z] [INFO] HTTP server listening on port 3000
[2026-02-17T06:27:30.818Z] [INFO] Health: http://localhost:3000/health
[2026-02-17T06:27:30.818Z] [INFO] MCP:    http://localhost:3000/mcp
[2026-02-17T06:27:30.818Z] [INFO] Tools:  81 total
```

---

## Tool Count

| Bucket | Tools | Enabled |
|--------|-------|---------|
| Core | 81 | Yes (always) |
| Public | 12 | No (`MCP_ENABLE_PUBLIC_API` not set) |
| Platform | 17 | No (`MCP_ENABLE_PLATFORM_API` not set) |
| Enterprise | 8 | No (`MCP_ENABLE_ENTERPRISE` not set) |
| Help Center | 15 | No (`MCP_ENABLE_HELP_CENTER` not set) |
| **Total available** | **81** | |
| **Total in codebase** | **133** | |

---

## Rollback Plan

If issues arise, rollback to v0.2.0 image:

```bash
# Option 1: Docker Swarm native rollback
docker service rollback general_chatwoot-mcp

# Option 2: Pin to previous image SHA
docker service update \
  --image ghcr.io/renatoascencio/tvplus-mcp-chatwoot:main@sha256:c03cb3d68c0baad497ab5fc7035f794e22aa2dabaf7496ef28ee30db58e391b8 \
  general_chatwoot-mcp
```

---

## Optional: Enable Additional Buckets

To enable optional buckets, update the service environment:

```bash
docker service update \
  --env-add MCP_ENABLE_PUBLIC_API=true \
  --env-add MCP_ENABLE_PLATFORM_API=true \
  --env-add CHATWOOT_PLATFORM_API_TOKEN=<token> \
  --env-add MCP_ENABLE_ENTERPRISE=true \
  --env-add MCP_ENABLE_HELP_CENTER=true \
  --env-add MCP_SAFE_MODE=true \
  general_chatwoot-mcp
```

This would expose all 133 tools with safe mode enabled.
