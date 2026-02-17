import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootPlatformClient } from '../../src/api/platform-client.js';
import { handlePlatformToolCall } from '../../src/tools/platform/handlers.js';

const BASE_URL = 'https://test.chatwoot.com';
const PLATFORM_TOKEN = 'platform-test-token';

describe('Platform API Handlers', () => {
  let client: ChatwootPlatformClient;
  let scope: nock.Scope;

  beforeEach(() => {
    client = new ChatwootPlatformClient({ baseUrl: BASE_URL, apiToken: PLATFORM_TOKEN });
    scope = nock(`${BASE_URL}/platform/api/v1`, {
      reqheaders: { api_access_token: PLATFORM_TOKEN },
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  // ─── Accounts ──────────────────────────────────────

  it('platform_get_account gets an account', async () => {
    scope.get('/accounts/1').reply(200, { id: 1, name: 'Test' });
    const result = await handlePlatformToolCall(client, 'platform_get_account', { account_id: 1 }, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.name).toBe('Test');
    expect(result.isError).toBeFalsy();
  });

  it('platform_create_account creates an account', async () => {
    scope.post('/accounts').reply(200, { id: 2, name: 'New' });
    const result = await handlePlatformToolCall(client, 'platform_create_account', { name: 'New' }, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.id).toBe(2);
    expect(result.isError).toBeFalsy();
  });

  it('platform_update_account updates an account', async () => {
    scope.patch('/accounts/1').reply(200, { id: 1, name: 'Updated' });
    const result = await handlePlatformToolCall(client, 'platform_update_account', { account_id: 1, name: 'Updated' }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_delete_account deletes an account', async () => {
    scope.delete('/accounts/1').reply(200, {});
    const result = await handlePlatformToolCall(client, 'platform_delete_account', { account_id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Agent Bots ───────────────────────────────────

  it('platform_list_agent_bots lists bots', async () => {
    scope.get('/agent_bots').reply(200, [{ id: 1, name: 'Bot1' }]);
    const result = await handlePlatformToolCall(client, 'platform_list_agent_bots', {}, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(Array.isArray(data)).toBe(true);
    expect(result.isError).toBeFalsy();
  });

  it('platform_get_agent_bot gets a bot', async () => {
    scope.get('/agent_bots/1').reply(200, { id: 1, name: 'Bot1' });
    const result = await handlePlatformToolCall(client, 'platform_get_agent_bot', { id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_create_agent_bot creates a bot', async () => {
    scope.post('/agent_bots').reply(200, { id: 2, name: 'NewBot' });
    const result = await handlePlatformToolCall(client, 'platform_create_agent_bot', {
      name: 'NewBot', outgoing_url: 'https://example.com/webhook',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_delete_agent_bot deletes a bot', async () => {
    scope.delete('/agent_bots/1').reply(200, {});
    const result = await handlePlatformToolCall(client, 'platform_delete_agent_bot', { id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Users ────────────────────────────────────────

  it('platform_get_user gets a user', async () => {
    scope.get('/users/1').reply(200, { id: 1, name: 'User1' });
    const result = await handlePlatformToolCall(client, 'platform_get_user', { id: 1 }, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.name).toBe('User1');
    expect(result.isError).toBeFalsy();
  });

  it('platform_create_user creates a user', async () => {
    scope.post('/users').reply(200, { id: 2, name: 'New', email: 'new@test.com' });
    const result = await handlePlatformToolCall(client, 'platform_create_user', {
      name: 'New', email: 'new@test.com',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_delete_user deletes a user', async () => {
    scope.delete('/users/1').reply(200, {});
    const result = await handlePlatformToolCall(client, 'platform_delete_user', { id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_get_user_sso_link gets SSO link', async () => {
    scope.get('/users/1/login').reply(200, { url: 'https://app.chatwoot.com/auth/sso?token=abc' });
    const result = await handlePlatformToolCall(client, 'platform_get_user_sso_link', { id: 1 }, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.url).toContain('sso');
    expect(result.isError).toBeFalsy();
  });

  // ─── Account Users ────────────────────────────────

  it('platform_list_account_users lists account users', async () => {
    scope.get('/accounts/1/account_users').reply(200, [{ user_id: 1 }]);
    const result = await handlePlatformToolCall(client, 'platform_list_account_users', { account_id: 1 }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_create_account_user adds user to account', async () => {
    scope.post('/accounts/1/account_users').reply(200, { user_id: 1 });
    const result = await handlePlatformToolCall(client, 'platform_create_account_user', {
      account_id: 1, user_id: 1, role: 'agent',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('platform_delete_account_user removes user from account', async () => {
    scope.delete('/accounts/1/account_users').reply(200, {});
    const result = await handlePlatformToolCall(client, 'platform_delete_account_user', {
      account_id: 1, user_id: 1,
    }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Platform Safe Mode ──────────────────────────

  it('blocks writes when platformSafeMode=true', async () => {
    const result = await handlePlatformToolCall(client, 'platform_create_account', { name: 'Test' }, true);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('MCP_PLATFORM_SAFE_MODE');
  });

  it('blocks deletes when platformSafeMode=true', async () => {
    const result = await handlePlatformToolCall(client, 'platform_delete_account', { account_id: 1 }, true);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('MCP_PLATFORM_SAFE_MODE');
  });

  it('allows reads when platformSafeMode=true', async () => {
    scope.get('/accounts/1').reply(200, { id: 1, name: 'Test' });
    const result = await handlePlatformToolCall(client, 'platform_get_account', { account_id: 1 }, true);
    expect(result.isError).toBeFalsy();
  });

  it('allows all operations when platformSafeMode=false', async () => {
    scope.post('/accounts').reply(200, { id: 2 });
    const result = await handlePlatformToolCall(client, 'platform_create_account', { name: 'Test' }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Error Handling ───────────────────────────────

  it('returns error for unknown platform tool', async () => {
    const result = await handlePlatformToolCall(client, 'platform_nonexistent', {}, false);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('Unknown platform tool');
  });

  it('handles API errors gracefully', async () => {
    scope.get('/accounts/999').reply(404, { message: 'Not found' });
    const result = await handlePlatformToolCall(client, 'platform_get_account', { account_id: 999 }, false);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('404');
  });
});
