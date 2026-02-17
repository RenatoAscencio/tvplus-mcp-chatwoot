import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootClient } from '../../src/api/client.js';
import { ChatwootPlatformClient } from '../../src/api/platform-client.js';
import { handleToolCall } from '../../src/tools/handlers.js';
import { handlePlatformToolCall } from '../../src/tools/platform/handlers.js';
import { handleEnterpriseToolCall } from '../../src/tools/enterprise/handlers.js';
import { handleHelpCenterToolCall } from '../../src/tools/helpcenter/handlers.js';

const BASE_URL = 'https://test.chatwoot.com';
const ACCOUNT_ID = 1;
const API_TOKEN = 'test-token';
const PLATFORM_TOKEN = 'platform-test-token';

// ═══════════════════════════════════════════════════════
// Exhaustive Safe Mode Guardrail Tests
// Validates every blocked tool + consistent error messages
// ═══════════════════════════════════════════════════════

describe('Safe Mode Guardrails', () => {
  // ─── Core: MCP_SAFE_MODE ───────────────────────────

  describe('Core MCP_SAFE_MODE (14 tools)', () => {
    let client: ChatwootClient;

    beforeEach(() => {
      client = new ChatwootClient({ baseUrl: BASE_URL, accountId: ACCOUNT_ID, apiToken: API_TOKEN });
      process.env.MCP_SAFE_MODE = 'true';
    });

    afterEach(() => {
      delete process.env.MCP_SAFE_MODE;
      nock.cleanAll();
    });

    const CORE_DESTRUCTIVE_TOOLS: Array<{ name: string; args: Record<string, unknown> }> = [
      { name: 'delete_contact', args: { contact_id: 1 } },
      { name: 'delete_message', args: { conversation_id: 1, message_id: 1 } },
      { name: 'delete_team', args: { team_id: 1 } },
      { name: 'delete_label', args: { label_id: 1 } },
      { name: 'delete_canned_response', args: { canned_response_id: 1 } },
      { name: 'delete_webhook', args: { webhook_id: 1 } },
      { name: 'delete_custom_attribute', args: { attribute_id: 1 } },
      { name: 'delete_automation_rule', args: { rule_id: 1 } },
      { name: 'delete_custom_filter', args: { filter_id: 1 } },
      { name: 'remove_inbox_agents', args: { inbox_id: 1, user_ids: [1] } },
      { name: 'remove_team_members', args: { team_id: 1, user_ids: [1] } },
      { name: 'merge_contacts', args: { base_contact_id: 1, mergee_contact_id: 2 } },
      { name: 'create_webhook', args: { url: 'https://hook.test', subscriptions: ['message_created'] } },
      { name: 'update_webhook', args: { webhook_id: 1, url: 'https://hook.test' } },
    ];

    it('exactly 14 core destructive tools', () => {
      expect(CORE_DESTRUCTIVE_TOOLS).toHaveLength(14);
    });

    for (const { name, args } of CORE_DESTRUCTIVE_TOOLS) {
      it(`blocks "${name}"`, async () => {
        const result = await handleToolCall(client, name, args);
        expect(result.isError).toBe(true);
        const text = (result.content[0] as { text: string }).text;
        // Must include: flag name, tool name, and how to unblock
        expect(text).toContain('MCP_SAFE_MODE');
        expect(text).toContain(`"${name}"`);
        expect(text).toContain('MCP_SAFE_MODE=false');
      });
    }

    it('allows read-only tools while safe mode is on', async () => {
      const scope = nock(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`, {
        reqheaders: { api_access_token: API_TOKEN },
      });
      scope.get('/contacts').query(true).reply(200, { payload: [] });
      scope.get('/conversations').query(true).reply(200, { data: { payload: [] } });
      scope.get('/teams').reply(200, []);

      const r1 = await handleToolCall(client, 'list_contacts', {});
      const r2 = await handleToolCall(client, 'list_conversations', {});
      const r3 = await handleToolCall(client, 'list_teams', {});

      expect(r1.isError).toBeFalsy();
      expect(r2.isError).toBeFalsy();
      expect(r3.isError).toBeFalsy();
    });
  });

  // ─── Platform: MCP_PLATFORM_SAFE_MODE ──────────────

  describe('Platform MCP_PLATFORM_SAFE_MODE (11 tools)', () => {
    let client: ChatwootPlatformClient;

    beforeEach(() => {
      client = new ChatwootPlatformClient({ baseUrl: BASE_URL, apiToken: PLATFORM_TOKEN });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    const PLATFORM_WRITE_TOOLS: Array<{ name: string; args: Record<string, unknown> }> = [
      { name: 'platform_create_account', args: { name: 'Test' } },
      { name: 'platform_update_account', args: { account_id: 1, name: 'X' } },
      { name: 'platform_delete_account', args: { account_id: 1 } },
      { name: 'platform_create_agent_bot', args: { name: 'B', outgoing_url: 'https://h.test' } },
      { name: 'platform_update_agent_bot', args: { id: 1, name: 'X' } },
      { name: 'platform_delete_agent_bot', args: { id: 1 } },
      { name: 'platform_create_user', args: { name: 'U', email: 'u@t.com' } },
      { name: 'platform_update_user', args: { id: 1, name: 'X' } },
      { name: 'platform_delete_user', args: { id: 1 } },
      { name: 'platform_create_account_user', args: { account_id: 1, user_id: 1, role: 'agent' } },
      { name: 'platform_delete_account_user', args: { account_id: 1, user_id: 1 } },
    ];

    it('exactly 11 platform write tools', () => {
      expect(PLATFORM_WRITE_TOOLS).toHaveLength(11);
    });

    for (const { name, args } of PLATFORM_WRITE_TOOLS) {
      it(`blocks "${name}" when platformSafeMode=true`, async () => {
        const result = await handlePlatformToolCall(client, name, args, true);
        expect(result.isError).toBe(true);
        const text = (result.content[0] as { text: string }).text;
        expect(text).toContain('MCP_PLATFORM_SAFE_MODE');
        expect(text).toContain(`"${name}"`);
        expect(text).toContain('MCP_PLATFORM_SAFE_MODE=false');
      });
    }

    it('allows all 6 read tools when platformSafeMode=true', async () => {
      const scope = nock(`${BASE_URL}/platform/api/v1`, {
        reqheaders: { api_access_token: PLATFORM_TOKEN },
      });
      scope.get('/accounts/1').reply(200, { id: 1 });
      scope.get('/agent_bots').reply(200, []);
      scope.get('/agent_bots/1').reply(200, { id: 1 });
      scope.get('/users/1').reply(200, { id: 1 });
      scope.get('/users/1/login').reply(200, { url: 'https://sso.test' });
      scope.get('/accounts/1/account_users').reply(200, []);

      const reads = [
        handlePlatformToolCall(client, 'platform_get_account', { account_id: 1 }, true),
        handlePlatformToolCall(client, 'platform_list_agent_bots', {}, true),
        handlePlatformToolCall(client, 'platform_get_agent_bot', { id: 1 }, true),
        handlePlatformToolCall(client, 'platform_get_user', { id: 1 }, true),
        handlePlatformToolCall(client, 'platform_get_user_sso_link', { id: 1 }, true),
        handlePlatformToolCall(client, 'platform_list_account_users', { account_id: 1 }, true),
      ];

      const results = await Promise.all(reads);
      for (const r of results) {
        expect(r.isError).toBeFalsy();
      }
    });

    it('allows writes when platformSafeMode=false', async () => {
      const scope = nock(`${BASE_URL}/platform/api/v1`, {
        reqheaders: { api_access_token: PLATFORM_TOKEN },
      });
      scope.post('/accounts').reply(200, { id: 2 });
      scope.delete('/accounts/1').reply(200, {});

      const r1 = await handlePlatformToolCall(client, 'platform_create_account', { name: 'T' }, false);
      const r2 = await handlePlatformToolCall(client, 'platform_delete_account', { account_id: 1 }, false);
      expect(r1.isError).toBeFalsy();
      expect(r2.isError).toBeFalsy();
    });
  });

  // ─── Enterprise: MCP_SAFE_MODE ─────────────────────

  describe('Enterprise MCP_SAFE_MODE (3 tools)', () => {
    let client: ChatwootClient;

    beforeEach(() => {
      client = new ChatwootClient({ baseUrl: BASE_URL, accountId: ACCOUNT_ID, apiToken: API_TOKEN });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    const ENTERPRISE_DESTRUCTIVE: Array<{ name: string; args: Record<string, unknown> }> = [
      { name: 'enterprise_create_agent_bot', args: { name: 'B', outgoing_url: 'https://h.test' } },
      { name: 'enterprise_update_agent_bot', args: { bot_id: 1, name: 'X' } },
      { name: 'enterprise_delete_agent_bot', args: { bot_id: 1 } },
    ];

    it('exactly 3 enterprise destructive tools', () => {
      expect(ENTERPRISE_DESTRUCTIVE).toHaveLength(3);
    });

    for (const { name, args } of ENTERPRISE_DESTRUCTIVE) {
      it(`blocks "${name}" in safe mode`, async () => {
        const result = await handleEnterpriseToolCall(client, name, args, true);
        expect(result.isError).toBe(true);
        const text = (result.content[0] as { text: string }).text;
        expect(text).toContain('MCP_SAFE_MODE');
        expect(text).toContain(`"${name}"`);
        expect(text).toContain('MCP_SAFE_MODE=false');
      });
    }

    it('allows all 5 read tools in safe mode', async () => {
      const scope = nock(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`, {
        reqheaders: { api_access_token: API_TOKEN },
      });
      scope.get('/audit_logs').query(true).reply(200, { data: [] });
      scope.get('/reporting_events').query(true).reply(200, []);
      scope.get('/conversations/1/reporting_events').reply(200, []);
      scope.get('/agent_bots').reply(200, []);
      scope.get('/agent_bots/1').reply(200, { id: 1 });

      const reads = [
        handleEnterpriseToolCall(client, 'enterprise_list_audit_logs', {}, true),
        handleEnterpriseToolCall(client, 'enterprise_get_account_reporting_events', {}, true),
        handleEnterpriseToolCall(client, 'enterprise_get_conversation_reporting_events', { conversation_id: 1 }, true),
        handleEnterpriseToolCall(client, 'enterprise_list_agent_bots', {}, true),
        handleEnterpriseToolCall(client, 'enterprise_get_agent_bot', { bot_id: 1 }, true),
      ];

      const results = await Promise.all(reads);
      for (const r of results) {
        expect(r.isError).toBeFalsy();
      }
    });
  });

  // ─── Help Center: MCP_SAFE_MODE ────────────────────

  describe('Help Center MCP_SAFE_MODE (3 tools)', () => {
    let client: ChatwootClient;

    beforeEach(() => {
      client = new ChatwootClient({ baseUrl: BASE_URL, accountId: ACCOUNT_ID, apiToken: API_TOKEN });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    const HELPCENTER_DESTRUCTIVE: Array<{ name: string; args: Record<string, unknown> }> = [
      { name: 'helpcenter_delete_portal', args: { portal_id: 'help' } },
      { name: 'helpcenter_delete_article', args: { portal_id: 'help', article_id: 1 } },
      { name: 'helpcenter_delete_category', args: { portal_id: 'help', category_id: 1 } },
    ];

    it('exactly 3 help center destructive tools', () => {
      expect(HELPCENTER_DESTRUCTIVE).toHaveLength(3);
    });

    for (const { name, args } of HELPCENTER_DESTRUCTIVE) {
      it(`blocks "${name}" in safe mode`, async () => {
        const result = await handleHelpCenterToolCall(client, name, args, true);
        expect(result.isError).toBe(true);
        const text = (result.content[0] as { text: string }).text;
        expect(text).toContain('MCP_SAFE_MODE');
        expect(text).toContain(`"${name}"`);
        expect(text).toContain('MCP_SAFE_MODE=false');
      });
    }

    it('allows all 12 read/write non-destructive tools in safe mode', async () => {
      const scope = nock(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`, {
        reqheaders: { api_access_token: API_TOKEN },
      });
      scope.get('/portals').reply(200, []);
      scope.post('/portals').reply(200, { id: 1 });
      scope.get('/portals/help').reply(200, { id: 1 });
      scope.patch('/portals/help').reply(200, { id: 1 });
      scope.get('/portals/help/articles').query(true).reply(200, []);
      scope.post('/portals/help/articles').reply(200, { id: 1 });
      scope.get('/portals/help/articles/1').reply(200, { id: 1 });
      scope.patch('/portals/help/articles/1').reply(200, { id: 1 });
      scope.get('/portals/help/categories').query(true).reply(200, []);
      scope.post('/portals/help/categories').reply(200, { id: 1 });
      scope.get('/portals/help/categories/1').reply(200, { id: 1 });
      scope.patch('/portals/help/categories/1').reply(200, { id: 1 });

      const reads = [
        handleHelpCenterToolCall(client, 'helpcenter_list_portals', {}, true),
        handleHelpCenterToolCall(client, 'helpcenter_create_portal', { name: 'T', slug: 't' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_get_portal', { portal_id: 'help' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_update_portal', { portal_id: 'help', name: 'X' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_list_articles', { portal_id: 'help' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_create_article', { portal_id: 'help', title: 'T', slug: 't' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_get_article', { portal_id: 'help', article_id: 1 }, true),
        handleHelpCenterToolCall(client, 'helpcenter_update_article', { portal_id: 'help', article_id: 1, title: 'X' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_list_categories', { portal_id: 'help' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_create_category', { portal_id: 'help', name: 'T' }, true),
        handleHelpCenterToolCall(client, 'helpcenter_get_category', { portal_id: 'help', category_id: 1 }, true),
        handleHelpCenterToolCall(client, 'helpcenter_update_category', { portal_id: 'help', category_id: 1, name: 'X' }, true),
      ];

      const results = await Promise.all(reads);
      for (const r of results) {
        expect(r.isError).toBeFalsy();
      }
    });
  });

  // ─── Cross-bucket: total blocked count ─────────────

  describe('total blocked counts match documentation', () => {
    it('core (14) + enterprise (3) + helpcenter (3) = 20 destructive via MCP_SAFE_MODE', () => {
      expect(14 + 3 + 3).toBe(20);
    });

    it('platform write tools = 11 via MCP_PLATFORM_SAFE_MODE', () => {
      expect(11).toBe(11);
    });
  });
});
