import axios, { AxiosInstance, AxiosError } from 'axios';
import { ChatwootConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class ChatwootClient {
  private http: AxiosInstance;
  private accountId: number;

  constructor(config: ChatwootConfig) {
    this.accountId = config.accountId;

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

  // ─── Health ──────────────────────────────────────────────

  async health(): Promise<{ success: boolean; accountName?: string }> {
    const res = await this.http.get('/');
    return { success: true, accountName: res.data?.name };
  }

  // ─── Contacts ────────────────────────────────────────────

  async listContacts(page = 1, sortBy = 'name'): Promise<unknown> {
    const res = await this.http.get('/contacts', { params: { page, sort: sortBy } });
    return res.data;
  }

  async getContact(contactId: number): Promise<unknown> {
    const res = await this.http.get(`/contacts/${contactId}`);
    return res.data;
  }

  async createContact(data: {
    name?: string;
    email?: string;
    phone_number?: string;
    identifier?: string;
    inbox_id?: number;
    custom_attributes?: Record<string, unknown>;
  }): Promise<unknown> {
    const res = await this.http.post('/contacts', data);
    return res.data;
  }

  async updateContact(contactId: number, data: Record<string, unknown>): Promise<unknown> {
    const res = await this.http.put(`/contacts/${contactId}`, data);
    return res.data;
  }

  async searchContacts(query: string, page = 1): Promise<unknown> {
    const res = await this.http.get('/contacts/search', { params: { q: query, page } });
    return res.data;
  }

  async filterContacts(filters: Array<Record<string, unknown>>, page = 1): Promise<unknown> {
    const res = await this.http.post('/contacts/filter', { payload: filters, page });
    return res.data;
  }

  async getContactConversations(contactId: number): Promise<unknown> {
    const res = await this.http.get(`/contacts/${contactId}/conversations`);
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
  } = {}): Promise<unknown> {
    const res = await this.http.get('/conversations', { params });
    return res.data;
  }

  async getConversation(conversationId: number): Promise<unknown> {
    const res = await this.http.get(`/conversations/${conversationId}`);
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
  }): Promise<unknown> {
    const res = await this.http.post('/conversations', data);
    return res.data;
  }

  async updateConversationStatus(
    conversationId: number,
    status: 'open' | 'resolved' | 'pending' | 'snoozed',
  ): Promise<unknown> {
    const res = await this.http.post(`/conversations/${conversationId}/toggle_status`, {
      status,
    });
    return res.data;
  }

  async assignConversation(
    conversationId: number,
    assigneeId?: number,
    teamId?: number,
  ): Promise<unknown> {
    const res = await this.http.post(`/conversations/${conversationId}/assignments`, {
      assignee_id: assigneeId,
      team_id: teamId,
    });
    return res.data;
  }

  async addLabelsToConversation(
    conversationId: number,
    labels: string[],
  ): Promise<unknown> {
    const current = await this.getConversation(conversationId) as { labels?: string[] };
    const merged = [...new Set([...(current.labels || []), ...labels])];
    const res = await this.http.post(`/conversations/${conversationId}/labels`, {
      labels: merged,
    });
    return res.data;
  }

  async getConversationLabels(conversationId: number): Promise<unknown> {
    const res = await this.http.get(`/conversations/${conversationId}/labels`);
    return res.data;
  }

  async toggleConversationPriority(
    conversationId: number,
    priority: 'urgent' | 'high' | 'medium' | 'low' | 'none',
  ): Promise<unknown> {
    const res = await this.http.patch(`/conversations/${conversationId}`, { priority });
    return res.data;
  }

  // ─── Messages ────────────────────────────────────────────

  async listMessages(conversationId: number): Promise<unknown> {
    const res = await this.http.get(`/conversations/${conversationId}/messages`);
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
  ): Promise<unknown> {
    const res = await this.http.post(`/conversations/${conversationId}/messages`, {
      content,
      message_type: options.message_type || 'outgoing',
      private: options.private || false,
      content_type: options.content_type || 'text',
      content_attributes: options.content_attributes,
    });
    return res.data;
  }

  async deleteMessage(conversationId: number, messageId: number): Promise<void> {
    await this.http.delete(`/conversations/${conversationId}/messages/${messageId}`);
  }

  // ─── Agents ──────────────────────────────────────────────

  async listAgents(): Promise<unknown> {
    const res = await this.http.get('/agents');
    return res.data;
  }

  async getAgent(agentId: number): Promise<unknown> {
    const res = await this.http.get(`/agents/${agentId}`);
    return res.data;
  }

  // ─── Teams ───────────────────────────────────────────────

  async listTeams(): Promise<unknown> {
    const res = await this.http.get('/teams');
    return res.data;
  }

  async getTeam(teamId: number): Promise<unknown> {
    const res = await this.http.get(`/teams/${teamId}`);
    return res.data;
  }

  async getTeamMembers(teamId: number): Promise<unknown> {
    const res = await this.http.get(`/teams/${teamId}/team_members`);
    return res.data;
  }

  // ─── Inboxes ─────────────────────────────────────────────

  async listInboxes(): Promise<unknown> {
    const res = await this.http.get('/inboxes');
    return res.data;
  }

  async getInbox(inboxId: number): Promise<unknown> {
    const res = await this.http.get(`/inboxes/${inboxId}`);
    return res.data;
  }

  // ─── Labels ──────────────────────────────────────────────

  async listLabels(): Promise<unknown> {
    const res = await this.http.get('/labels');
    return res.data;
  }

  async createLabel(data: {
    title: string;
    description?: string;
    color?: string;
    show_on_sidebar?: boolean;
  }): Promise<unknown> {
    const res = await this.http.post('/labels', data);
    return res.data;
  }

  // ─── Canned Responses ────────────────────────────────────

  async listCannedResponses(): Promise<unknown> {
    const res = await this.http.get('/canned_responses');
    return res.data;
  }

  async createCannedResponse(data: {
    short_code: string;
    content: string;
  }): Promise<unknown> {
    const res = await this.http.post('/canned_responses', data);
    return res.data;
  }

  // ─── Webhooks ────────────────────────────────────────────

  async listWebhooks(): Promise<unknown> {
    const res = await this.http.get('/webhooks');
    return res.data;
  }

  async createWebhook(data: {
    url: string;
    subscriptions: string[];
  }): Promise<unknown> {
    const res = await this.http.post('/webhooks', data);
    return res.data;
  }

  async deleteWebhook(webhookId: number): Promise<void> {
    await this.http.delete(`/webhooks/${webhookId}`);
  }

  // ─── Reports ─────────────────────────────────────────────

  async getAccountReport(params: {
    metric: string;
    type: string;
    since?: string;
    until?: string;
  }): Promise<unknown> {
    const res = await this.http.get('/reports', { params });
    return res.data;
  }

  async getConversationCounts(): Promise<unknown> {
    const res = await this.http.get('/reports/agents/conversations');
    return res.data;
  }

  // ─── Custom Attributes ───────────────────────────────────

  async listCustomAttributes(model?: string): Promise<unknown> {
    const params = model ? { attribute_model: model } : {};
    const res = await this.http.get('/custom_attribute_definitions', { params });
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
