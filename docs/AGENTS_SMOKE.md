# Agents Smoke Test

Build status: PASS (`npm run build` — clean, 0 errors)

---

## Repo Scout — Key Files

| # | File | Why it matters |
|---|------|---------------|
| 1 | `src/index.ts` | Entry point — selects STDIO or HTTP transport |
| 2 | `src/server.ts` | Creates MCP Server instance, registers tool handlers |
| 3 | `src/http-server.ts` | Express HTTP server with session management and auth |
| 4 | `src/api/client.ts` | All Chatwoot API calls — single source of truth for HTTP logic |
| 5 | `src/api/types.ts` | TypeScript interfaces for all Chatwoot entities |
| 6 | `src/tools/definitions.ts` | 28 MCP tool schemas — the "API surface" of this server |
| 7 | `src/tools/handlers.ts` | Dispatch logic mapping tool names to client methods |
| 8 | `src/utils/config.ts` | Environment config — validates required env vars |
| 9 | `src/utils/logger.ts` | Structured logger to stderr (never stdout) |
| 10 | `package.json` | Project metadata, scripts, dependencies |

---

## API Mapper — 5 Missing Endpoints (Preliminary)

| # | Resource | Endpoint | Why it's missing |
|---|----------|----------|-----------------|
| 1 | Contacts | `DELETE /contacts/{id}` | CRUD incomplete — no delete |
| 2 | Conversations | `GET /conversations/counts` | Conversation statistics not exposed |
| 3 | Custom Attributes | `POST/PATCH/DELETE /custom_attribute_definitions` | Only list implemented |
| 4 | Automation Rules | Full CRUD | Entire resource missing |
| 5 | Custom Filters | Full CRUD | Entire resource missing |

---

## Client Engineer — Proposed Method

**Method**: `deleteContact(contactId: number, accountId?: number): Promise<void>`

```typescript
async deleteContact(contactId: number, accountId?: number): Promise<void> {
  const http = this.forAccount(accountId);
  await http.delete(`/contacts/${contactId}`);
}
```

Rationale: Contacts have full CRUD in Chatwoot API but the client only has create/read/update. Delete is a simple addition that follows the existing pattern.

---

## Toolsmith — Proposed Tool Schema

**Tool**: `delete_contact`

```typescript
{
  name: 'delete_contact',
  description: 'Permanently delete a contact and all associated data.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      contact_id: { type: 'number', description: 'The contact ID to delete' },
      ...accountIdProperty,
    },
    required: ['contact_id'],
  },
}
```

---

## QA/Tests — Proposed Framework

**Recommendation**: **Vitest + nock**

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Vitest + nock | ESM-native, fast, intercepts at HTTP level, zero config for TS | nock patches Node http module | **Selected** |
| Vitest + msw | More "modern", works in browser too | Heavier setup, overkill for server-only | Not needed |
| Jest + nock | Mature | ESM support is painful, needs transforms | Avoid |

**Why Vitest**: Native ESM/TypeScript support, no babel/transform config needed, fast execution, compatible with the project's `"type": "module"` setup.

**Why nock**: Intercepts axios calls at the `http` module level — no need to mock the client class. Tests verify actual HTTP paths, headers, and query params.

---

## Docs/Release — Proposed Documentation Structure

```
docs/
├── API_COVERAGE.md      # Coverage matrix: resource × endpoint × tool × status
├── AGENTS_AND_IDE.md    # Agent descriptions and IDE setup
└── AGENTS_SMOKE.md      # This file — smoke test results
```

Coverage doc format:
```markdown
| Resource | Endpoint | Method | Tool | Status |
|----------|----------|--------|------|--------|
| Contacts | /contacts | GET | list_contacts | OK |
| Contacts | /contacts/{id} | DELETE | — | FALTA |
```

README tool table should be auto-verifiable against `definitions.ts` tool count.

---

**Smoke test completed successfully.** All 6 agents produced valid output. Proceeding to Block 2.
