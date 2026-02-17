import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootClient } from '../../src/api/client.js';
import { handleToolCall } from '../../src/tools/handlers.js';

const BASE_URL = 'https://test.chatwoot.com';
const ACCOUNT_ID = 1;
const API_TOKEN = 'test-token';

describe('Tool Handlers', () => {
  let client: ChatwootClient;
  let scope: nock.Scope;

  beforeEach(() => {
    client = new ChatwootClient({
      baseUrl: BASE_URL,
      accountId: ACCOUNT_ID,
      apiToken: API_TOKEN,
    });
    scope = nock(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`, {
      reqheaders: { api_access_token: API_TOKEN },
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('chatwoot_health returns textResult', async () => {
    scope.get('/').reply(200, { name: 'TestAccount' });
    const result = await handleToolCall(client, 'chatwoot_health', {});
    expect(result.content[0].type).toBe('text');
    expect((result.content[0] as { text: string }).text).toContain('Connected to Chatwoot');
    expect(result.isError).toBeFalsy();
  });

  it('list_contacts returns jsonResult', async () => {
    scope.get('/contacts').query(true).reply(200, { payload: [{ id: 1 }] });
    const result = await handleToolCall(client, 'list_contacts', {});
    expect(result.content[0].type).toBe('text');
    const parsed = JSON.parse((result.content[0] as { text: string }).text);
    expect(parsed.payload).toBeDefined();
    expect(result.isError).toBeFalsy();
  });

  it('delete_contact returns success text', async () => {
    scope.delete('/contacts/1').reply(200);
    const result = await handleToolCall(client, 'delete_contact', { contact_id: 1 });
    expect((result.content[0] as { text: string }).text).toBe('Contact deleted successfully.');
    expect(result.isError).toBeFalsy();
  });

  it('filter_contacts returns jsonResult', async () => {
    const filters = [{ attribute_key: 'email', filter_operator: 'contains', values: ['test'] }];
    scope.post('/contacts/filter').reply(200, { payload: [] });
    const result = await handleToolCall(client, 'filter_contacts', { filters });
    expect(result.isError).toBeFalsy();
  });

  it('get_conversation_labels returns jsonResult', async () => {
    scope.get('/conversations/1/labels').reply(200, { payload: ['bug', 'urgent'] });
    const result = await handleToolCall(client, 'get_conversation_labels', { conversation_id: 1 });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse((result.content[0] as { text: string }).text);
    expect(parsed.payload).toContain('bug');
  });

  it('delete_message returns success text', async () => {
    scope.delete('/conversations/1/messages/5').reply(200);
    const result = await handleToolCall(client, 'delete_message', { conversation_id: 1, message_id: 5 });
    expect((result.content[0] as { text: string }).text).toBe('Message deleted successfully.');
  });

  it('create_team returns jsonResult', async () => {
    scope.post('/teams').reply(201, { id: 1, name: 'Support' });
    const result = await handleToolCall(client, 'create_team', { name: 'Support' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse((result.content[0] as { text: string }).text);
    expect(parsed.name).toBe('Support');
  });

  it('create_webhook returns jsonResult', async () => {
    scope.post('/webhooks').reply(201, { id: 1, url: 'https://hook.test.com' });
    const result = await handleToolCall(client, 'create_webhook', {
      url: 'https://hook.test.com',
      subscriptions: ['message_created'],
    });
    expect(result.isError).toBeFalsy();
  });

  it('delete_webhook returns success text', async () => {
    scope.delete('/webhooks/1').reply(200);
    const result = await handleToolCall(client, 'delete_webhook', { webhook_id: 1 });
    expect((result.content[0] as { text: string }).text).toBe('Webhook deleted successfully.');
  });

  it('list_automation_rules returns jsonResult', async () => {
    scope.get('/automation_rules').reply(200, { payload: [{ id: 1, name: 'Auto-assign' }] });
    const result = await handleToolCall(client, 'list_automation_rules', {});
    expect(result.isError).toBeFalsy();
  });

  it('create_custom_filter returns jsonResult', async () => {
    scope.post('/custom_filters').reply(201, { id: 1, name: 'Open bugs' });
    const result = await handleToolCall(client, 'create_custom_filter', {
      name: 'Open bugs',
      filter_type: 'conversation',
      query: { status: 'open' },
    });
    expect(result.isError).toBeFalsy();
  });

  it('filter_conversations returns jsonResult', async () => {
    const filters = [{ attribute_key: 'status', filter_operator: 'equal_to', values: ['open'] }];
    scope.post('/conversations/filter').reply(200, { data: { payload: [] } });
    const result = await handleToolCall(client, 'filter_conversations', { filters });
    expect(result.isError).toBeFalsy();
  });

  it('merge_contacts returns jsonResult', async () => {
    scope.post('/actions/contact_merge').reply(200, { id: 1, name: 'Merged' });
    const result = await handleToolCall(client, 'merge_contacts', {
      base_contact_id: 1,
      mergee_contact_id: 2,
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse((result.content[0] as { text: string }).text);
    expect(parsed.name).toBe('Merged');
  });

  it('list_inbox_agents returns jsonResult', async () => {
    scope.get('/inbox_members/5').reply(200, [{ id: 1, name: 'Agent' }]);
    const result = await handleToolCall(client, 'list_inbox_agents', { inbox_id: 5 });
    expect(result.isError).toBeFalsy();
  });

  it('add_inbox_agents returns jsonResult', async () => {
    scope.post('/inbox_members').reply(200, [{ id: 1 }]);
    const result = await handleToolCall(client, 'add_inbox_agents', { inbox_id: 5, user_ids: [1] });
    expect(result.isError).toBeFalsy();
  });

  it('add_team_members returns jsonResult', async () => {
    scope.post('/teams/3/team_members').reply(200, [{ id: 1 }]);
    const result = await handleToolCall(client, 'add_team_members', { team_id: 3, user_ids: [1] });
    expect(result.isError).toBeFalsy();
  });

  it('get_profile returns jsonResult', async () => {
    scope.get('/profile').reply(200, { id: 1, name: 'Admin' });
    const result = await handleToolCall(client, 'get_profile', {});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse((result.content[0] as { text: string }).text);
    expect(parsed.name).toBe('Admin');
  });

  it('get_account_report uses v2 API', async () => {
    const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
    v2Scope.get('/reports').query(true).reply(200, [{ value: 10 }]);
    const result = await handleToolCall(client, 'get_account_report', {
      metric: 'conversations_count',
      type: 'account',
    });
    expect(result.isError).toBeFalsy();
    v2Scope.done();
  });

  it('get_contact_labels returns jsonResult', async () => {
    scope.get('/contacts/1/labels').reply(200, { payload: ['vip'] });
    const result = await handleToolCall(client, 'get_contact_labels', { contact_id: 1 });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse((result.content[0] as { text: string }).text);
    expect(parsed.payload).toContain('vip');
  });

  it('add_labels_to_contact returns jsonResult', async () => {
    scope.post('/contacts/1/labels').reply(200, { payload: ['vip', 'active'] });
    const result = await handleToolCall(client, 'add_labels_to_contact', {
      contact_id: 1,
      labels: ['vip', 'active'],
    });
    expect(result.isError).toBeFalsy();
  });

  it('set_conversation_custom_attributes returns jsonResult', async () => {
    scope.post('/conversations/1/custom_attributes').reply(200, { id: 1 });
    const result = await handleToolCall(client, 'set_conversation_custom_attributes', {
      conversation_id: 1,
      custom_attributes: { order_id: '123' },
    });
    expect(result.isError).toBeFalsy();
  });

  it('get_custom_attribute returns jsonResult', async () => {
    scope.get('/custom_attribute_definitions/1').reply(200, { id: 1, attribute_key: 'priority' });
    const result = await handleToolCall(client, 'get_custom_attribute', { attribute_id: 1 });
    expect(result.isError).toBeFalsy();
  });

  it('list_integrations returns jsonResult', async () => {
    scope.get('/integrations/apps').reply(200, { payload: [{ id: 'slack' }] });
    const result = await handleToolCall(client, 'list_integrations', {});
    expect(result.isError).toBeFalsy();
  });

  it('get_inbox_agent_bot returns jsonResult', async () => {
    scope.get('/inboxes/5/agent_bot').reply(200, { id: 1, name: 'Bot' });
    const result = await handleToolCall(client, 'get_inbox_agent_bot', { inbox_id: 5 });
    expect(result.isError).toBeFalsy();
  });

  it('get_contactable_inboxes returns jsonResult', async () => {
    scope.get('/contacts/1/contactable_inboxes').reply(200, { payload: [] });
    const result = await handleToolCall(client, 'get_contactable_inboxes', { contact_id: 1 });
    expect(result.isError).toBeFalsy();
  });

  it('update_team_members returns jsonResult', async () => {
    scope.patch('/teams/3/team_members').reply(200, [{ id: 1 }]);
    const result = await handleToolCall(client, 'update_team_members', { team_id: 3, user_ids: [1, 2] });
    expect(result.isError).toBeFalsy();
  });

  it('get_conversation_statistics returns jsonResult', async () => {
    const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
    v2Scope.get('/summary_reports/agent').query(true).reply(200, [{ id: 1 }]);
    const result = await handleToolCall(client, 'get_conversation_statistics', { entity_type: 'agent' });
    expect(result.isError).toBeFalsy();
    v2Scope.done();
  });

  it('get_conversation_metrics returns jsonResult', async () => {
    const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
    v2Scope.get('/reports/conversations').query(true).reply(200, { open: 5 });
    const result = await handleToolCall(client, 'get_conversation_metrics', { type: 'account' });
    expect(result.isError).toBeFalsy();
    v2Scope.done();
  });

  it('get_outgoing_messages_report returns jsonResult', async () => {
    const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
    v2Scope.get('/reports/outgoing_messages_count').query(true).reply(200, [{ count: 50 }]);
    const result = await handleToolCall(client, 'get_outgoing_messages_report', { group_by: 'agent' });
    expect(result.isError).toBeFalsy();
    v2Scope.done();
  });

  // ─── Safe Mode Tests ─────────────────────────────────────

  describe('MCP_SAFE_MODE', () => {
    afterEach(() => {
      delete process.env.MCP_SAFE_MODE;
    });

    it('blocks delete_contact in safe mode', async () => {
      process.env.MCP_SAFE_MODE = 'true';
      const result = await handleToolCall(client, 'delete_contact', { contact_id: 1 });
      expect(result.isError).toBe(true);
      expect((result.content[0] as { text: string }).text).toContain('Blocked by MCP_SAFE_MODE');
    });

    it('blocks merge_contacts in safe mode', async () => {
      process.env.MCP_SAFE_MODE = 'true';
      const result = await handleToolCall(client, 'merge_contacts', {
        base_contact_id: 1,
        mergee_contact_id: 2,
      });
      expect(result.isError).toBe(true);
      expect((result.content[0] as { text: string }).text).toContain('Blocked by MCP_SAFE_MODE');
    });

    it('blocks create_webhook in safe mode', async () => {
      process.env.MCP_SAFE_MODE = 'true';
      const result = await handleToolCall(client, 'create_webhook', {
        url: 'https://hook.test.com',
        subscriptions: ['message_created'],
      });
      expect(result.isError).toBe(true);
      expect((result.content[0] as { text: string }).text).toContain('Blocked by MCP_SAFE_MODE');
    });

    it('blocks remove_team_members in safe mode', async () => {
      process.env.MCP_SAFE_MODE = 'true';
      const result = await handleToolCall(client, 'remove_team_members', {
        team_id: 3,
        user_ids: [1],
      });
      expect(result.isError).toBe(true);
      expect((result.content[0] as { text: string }).text).toContain('Blocked by MCP_SAFE_MODE');
    });

    it('allows read-only tools in safe mode', async () => {
      process.env.MCP_SAFE_MODE = 'true';
      scope.get('/contacts').query(true).reply(200, { payload: [{ id: 1 }] });
      const result = await handleToolCall(client, 'list_contacts', {});
      expect(result.isError).toBeFalsy();
    });

    it('allows destructive tools when safe mode is off', async () => {
      process.env.MCP_SAFE_MODE = 'false';
      scope.delete('/contacts/1').reply(200);
      const result = await handleToolCall(client, 'delete_contact', { contact_id: 1 });
      expect(result.isError).toBeFalsy();
    });

    it('allows destructive tools when safe mode is unset', async () => {
      delete process.env.MCP_SAFE_MODE;
      scope.delete('/contacts/1').reply(200);
      const result = await handleToolCall(client, 'delete_contact', { contact_id: 1 });
      expect(result.isError).toBeFalsy();
    });
  });

  it('unknown tool returns error', async () => {
    const result = await handleToolCall(client, 'nonexistent_tool', {});
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('Unknown tool');
  });

  it('handles API errors gracefully', async () => {
    scope.get('/contacts').query(true).reply(401, { message: 'Unauthorized' });
    const result = await handleToolCall(client, 'list_contacts', {});
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('401');
  });

  it('passes account_id to alternate account', async () => {
    const altScope = nock(`${BASE_URL}/api/v1/accounts/99`);
    altScope.get('/agents').reply(200, [{ id: 1, name: 'Agent' }]);
    const result = await handleToolCall(client, 'list_agents', { account_id: 99 });
    expect(result.isError).toBeFalsy();
    altScope.done();
  });
});
