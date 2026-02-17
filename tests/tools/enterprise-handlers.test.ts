import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootClient } from '../../src/api/client.js';
import { handleEnterpriseToolCall } from '../../src/tools/enterprise/handlers.js';

const BASE_URL = 'https://test.chatwoot.com';
const ACCOUNT_ID = 1;
const API_TOKEN = 'test-token';

describe('Enterprise Handlers', () => {
  let client: ChatwootClient;
  let scope: nock.Scope;

  beforeEach(() => {
    client = new ChatwootClient({ baseUrl: BASE_URL, accountId: ACCOUNT_ID, apiToken: API_TOKEN });
    scope = nock(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`, {
      reqheaders: { api_access_token: API_TOKEN },
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  // ─── Audit Logs ───────────────────────────────────

  it('enterprise_list_audit_logs lists audit logs', async () => {
    scope.get('/audit_logs').query(true).reply(200, { data: [{ id: 1 }] });
    const result = await handleEnterpriseToolCall(client, 'enterprise_list_audit_logs', {}, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Reporting Events ─────────────────────────────

  it('enterprise_get_account_reporting_events gets events', async () => {
    scope.get('/reporting_events').query(true).reply(200, [{ id: 1 }]);
    const result = await handleEnterpriseToolCall(client, 'enterprise_get_account_reporting_events', {}, false);
    expect(result.isError).toBeFalsy();
  });

  it('enterprise_get_conversation_reporting_events gets conversation events', async () => {
    scope.get('/conversations/5/reporting_events').reply(200, [{ id: 1 }]);
    const result = await handleEnterpriseToolCall(client, 'enterprise_get_conversation_reporting_events', {
      conversation_id: 5,
    }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Account Agent Bots ───────────────────────────

  it('enterprise_list_agent_bots lists account bots', async () => {
    scope.get('/agent_bots').reply(200, [{ id: 1, name: 'Bot1' }]);
    const result = await handleEnterpriseToolCall(client, 'enterprise_list_agent_bots', {}, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(Array.isArray(data)).toBe(true);
    expect(result.isError).toBeFalsy();
  });

  it('enterprise_get_agent_bot gets a bot', async () => {
    scope.get('/agent_bots/1').reply(200, { id: 1, name: 'Bot1' });
    const result = await handleEnterpriseToolCall(client, 'enterprise_get_agent_bot', { bot_id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  it('enterprise_create_agent_bot creates a bot', async () => {
    scope.post('/agent_bots').reply(200, { id: 2, name: 'NewBot' });
    const result = await handleEnterpriseToolCall(client, 'enterprise_create_agent_bot', {
      name: 'NewBot', outgoing_url: 'https://example.com/hook',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('enterprise_update_agent_bot updates a bot', async () => {
    scope.patch('/agent_bots/1').reply(200, { id: 1, name: 'Updated' });
    const result = await handleEnterpriseToolCall(client, 'enterprise_update_agent_bot', {
      bot_id: 1, name: 'Updated',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('enterprise_delete_agent_bot deletes a bot', async () => {
    scope.delete('/agent_bots/1').reply(200, {});
    const result = await handleEnterpriseToolCall(client, 'enterprise_delete_agent_bot', { bot_id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Safe Mode ────────────────────────────────────

  it('blocks enterprise_create_agent_bot in safe mode', async () => {
    const result = await handleEnterpriseToolCall(client, 'enterprise_create_agent_bot', {
      name: 'Bot', outgoing_url: 'https://example.com',
    }, true);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('MCP_SAFE_MODE');
  });

  it('blocks enterprise_delete_agent_bot in safe mode', async () => {
    const result = await handleEnterpriseToolCall(client, 'enterprise_delete_agent_bot', { bot_id: 1 }, true);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('MCP_SAFE_MODE');
  });

  it('allows reads in safe mode', async () => {
    scope.get('/audit_logs').query(true).reply(200, { data: [] });
    const result = await handleEnterpriseToolCall(client, 'enterprise_list_audit_logs', {}, true);
    expect(result.isError).toBeFalsy();
  });

  // ─── Error Handling ───────────────────────────────

  it('returns error for unknown enterprise tool', async () => {
    const result = await handleEnterpriseToolCall(client, 'enterprise_nonexistent', {}, false);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('Unknown enterprise tool');
  });

  it('handles API errors gracefully', async () => {
    scope.get('/audit_logs').query(true).reply(403, { message: 'Access denied' });
    const result = await handleEnterpriseToolCall(client, 'enterprise_list_audit_logs', {}, false);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('403');
  });
});
