# Agents & IDE Configuration

## Agents

Six specialized agents are defined in `.claude/agents/`. Each agent has a focused role in the development workflow.

| Agent | File | Purpose |
|-------|------|---------|
| **Repo Scout** | `repo-scout.md` | Explores structure, finds patterns, inventories tools |
| **API Mapper** | `api-mapper.md` | Maps Chatwoot API endpoints to MCP tools, identifies gaps |
| **Client Engineer** | `client-engineer.md` | Implements ChatwootClient methods and TypeScript types |
| **Toolsmith** | `toolsmith.md` | Creates MCP tool schemas and dispatch handlers |
| **QA/Tests** | `qa-tests.md` | Writes tests with HTTP mocking, gates build/test |
| **Docs/Release** | `docs-release.md` | Updates README, coverage docs, version bumps |

## Typical Workflow

1. **Repo Scout** explores what exists and identifies what needs work
2. **API Mapper** produces a coverage matrix comparing API docs vs implemented tools
3. **Client Engineer** adds methods to `src/api/client.ts` + types to `src/api/types.ts`
4. **Toolsmith** adds tool schemas to `definitions.ts` + handler cases to `handlers.ts`
5. **QA/Tests** writes tests and validates build passes
6. **Docs/Release** updates docs and bumps version

## How to Invoke Agents

In Claude Code, reference an agent by name when giving instructions:

```
Use the Repo Scout agent to list all existing tools and their coverage status.
```

```
Use the Toolsmith agent to add a delete_contact tool following the 3-file pattern.
```

Each agent's `.md` file contains its role, scope, inputs/outputs, conventions, and a checklist.

## IDE Configuration

### VS Code / Cursor

Settings are in `.vscode/settings.json`:

- **Format on save**: enabled
- **Organize imports on save**: enabled (explicit action)
- **TypeScript SDK**: uses project-local `node_modules/typescript`
- **Import specifier endings**: `.js` (required for ESM)
- **Tab size**: 2 spaces
- **Excluded from search**: `dist/`, `node_modules/`, `package-lock.json`

Recommended extensions in `.vscode/extensions.json`:
- `esbenp.prettier-vscode` — Code formatting
- `ms-vscode.vscode-typescript-next` — Latest TypeScript language features

### Smoke Test

To verify the setup works:

```bash
npm install
npm run build
npm run lint
```

All three should pass without errors.
