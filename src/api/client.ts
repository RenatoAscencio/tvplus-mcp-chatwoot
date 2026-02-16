import axios, { AxiosInstance, AxiosError } from 'axios';
import { ChatwootConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class ChatwootClient {
  private http: AxiosInstance;
  private baseUrl: string;
  private defaultAccountId: number;
  private apiToken: string;

  constructor(config: ChatwootConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultAccountId = config.accountId;
    this.apiToken = config.apiToken;

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
  }

  /** Returns the axios instance scoped to a specific account (or default) */
  private forAccount(accountId?: number): AxiosInstance {
    if (!accountId || accountId === this.defaultAccountId) {
      return this.http;
    }
    // Create a one-off instance for the alternate account
    return axios.create({
      baseURL: `${this.baseUrl}/api/v1/accounts/${accountId}`,
      headers: {
        'api_access_token': this.apiToken,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  get currentAccountId(): number {
    return this.defaultAccountId;
  }

  // ─── Health ──────────────────────────────────────────────

  async health(accountId?: number): Promise<{ success: boolean; accountName?: string; accountId: number }> {
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
    const res = await http.put(`/contacts/${contactId}`, data);
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
  }, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/reports', { params });
    return res.data;
  }

  async getConversationCounts(accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const res = await http.get('/reports/agents/conversations');
    return res.data;
  }

  // ─── Custom Attributes ───────────────────────────────────

  async listCustomAttributes(model?: string, accountId?: number): Promise<unknown> {
    const http = this.forAccount(accountId);
    const params = model ? { attribute_model: model } : {};
    const res = await http.get('/custom_attribute_definitions', { params });
    return res.data;
  }

  // ─── Profile ─────────────────────────────────────────────

  async getProfile(): Promise<unknown> {
    const res = await this.http.get('/profile');
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
