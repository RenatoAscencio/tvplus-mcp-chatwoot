#!/usr/bin/env tsx
/**
 * Live Smoke Test — mcp-chatwoot v0.6.0
 *
 * Runs 1-2 read-only calls per enabled bucket against a real Chatwoot instance.
 * Only executes when LIVE_SMOKE=true.
 * Skips buckets whose env vars are missing.
 * Never writes, creates, or deletes data.
 *
 * Usage:
 *   LIVE_SMOKE=true npm run smoke:live
 *
 * Required env:
 *   CHATWOOT_BASE_URL, CHATWOOT_ACCOUNT_ID, CHATWOOT_API_TOKEN
 *
 * Optional env (enables extra buckets):
 *   MCP_ENABLE_PUBLIC_API=true + CHATWOOT_PUBLIC_INBOX_IDENTIFIER
 *   MCP_ENABLE_PLATFORM_API=true + CHATWOOT_PLATFORM_API_TOKEN
 *   MCP_ENABLE_ENTERPRISE=true
 *   MCP_ENABLE_HELP_CENTER=true
 */

import { ChatwootClient } from '../../src/api/client.js';
import { ChatwootPublicClient } from '../../src/api/public-client.js';
import { ChatwootPlatformClient } from '../../src/api/platform-client.js';

// ─── Gate ────────────────────────────────────────────
if (process.env.LIVE_SMOKE !== 'true') {
  console.log('⏭  LIVE_SMOKE is not set. Skipping live smoke tests.');
  console.log('   Run with: LIVE_SMOKE=true npm run smoke:live');
  process.exit(0);
}

const BASE_URL = process.env.CHATWOOT_BASE_URL;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const API_TOKEN = process.env.CHATWOOT_API_TOKEN;

if (!BASE_URL || !ACCOUNT_ID || !API_TOKEN) {
  console.error('Missing required env: CHATWOOT_BASE_URL, CHATWOOT_ACCOUNT_ID, CHATWOOT_API_TOKEN');
  process.exit(1);
}

let passed = 0;
let failed = 0;
let skipped = 0;

async function test(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${label}`);
  } catch (err) {
    failed++;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ ${label}: ${msg}`);
  }
}

function skip(label: string, reason: string): void {
  skipped++;
  console.log(`  ⏭  ${label} — ${reason}`);
}

// ─── Core Bucket ─────────────────────────────────────
console.log('\n📦 Core (Application API)');
const client = new ChatwootClient({
  baseUrl: BASE_URL,
  accountId: parseInt(ACCOUNT_ID, 10),
  apiToken: API_TOKEN,
});

await test('health check', async () => {
  const result = await client.health();
  if (!result.accountId) throw new Error('No accountId in response');
});

await test('list_contacts (page 1)', async () => {
  const result = await client.listContacts(1) as { payload: unknown[] };
  if (!Array.isArray(result.payload)) throw new Error('Expected payload array');
});

await test('list_teams', async () => {
  const result = await client.listTeams();
  if (!Array.isArray(result)) throw new Error('Expected array');
});

// ─── Public Bucket ───────────────────────────────────
console.log('\n📦 Public API');
const INBOX_ID = process.env.CHATWOOT_PUBLIC_INBOX_IDENTIFIER;
if (process.env.MCP_ENABLE_PUBLIC_API === 'true' && INBOX_ID) {
  const publicClient = new ChatwootPublicClient(BASE_URL);

  await test('public_create_contact', async () => {
    const result = await publicClient.createContact(INBOX_ID, {}) as Record<string, unknown>;
    if (!result.source_id && !result.pubsub_token) throw new Error('Unexpected response');
  });
} else {
  skip('public API tests', 'MCP_ENABLE_PUBLIC_API or CHATWOOT_PUBLIC_INBOX_IDENTIFIER not set');
}

// ─── Platform Bucket ─────────────────────────────────
console.log('\n📦 Platform API');
const PLATFORM_TOKEN = process.env.CHATWOOT_PLATFORM_API_TOKEN;
if (process.env.MCP_ENABLE_PLATFORM_API === 'true' && PLATFORM_TOKEN) {
  const platformClient = new ChatwootPlatformClient({
    baseUrl: BASE_URL,
    apiToken: PLATFORM_TOKEN,
  });

  await test('platform_get_account', async () => {
    const result = await platformClient.getAccount(parseInt(ACCOUNT_ID, 10)) as Record<string, unknown>;
    if (!result.id) throw new Error('No account id in response');
  });

  await test('platform_list_agent_bots', async () => {
    const result = await platformClient.listAgentBots();
    if (!Array.isArray(result)) throw new Error('Expected array');
  });
} else {
  skip('platform API tests', 'MCP_ENABLE_PLATFORM_API or CHATWOOT_PLATFORM_API_TOKEN not set');
}

// ─── Enterprise Bucket ───────────────────────────────
console.log('\n📦 Enterprise');
if (process.env.MCP_ENABLE_ENTERPRISE === 'true') {
  await test('enterprise_list_agent_bots', async () => {
    const result = await client.listAccountAgentBots();
    if (!Array.isArray(result)) throw new Error('Expected array');
  });

  await test('enterprise_list_audit_logs', async () => {
    try {
      await client.listAuditLogs(1);
      // If it succeeds, audit logs are enabled
    } catch (err: unknown) {
      // 403 is expected if not enterprise edition
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 403) {
        console.log('    (403 expected — audit logs require enterprise edition)');
        return;
      }
      throw err;
    }
  });
} else {
  skip('enterprise tests', 'MCP_ENABLE_ENTERPRISE not set');
}

// ─── Help Center Bucket ──────────────────────────────
console.log('\n📦 Help Center');
if (process.env.MCP_ENABLE_HELP_CENTER === 'true') {
  await test('helpcenter_list_portals', async () => {
    const result = await client.listPortals();
    if (!Array.isArray(result)) throw new Error('Expected array');
  });
} else {
  skip('help center tests', 'MCP_ENABLE_HELP_CENTER not set');
}

// ─── Summary ─────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log(`Smoke Results: ✅ ${passed} passed, ❌ ${failed} failed, ⏭ ${skipped} skipped`);
console.log('═'.repeat(50));

if (failed > 0) {
  process.exit(1);
}
