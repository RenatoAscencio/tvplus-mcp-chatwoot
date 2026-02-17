import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootClient } from '../../src/api/client.js';

const BASE_URL = 'https://test.chatwoot.com';
const ACCOUNT_ID = 1;
const API_TOKEN = 'test-token';

describe('ChatwootClient', () => {
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

  // ─── Health ──────────────────────────────────────────

  describe('health', () => {
    it('should return success with account info', async () => {
      scope.get('/').reply(200, { name: 'Test Account' });
      const result = await client.health();
      expect(result.success).toBe(true);
      expect(result.accountName).toBe('Test Account');
      expect(result.accountId).toBe(ACCOUNT_ID);
    });
  });

  // ─── Contacts ────────────────────────────────────────

  describe('listContacts', () => {
    it('should call GET /contacts with params', async () => {
      const mockData = { payload: [{ id: 1, name: 'John' }] };
      scope.get('/contacts').query({ page: 1, sort: 'name' }).reply(200, mockData);
      const result = await client.listContacts(1, 'name');
      expect(result).toEqual(mockData);
    });
  });

  describe('getContact', () => {
    it('should call GET /contacts/:id', async () => {
      const mockData = { id: 1, name: 'John' };
      scope.get('/contacts/1').reply(200, mockData);
      const result = await client.getContact(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('createContact', () => {
    it('should call POST /contacts', async () => {
      const input = { name: 'Jane', email: 'jane@test.com' };
      const mockResponse = { id: 2, ...input };
      scope.post('/contacts', input).reply(201, mockResponse);
      const result = await client.createContact(input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteContact', () => {
    it('should call DELETE /contacts/:id', async () => {
      scope.delete('/contacts/1').reply(200);
      await expect(client.deleteContact(1)).resolves.toBeUndefined();
    });
  });

  describe('searchContacts', () => {
    it('should call GET /contacts/search with query', async () => {
      const mockData = { payload: [{ id: 1 }] };
      scope.get('/contacts/search').query({ q: 'john', page: 1 }).reply(200, mockData);
      const result = await client.searchContacts('john');
      expect(result).toEqual(mockData);
    });
  });

  describe('filterContacts', () => {
    it('should call POST /contacts/filter', async () => {
      const filters = [{ attribute_key: 'city', filter_operator: 'equal_to', values: ['Paris'] }];
      const mockData = { payload: [{ id: 1 }] };
      scope.post('/contacts/filter', { payload: filters, page: 1 }).reply(200, mockData);
      const result = await client.filterContacts(filters);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Conversations ──────────────────────────────────

  describe('listConversations', () => {
    it('should call GET /conversations with params', async () => {
      const mockData = { data: { payload: [] } };
      scope.get('/conversations').query({ status: 'open' }).reply(200, mockData);
      const result = await client.listConversations({ status: 'open' });
      expect(result).toEqual(mockData);
    });
  });

  describe('getConversation', () => {
    it('should call GET /conversations/:id', async () => {
      const mockData = { id: 1, status: 'open' };
      scope.get('/conversations/1').reply(200, mockData);
      const result = await client.getConversation(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('getConversationCounts', () => {
    it('should call GET /conversations/counts', async () => {
      const mockData = { data: { meta: { all_count: 10 } } };
      scope.get('/conversations/counts').reply(200, mockData);
      const result = await client.getConversationCounts();
      expect(result).toEqual(mockData);
    });
  });

  // ─── Messages ────────────────────────────────────────

  describe('sendMessage', () => {
    it('should call POST /conversations/:id/messages', async () => {
      const mockData = { id: 1, content: 'Hello' };
      scope.post('/conversations/1/messages').reply(200, mockData);
      const result = await client.sendMessage(1, 'Hello');
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteMessage', () => {
    it('should call DELETE /conversations/:id/messages/:msgId', async () => {
      scope.delete('/conversations/1/messages/5').reply(200);
      await expect(client.deleteMessage(1, 5)).resolves.toBeUndefined();
    });
  });

  // ─── Teams ──────────────────────────────────────────

  describe('createTeam', () => {
    it('should call POST /teams', async () => {
      const input = { name: 'Support' };
      const mockData = { id: 1, ...input };
      scope.post('/teams', input).reply(201, mockData);
      const result = await client.createTeam(input);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteTeam', () => {
    it('should call DELETE /teams/:id', async () => {
      scope.delete('/teams/1').reply(200);
      await expect(client.deleteTeam(1)).resolves.toBeUndefined();
    });
  });

  // ─── Labels ──────────────────────────────────────────

  describe('updateLabel', () => {
    it('should call PATCH /labels/:id', async () => {
      const updates = { title: 'Bug', color: '#FF0000' };
      const mockData = { id: 1, ...updates };
      scope.patch('/labels/1', updates).reply(200, mockData);
      const result = await client.updateLabel(1, updates);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteLabel', () => {
    it('should call DELETE /labels/:id', async () => {
      scope.delete('/labels/1').reply(200);
      await expect(client.deleteLabel(1)).resolves.toBeUndefined();
    });
  });

  // ─── Webhooks ────────────────────────────────────────

  describe('createWebhook', () => {
    it('should call POST /webhooks', async () => {
      const input = { url: 'https://hook.example.com', subscriptions: ['message_created'] };
      const mockData = { id: 1, ...input };
      scope.post('/webhooks', input).reply(201, mockData);
      const result = await client.createWebhook(input);
      expect(result).toEqual(mockData);
    });
  });

  describe('updateWebhook', () => {
    it('should call PATCH /webhooks/:id', async () => {
      const updates = { url: 'https://new-hook.example.com' };
      const mockData = { id: 1, ...updates };
      scope.patch('/webhooks/1', updates).reply(200, mockData);
      const result = await client.updateWebhook(1, updates);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteWebhook', () => {
    it('should call DELETE /webhooks/:id', async () => {
      scope.delete('/webhooks/1').reply(200);
      await expect(client.deleteWebhook(1)).resolves.toBeUndefined();
    });
  });

  // ─── Custom Attributes ──────────────────────────────

  describe('createCustomAttribute', () => {
    it('should call POST /custom_attribute_definitions', async () => {
      const input = {
        attribute_display_name: 'Priority',
        attribute_display_type: 'list',
        attribute_key: 'priority',
        attribute_model: 'conversation_attribute',
      };
      const mockData = { id: 1, ...input };
      scope.post('/custom_attribute_definitions', input).reply(201, mockData);
      const result = await client.createCustomAttribute(input);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteCustomAttribute', () => {
    it('should call DELETE /custom_attribute_definitions/:id', async () => {
      scope.delete('/custom_attribute_definitions/1').reply(200);
      await expect(client.deleteCustomAttribute(1)).resolves.toBeUndefined();
    });
  });

  // ─── Automation Rules ───────────────────────────────

  describe('listAutomationRules', () => {
    it('should call GET /automation_rules', async () => {
      const mockData = { payload: [{ id: 1, name: 'Auto-assign' }] };
      scope.get('/automation_rules').reply(200, mockData);
      const result = await client.listAutomationRules();
      expect(result).toEqual(mockData);
    });
  });

  describe('createAutomationRule', () => {
    it('should call POST /automation_rules', async () => {
      const input = {
        name: 'Auto-assign',
        event_name: 'conversation_created',
        conditions: [{ attribute_key: 'status', filter_operator: 'equal_to', values: ['open'] }],
        actions: [{ action_name: 'assign_agent', action_params: [1] }],
      };
      const mockData = { id: 1, ...input };
      scope.post('/automation_rules', input).reply(201, mockData);
      const result = await client.createAutomationRule(input);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteAutomationRule', () => {
    it('should call DELETE /automation_rules/:id', async () => {
      scope.delete('/automation_rules/1').reply(200);
      await expect(client.deleteAutomationRule(1)).resolves.toBeUndefined();
    });
  });

  // ─── Custom Filters ─────────────────────────────────

  describe('listCustomFilters', () => {
    it('should call GET /custom_filters', async () => {
      const mockData = [{ id: 1, name: 'Open bugs' }];
      scope.get('/custom_filters').reply(200, mockData);
      const result = await client.listCustomFilters();
      expect(result).toEqual(mockData);
    });

    it('should pass filter_type param', async () => {
      const mockData = [{ id: 1 }];
      scope.get('/custom_filters').query({ filter_type: 'conversation' }).reply(200, mockData);
      const result = await client.listCustomFilters('conversation');
      expect(result).toEqual(mockData);
    });
  });

  describe('createCustomFilter', () => {
    it('should call POST /custom_filters', async () => {
      const input = {
        name: 'Open bugs',
        filter_type: 'conversation',
        query: { attribute_key: 'status', filter_operator: 'equal_to', values: ['open'] },
      };
      const mockData = { id: 1, ...input };
      scope.post('/custom_filters', input).reply(201, mockData);
      const result = await client.createCustomFilter(input);
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteCustomFilter', () => {
    it('should call DELETE /custom_filters/:id', async () => {
      scope.delete('/custom_filters/1').reply(200);
      await expect(client.deleteCustomFilter(1)).resolves.toBeUndefined();
    });
  });

  // ─── Reports (v2) ──────────────────────────────────

  describe('getAccountReport', () => {
    it('should call GET /api/v2/.../reports', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = [{ value: 10, timestamp: 1700000000 }];
      v2Scope.get('/reports').query({ metric: 'conversations_count', type: 'account' }).reply(200, mockData);
      const result = await client.getAccountReport({ metric: 'conversations_count', type: 'account' });
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  describe('getReportSummary', () => {
    it('should call GET /api/v2/.../reports/summary', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = { conversations_count: 100, avg_resolution_time: 300 };
      v2Scope.get('/reports/summary').query(true).reply(200, mockData);
      const result = await client.getReportSummary({ type: 'account' });
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  // ─── Conversations (filter) ───────────────────────

  describe('filterConversations', () => {
    it('should call POST /conversations/filter', async () => {
      const filters = [{ attribute_key: 'status', filter_operator: 'equal_to', values: ['open'] }];
      const mockData = { data: { payload: [{ id: 1 }] } };
      scope.post('/conversations/filter', { payload: filters, page: 1 }).reply(200, mockData);
      const result = await client.filterConversations(filters);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Contacts (merge) ─────────────────────────────

  describe('mergeContacts', () => {
    it('should call POST /actions/contact_merge', async () => {
      const mockData = { id: 1, name: 'Merged Contact' };
      scope.post('/actions/contact_merge', { base_contact_id: 1, mergee_contact_id: 2 }).reply(200, mockData);
      const result = await client.mergeContacts(1, 2);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Inbox Members ────────────────────────────────

  describe('listInboxAgents', () => {
    it('should call GET /inbox_members/:inbox_id', async () => {
      const mockData = [{ id: 1, name: 'Agent 1' }];
      scope.get('/inbox_members/5').reply(200, mockData);
      const result = await client.listInboxAgents(5);
      expect(result).toEqual(mockData);
    });
  });

  describe('addInboxAgents', () => {
    it('should call POST /inbox_members', async () => {
      const mockData = [{ id: 1 }];
      scope.post('/inbox_members', { inbox_id: 5, user_ids: [1, 2] }).reply(200, mockData);
      const result = await client.addInboxAgents(5, [1, 2]);
      expect(result).toEqual(mockData);
    });
  });

  describe('updateInboxAgents', () => {
    it('should call PATCH /inbox_members', async () => {
      const mockData = [{ id: 1 }];
      scope.patch('/inbox_members', { inbox_id: 5, user_ids: [1] }).reply(200, mockData);
      const result = await client.updateInboxAgents(5, [1]);
      expect(result).toEqual(mockData);
    });
  });

  describe('removeInboxAgents', () => {
    it('should call DELETE /inbox_members', async () => {
      scope.delete('/inbox_members').reply(200);
      const result = await client.removeInboxAgents(5, [2]);
      expect(result).toEqual('');
    });
  });

  // ─── Team Members ─────────────────────────────────

  describe('addTeamMembers', () => {
    it('should call POST /teams/:id/team_members', async () => {
      const mockData = [{ id: 1, name: 'Agent' }];
      scope.post('/teams/3/team_members', { user_ids: [1, 2] }).reply(200, mockData);
      const result = await client.addTeamMembers(3, [1, 2]);
      expect(result).toEqual(mockData);
    });
  });

  describe('removeTeamMembers', () => {
    it('should call DELETE /teams/:id/team_members', async () => {
      scope.delete('/teams/3/team_members').reply(200);
      const result = await client.removeTeamMembers(3, [2]);
      expect(result).toEqual('');
    });
  });

  // ─── Contact Labels ─────────────────────────────────

  describe('getContactLabels', () => {
    it('should call GET /contacts/:id/labels', async () => {
      const mockData = { payload: ['vip', 'active'] };
      scope.get('/contacts/1/labels').reply(200, mockData);
      const result = await client.getContactLabels(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('addLabelsToContact', () => {
    it('should call POST /contacts/:id/labels', async () => {
      const mockData = { payload: ['vip', 'active'] };
      scope.post('/contacts/1/labels', { labels: ['vip', 'active'] }).reply(200, mockData);
      const result = await client.addLabelsToContact(1, ['vip', 'active']);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Conversation Custom Attributes ────────────────

  describe('setConversationCustomAttributes', () => {
    it('should call POST /conversations/:id/custom_attributes', async () => {
      const attrs = { order_id: '12345', tier: 'gold' };
      const mockData = { id: 1, custom_attributes: attrs };
      scope.post('/conversations/1/custom_attributes', { custom_attributes: attrs }).reply(200, mockData);
      const result = await client.setConversationCustomAttributes(1, attrs);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Custom Attributes (get by ID) ─────────────────

  describe('getCustomAttribute', () => {
    it('should call GET /custom_attribute_definitions/:id', async () => {
      const mockData = { id: 1, attribute_key: 'priority', attribute_display_name: 'Priority' };
      scope.get('/custom_attribute_definitions/1').reply(200, mockData);
      const result = await client.getCustomAttribute(1);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Integrations ──────────────────────────────────

  describe('listIntegrations', () => {
    it('should call GET /integrations/apps', async () => {
      const mockData = { payload: [{ id: 'slack', name: 'Slack' }] };
      scope.get('/integrations/apps').reply(200, mockData);
      const result = await client.listIntegrations();
      expect(result).toEqual(mockData);
    });
  });

  // ─── Inbox Agent Bot ───────────────────────────────

  describe('getInboxAgentBot', () => {
    it('should call GET /inboxes/:id/agent_bot', async () => {
      const mockData = { id: 1, name: 'Bot', description: 'Support bot' };
      scope.get('/inboxes/5/agent_bot').reply(200, mockData);
      const result = await client.getInboxAgentBot(5);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Contactable Inboxes ──────────────────────────

  describe('getContactableInboxes', () => {
    it('should call GET /contacts/:id/contactable_inboxes', async () => {
      const mockData = { payload: [{ inbox: { id: 1, name: 'Email' } }] };
      scope.get('/contacts/1/contactable_inboxes').reply(200, mockData);
      const result = await client.getContactableInboxes(1);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Team Members (update) ────────────────────────

  describe('updateTeamMembers', () => {
    it('should call PATCH /teams/:id/team_members', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      scope.patch('/teams/3/team_members', { user_ids: [1, 2] }).reply(200, mockData);
      const result = await client.updateTeamMembers(3, [1, 2]);
      expect(result).toEqual(mockData);
    });
  });

  // ─── Reports v2 (additional) ──────────────────────

  describe('getConversationStatistics', () => {
    it('should call GET /api/v2/.../summary_reports/:entity', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = [{ id: 1, conversations_count: 10, avg_first_response_time: 120 }];
      v2Scope.get('/summary_reports/agent').query(true).reply(200, mockData);
      const result = await client.getConversationStatistics('agent', { since: '1700000000' });
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  describe('getConversationMetrics', () => {
    it('should call GET /api/v2/.../reports/conversations', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = { open: 5, unattended: 2, unassigned: 1 };
      v2Scope.get('/reports/conversations').query({ type: 'account' }).reply(200, mockData);
      const result = await client.getConversationMetrics('account');
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  describe('getFirstResponseTimeDistribution', () => {
    it('should call GET /api/v2/.../reports/first_response_time_distribution', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = [{ channel: 'web', avg_time: 60 }];
      v2Scope.get('/reports/first_response_time_distribution').query(true).reply(200, mockData);
      const result = await client.getFirstResponseTimeDistribution({ since: '1700000000' });
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  describe('getInboxLabelMatrix', () => {
    it('should call GET /api/v2/.../reports/inbox_label_matrix', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = [{ inbox_id: 1, label_id: 2, count: 5 }];
      v2Scope.get('/reports/inbox_label_matrix').query(true).reply(200, mockData);
      const result = await client.getInboxLabelMatrix({ since: '1700000000' });
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  describe('getOutgoingMessagesCount', () => {
    it('should call GET /api/v2/.../reports/outgoing_messages_count', async () => {
      const v2Scope = nock(`${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}`);
      const mockData = [{ agent_id: 1, count: 50 }];
      v2Scope.get('/reports/outgoing_messages_count').query({ group_by: 'agent' }).reply(200, mockData);
      const result = await client.getOutgoingMessagesCount('agent', {});
      expect(result).toEqual(mockData);
      v2Scope.done();
    });
  });

  // ─── Profile ──────────────────────────────────────

  describe('getProfile', () => {
    it('should call GET /profile', async () => {
      const mockData = { id: 1, name: 'Admin', email: 'admin@test.com' };
      scope.get('/profile').reply(200, mockData);
      const result = await client.getProfile();
      expect(result).toEqual(mockData);
    });
  });

  // ─── Error handling ─────────────────────────────────

  describe('error handling', () => {
    it('should throw ChatwootApiError on 401', async () => {
      scope.get('/contacts').query({ page: 1, sort: 'name' }).reply(401, { message: 'Unauthorized' });
      await expect(client.listContacts()).rejects.toThrow('Unauthorized');
    });

    it('should throw ChatwootApiError on 404', async () => {
      scope.get('/contacts/999').reply(404, { error: 'Resource not found' });
      await expect(client.getContact(999)).rejects.toThrow('Resource not found');
    });

    it('should throw ChatwootApiError on 422', async () => {
      scope.post('/contacts').reply(422, { message: 'Validation failed' });
      await expect(client.createContact({ name: '' })).rejects.toThrow('Validation failed');
    });
  });

  // ─── Multi-account ──────────────────────────────────

  describe('multi-account', () => {
    it('should use alternate account when account_id differs', async () => {
      const altScope = nock(`${BASE_URL}/api/v1/accounts/99`);
      altScope.get('/contacts').query({ page: 1, sort: 'name' }).reply(200, { payload: [] });
      const result = await client.listContacts(1, 'name', 99);
      expect(result).toEqual({ payload: [] });
      altScope.done();
    });
  });
});
