import axios, { AxiosInstance, AxiosError } from 'axios';
import { ChatwootConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class ChatwootClient {
  private http: AxiosInstance | null;
  private baseUrl: string;
  private defaultAccountId: number | undefined;
  private apiToken: string;

  constructor(config: ChatwootConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultAccountId = config.accountId;
    this.apiToken = config.apiToken;

    if (config.accountId) {
      this.http = axios.create({
        baseURL: `${config.baseUrl}/api/v1/accounts/${config.accountId}`,
        headers: {
          'api_access_token': config.apiToken,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      this.http.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          const status = error.response?.status;
          const data = error.response?.data as Record<string, unknown> | undefined;
          const message = (data?.message as string) || (data?.error as string) || error.message;

          logger.error(`Chatwoot API error: ${status} ${message}`, {
            url: error.config?.url,
            method: error.config?.method,
          });

          throw new ChatwootApiError(status || 500, message, data);
        },
      );
    } else {
      this.http = null;
    }
  }

  private createAccountInstance(accountId: number): AxiosInstance {
    const instance = axios.create({
      baseURL: `${this.baseUrl}/api/v1/accounts/${accountId}`,
      headers: {
        'api_access_token': this.apiToken,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data as Record<string, unknown> | undefined;
        const message = (data?.message as string) || (data?.error as string) || error.message;

        logger.error(`Chatwoot API error: ${status} ${message}`, {
          url: error.config?.url,
          method: error.config?.method,
        });

        throw new ChatwootApiError(status || 500, message, data);
      },
    );

    return instance;
  }

  /** Returns the axios instance scoped to a specific account (or default) */
  private forAccount(accountId?: number): AxiosInstance {
    if (accountId) {
      if (accountId === this.defaultAccountId && this.http) {
        return this.http;
      }
      return this.createAccountInstance(accountId);
    }
    if (this.http) {
      return this.http;
    }
    throw new Error('account_id is required when CHATWOOT_ACCOUNT_ID is not set');
  }

  /** Returns an axios instance scoped to API v2 for a specific account */
  private forAccountV2(accountId?: number): AxiosInstance {
    const id = accountId || this.defaultAccountId;
    if (!id) {
      throw new Error('account_id is required when CHATWOOT_ACCOUNT_ID is not set');
    }
    return axios.create({
      baseURL: `${this.baseUrl}/api/v2/accounts/${id}`,
      headers: {
        'api_access_token': this.apiToken,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  get currentAccountId(): number | undefined {
    return this.defaultAccountId;
  }

  // ─── Health ──────────────────────────────────────────────

  async health(accountId?: number): Promise<{ success: boolean; accountName?: string; accountId?: number }> {
    const http = this.forAccount(accountId);
    const id = accountId || this.defaultAccountId;
    const res = await http.get('/');
    return { success: true, accountName: res.data?.name, accountId: id };
  }

  // ─── Contacts ────────────────────────────────────────────

  async listContacts(page = 1, sortBy = 'name', accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/contacts', { params: { page, sort: sortBy } });
    return res.data;
  }

  async getContact(contactId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/contacts/${contactId}`);
    return res.data;
  }

  async createContact(data: {
    name?: string;
    email?: string;
    phone_number?: string;
    identifier?: string;
    inbox_id?: number;
    custom_attributes?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/contacts', data);
    return res.data;
  }

  async updateContact(contactId: number, data: Record<string, unknown>, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/contacts/${contactId}`, data);
    return res.data;
  }

  async searchContacts(query: string, page = 1, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/contacts/search', { params: { q: query, page } });
    return res.data;
  }

  async filterContacts(filters: Array<Record<string, unknown>>, page = 1, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/contacts/filter', { payload: filters, page });
    return res.data;
  }

  async getContactConversations(contactId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/contacts/${contactId}/conversations`);
    return res.data;
  }

  // ─── Conversations ──────────────────────────────────────

  async listConversations(params: {
    status?: string;
    assignee_type?: string;
    inbox_id?: number;
    team_id?: number;
    labels?: string[];
    page?: number;
  } = {}, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/conversations', { params });
    return res.data;
  }

  async getConversation(conversationId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/conversations/${conversationId}`);
    return res.data;
  }

  async createConversation(data: {
    source_id?: string;
    inbox_id: number;
    contact_id?: number;
    message?: { content: string };
    status?: string;
    assignee_id?: number;
    team_id?: number;
    custom_attributes?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/conversations', data);
    return res.data;
  }

  async updateConversationStatus(
    conversationId: number,
    status: 'open' | 'resolved' | 'pending' | 'snoozed',
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/conversations/${conversationId}/toggle_status`, {
      status,
    });
    return res.data;
  }

  async assignConversation(
    conversationId: number,
    assigneeId?: number,
    teamId?: number,
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/conversations/${conversationId}/assignments`, {
      assignee_id: assigneeId,
      team_id: teamId,
    });
    return res.data;
  }

  async addLabelsToConversation(
    conversationId: number,
    labels: string[],
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccount(accountId);
    const current = await http.get(`/conversations/${conversationId}`) as { data?: { labels?: string[] } };
    const merged = [...new Set([...(current.data?.labels || []), ...labels])];
    const res = await http.post(`/conversations/${conversationId}/labels`, {
      labels: merged,
    });
    return res.data;
  }

  async getConversationLabels(conversationId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/conversations/${conversationId}/labels`);
    return res.data;
  }

  async toggleConversationPriority(
    conversationId: number,
    priority: 'urgent' | 'high' | 'medium' | 'low' | 'none',
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/conversations/${conversationId}`, { priority });
    return res.data;
  }

  // ─── Messages ────────────────────────────────────────────

  async listMessages(conversationId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/conversations/${conversationId}/messages`);
    return res.data;
  }

  async sendMessage(
    conversationId: number,
    content: string,
    options: {
      message_type?: 'outgoing' | 'incoming';
      private?: boolean;
      content_type?: string;
      content_attributes?: Record<string, unknown>;
    } = {},
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/conversations/${conversationId}/messages`, {
      content,
      message_type: options.message_type || 'outgoing',
      private: options.private || false,
      content_type: options.content_type || 'text',
      content_attributes: options.content_attributes,
    });
    return res.data;
  }

  async deleteMessage(conversationId: number, messageId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/conversations/${conversationId}/messages/${messageId}`);
  }

  // ─── Agents ──────────────────────────────────────────────

  async listAgents(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/agents');
    return res.data;
  }

  async getAgent(agentId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/agents/${agentId}`);
    return res.data;
  }

  // ─── Teams ───────────────────────────────────────────────

  async listTeams(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/teams');
    return res.data;
  }

  async getTeam(teamId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/teams/${teamId}`);
    return res.data;
  }

  async getTeamMembers(teamId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/teams/${teamId}/team_members`);
    return res.data;
  }

  // ─── Inboxes ─────────────────────────────────────────────

  async listInboxes(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/inboxes');
    return res.data;
  }

  async getInbox(inboxId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/inboxes/${inboxId}`);
    return res.data;
  }

  // ─── Contacts (continued) ───────────────────────────────

  async deleteContact(contactId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/contacts/${contactId}`);
  }

  // ─── Conversations (continued) ────────────────────────

  async getConversationCounts(status?: string, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const params = status ? { status } : {};
    const res = await http.get('/conversations/counts', { params });
    return res.data;
  }

  // ─── Teams (continued) ────────────────────────────────

  async createTeam(data: {
    name: string;
    description?: string;
    allow_auto_assign?: boolean;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/teams', data);
    return res.data;
  }

  async updateTeam(teamId: number, data: {
    name?: string;
    description?: string;
    allow_auto_assign?: boolean;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/teams/${teamId}`, data);
    return res.data;
  }

  async deleteTeam(teamId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/teams/${teamId}`);
  }

  // ─── Labels ──────────────────────────────────────────────

  async listLabels(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/labels');
    return res.data;
  }

  async createLabel(data: {
    title: string;
    description?: string;
    color?: string;
    show_on_sidebar?: boolean;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/labels', data);
    return res.data;
  }

  async updateLabel(labelId: number, data: {
    title?: string;
    description?: string;
    color?: string;
    show_on_sidebar?: boolean;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/labels/${labelId}`, data);
    return res.data;
  }

  async deleteLabel(labelId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/labels/${labelId}`);
  }

  // ─── Canned Responses ────────────────────────────────────

  async listCannedResponses(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/canned_responses');
    return res.data;
  }

  async createCannedResponse(data: {
    short_code: string;
    content: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/canned_responses', data);
    return res.data;
  }

  async updateCannedResponse(cannedResponseId: number, data: {
    short_code?: string;
    content?: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/canned_responses/${cannedResponseId}`, data);
    return res.data;
  }

  async deleteCannedResponse(cannedResponseId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/canned_responses/${cannedResponseId}`);
  }

  // ─── Webhooks ────────────────────────────────────────────

  async listWebhooks(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/webhooks');
    return res.data;
  }

  async createWebhook(data: {
    url: string;
    subscriptions: string[];
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/webhooks', data);
    return res.data;
  }

  async updateWebhook(webhookId: number, data: {
    url?: string;
    subscriptions?: string[];
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/webhooks/${webhookId}`, data);
    return res.data;
  }

  async deleteWebhook(webhookId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/webhooks/${webhookId}`);
  }

  // ─── Reports ─────────────────────────────────────────────

  async getAccountReport(params: {
    metric: string;
    type: string;
    since?: string;
    until?: string;
    id?: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const res = await http.get('/reports', { params });
    return res.data;
  }

  async getReportSummary(params: {
    since?: string;
    until?: string;
    type?: string;
    id?: string;
    group_by?: string;
    business_hours?: boolean;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const res = await http.get('/reports/summary', { params });
    return res.data;
  }

  // ─── Custom Attributes ───────────────────────────────────

  async listCustomAttributes(model?: string, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const params = model ? { attribute_model: model } : {};
    const res = await http.get('/custom_attribute_definitions', { params });
    return res.data;
  }

  async createCustomAttribute(data: {
    attribute_display_name: string;
    attribute_display_type: string;
    attribute_description?: string;
    attribute_key: string;
    attribute_model: string;
    attribute_values?: string[];
    default_value?: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/custom_attribute_definitions', data);
    return res.data;
  }

  async updateCustomAttribute(attributeId: number, data: {
    attribute_display_name?: string;
    attribute_description?: string;
    attribute_values?: string[];
    default_value?: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/custom_attribute_definitions/${attributeId}`, data);
    return res.data;
  }

  async deleteCustomAttribute(attributeId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/custom_attribute_definitions/${attributeId}`);
  }

  // ─── Automation Rules ─────────────────────────────────────

  async listAutomationRules(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/automation_rules');
    return res.data;
  }

  async getAutomationRule(ruleId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/automation_rules/${ruleId}`);
    return res.data;
  }

  async createAutomationRule(data: {
    name: string;
    description?: string;
    event_name: string;
    conditions: Array<Record<string, unknown>>;
    actions: Array<Record<string, unknown>>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/automation_rules', data);
    return res.data;
  }

  async updateAutomationRule(ruleId: number, data: {
    name?: string;
    description?: string;
    event_name?: string;
    conditions?: Array<Record<string, unknown>>;
    actions?: Array<Record<string, unknown>>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/automation_rules/${ruleId}`, data);
    return res.data;
  }

  async deleteAutomationRule(ruleId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/automation_rules/${ruleId}`);
  }

  // ─── Custom Filters ──────────────────────────────────────

  async listCustomFilters(filterType?: string, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const params = filterType ? { filter_type: filterType } : {};
    const res = await http.get('/custom_filters', { params });
    return res.data;
  }

  async getCustomFilter(filterId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/custom_filters/${filterId}`);
    return res.data;
  }

  async createCustomFilter(data: {
    name: string;
    filter_type: string;
    query: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/custom_filters', data);
    return res.data;
  }

  async updateCustomFilter(filterId: number, data: {
    name?: string;
    query?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/custom_filters/${filterId}`, data);
    return res.data;
  }

  async deleteCustomFilter(filterId: number, accountId?: number): Promise<void> {
    const http = this.forAccount(accountId);
    await http.delete(`/custom_filters/${filterId}`);
  }

  // ─── Conversations (filter) ─────────────────────────────

  async filterConversations(filters: Array<Record<string, unknown>>, page = 1, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/conversations/filter', { payload: filters, page });
    return res.data;
  }

  // ─── Contacts (merge) ─────────────────────────────────

  async mergeContacts(baseContactId: number, mergeeContactId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/actions/contact_merge', {
      base_contact_id: baseContactId,
      mergee_contact_id: mergeeContactId,
    });
    return res.data;
  }

  // ─── Inbox Members ─────────────────────────────────────

  async listInboxAgents(inboxId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/inbox_members/${inboxId}`);
    return res.data;
  }

  async addInboxAgents(inboxId: number, userIds: number[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/inbox_members', { inbox_id: inboxId, user_ids: userIds });
    return res.data;
  }

  async updateInboxAgents(inboxId: number, userIds: number[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch('/inbox_members', { inbox_id: inboxId, user_ids: userIds });
    return res.data;
  }

  async removeInboxAgents(inboxId: number, userIds: number[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.delete('/inbox_members', { data: { inbox_id: inboxId, user_ids: userIds } });
    return res.data;
  }

  // ─── Team Members (add/remove) ─────────────────────────

  async addTeamMembers(teamId: number, userIds: number[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/teams/${teamId}/team_members`, { user_ids: userIds });
    return res.data;
  }

  async removeTeamMembers(teamId: number, userIds: number[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.delete(`/teams/${teamId}/team_members`, { data: { user_ids: userIds } });
    return res.data;
  }

  // ─── Contact Labels ──────────────────────────────────────

  async getContactLabels(contactId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/contacts/${contactId}/labels`);
    return res.data;
  }

  async addLabelsToContact(contactId: number, labels: string[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/contacts/${contactId}/labels`, { labels });
    return res.data;
  }

  // ─── Conversation Custom Attributes ─────────────────────

  async setConversationCustomAttributes(
    conversationId: number,
    customAttributes: Record<string, unknown>,
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/conversations/${conversationId}/custom_attributes`, {
      custom_attributes: customAttributes,
    });
    return res.data;
  }

  // ─── Custom Attributes (get by ID) ─────────────────────

  async getCustomAttribute(attributeId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/custom_attribute_definitions/${attributeId}`);
    return res.data;
  }

  // ─── Integrations ──────────────────────────────────────

  async listIntegrations(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/integrations/apps');
    return res.data;
  }

  // ─── Inbox Agent Bot ──────────────────────────────────

  async getInboxAgentBot(inboxId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/inboxes/${inboxId}/agent_bot`);
    return res.data;
  }

  // ─── Contactable Inboxes ──────────────────────────────

  async getContactableInboxes(contactId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/contacts/${contactId}/contactable_inboxes`);
    return res.data;
  }

  // ─── Team Members (update) ────────────────────────────

  async updateTeamMembers(teamId: number, userIds: number[], accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/teams/${teamId}/team_members`, { user_ids: userIds });
    return res.data;
  }

  // ─── Reports v2 (additional) ──────────────────────────

  async getConversationStatistics(
    entityType: 'agent' | 'team' | 'inbox' | 'channel',
    params: { since?: string; until?: string; business_hours?: boolean },
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const res = await http.get(`/summary_reports/${entityType}`, { params });
    return res.data;
  }

  async getConversationMetrics(
    type: 'account' | 'agent',
    userId?: string,
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const params: Record<string, unknown> = { type };
    if (userId) params.user_id = userId;
    const res = await http.get('/reports/conversations', { params });
    return res.data;
  }

  async getFirstResponseTimeDistribution(
    params: { since?: string; until?: string },
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const res = await http.get('/reports/first_response_time_distribution', { params });
    return res.data;
  }

  async getInboxLabelMatrix(
    params: { since?: string; until?: string; inbox_ids?: number[]; label_ids?: number[] },
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const res = await http.get('/reports/inbox_label_matrix', { params });
    return res.data;
  }

  async getOutgoingMessagesCount(
    groupBy: 'agent' | 'team' | 'inbox' | 'label',
    params: { since?: string; until?: string },
    accountId?: number,
  ): Promise<unknown> {
    const http = this.forAccountV2(accountId);
    const res = await http.get('/reports/outgoing_messages_count', {
      params: { group_by: groupBy, ...params },
    });
    return res.data;
  }

  // ─── Profile ─────────────────────────────────────────────

  async getProfile(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/profile');
    return res.data;
  }

  // ─── Enterprise: Audit Logs ─────────────────────────────

  async listAuditLogs(page = 1, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/audit_logs', { params: { page } });
    return res.data;
  }

  // ─── Enterprise: Reporting Events ───────────────────────

  async getAccountReportingEvents(params: {
    page?: number;
    since?: string;
    until?: string;
    inbox_id?: number;
    user_id?: number;
    name?: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/reporting_events', { params });
    return res.data;
  }

  async getConversationReportingEvents(conversationId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/conversations/${conversationId}/reporting_events`);
    return res.data;
  }

  // ─── Enterprise: Account Agent Bots ─────────────────────

  async listAccountAgentBots(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/agent_bots');
    return res.data;
  }

  async getAccountAgentBot(botId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/agent_bots/${botId}`);
    return res.data;
  }

  async createAccountAgentBot(data: {
    name: string;
    description?: string;
    outgoing_url: string;
    avatar_url?: string;
    bot_type?: number;
    bot_config?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/agent_bots', data);
    return res.data;
  }

  async updateAccountAgentBot(botId: number, data: {
    name?: string;
    description?: string;
    outgoing_url?: string;
    avatar_url?: string;
    bot_type?: number;
    bot_config?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/agent_bots/${botId}`, data);
    return res.data;
  }

  async deleteAccountAgentBot(botId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.delete(`/agent_bots/${botId}`);
    return res.data;
  }

  // ─── Help Center: Portals ──────────────────────────────

  async listPortals(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/portals');
    return res.data;
  }

  async createPortal(data: {
    name: string;
    slug: string;
    color?: string;
    header_text?: string;
    page_title?: string;
    homepage_link?: string;
    custom_domain?: string;
    archived?: boolean;
    config?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post('/portals', data);
    return res.data;
  }

  async getPortal(portalId: string, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/portals/${portalId}`);
    return res.data;
  }

  async updatePortal(portalId: string, data: {
    name?: string;
    slug?: string;
    color?: string;
    header_text?: string;
    page_title?: string;
    homepage_link?: string;
    custom_domain?: string;
    archived?: boolean;
    config?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/portals/${portalId}`, data);
    return res.data;
  }

  async deletePortal(portalId: string, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.delete(`/portals/${portalId}`);
    return res.data;
  }

  // ─── Help Center: Articles ─────────────────────────────

  async listArticles(portalId: string, params: {
    page?: number;
    locale?: string;
    category_id?: number;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/portals/${portalId}/articles`, { params });
    return res.data;
  }

  async createArticle(portalId: string, data: {
    title: string;
    slug: string;
    content?: string;
    description?: string;
    category_id?: number;
    author_id?: number;
    position?: number;
    status?: number;
    locale?: string;
    associated_article_id?: number;
    meta?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/portals/${portalId}/articles`, data);
    return res.data;
  }

  async getArticle(portalId: string, articleId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/portals/${portalId}/articles/${articleId}`);
    return res.data;
  }

  async updateArticle(portalId: string, articleId: number, data: {
    title?: string;
    slug?: string;
    content?: string;
    description?: string;
    category_id?: number;
    position?: number;
    status?: number;
    locale?: string;
    meta?: Record<string, unknown>;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/portals/${portalId}/articles/${articleId}`, data);
    return res.data;
  }

  async deleteArticle(portalId: string, articleId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.delete(`/portals/${portalId}/articles/${articleId}`);
    return res.data;
  }

  // ─── Help Center: Categories ───────────────────────────

  async listCategories(portalId: string, params: {
    locale?: string;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/portals/${portalId}/categories`, { params });
    return res.data;
  }

  async createCategory(portalId: string, data: {
    name?: string;
    description?: string;
    slug?: string;
    position?: number;
    locale?: string;
    icon?: string;
    parent_category_id?: number;
    associated_category_id?: number;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.post(`/portals/${portalId}/categories`, data);
    return res.data;
  }

  async getCategory(portalId: string, categoryId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get(`/portals/${portalId}/categories/${categoryId}`);
    return res.data;
  }

  async updateCategory(portalId: string, categoryId: number, data: {
    name?: string;
    description?: string;
    slug?: string;
    position?: number;
    locale?: string;
    icon?: string;
    parent_category_id?: number;
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.patch(`/portals/${portalId}/categories/${categoryId}`, data);
    return res.data;
  }

  async deleteCategory(portalId: string, categoryId: number, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.delete(`/portals/${portalId}/categories/${categoryId}`);
    return res.data;
  }
}

export class ChatwootApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ChatwootApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
