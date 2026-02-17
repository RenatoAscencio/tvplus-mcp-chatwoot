import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger.js';

export class ChatwootPublicClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Creates an axios instance scoped to a specific inbox */
  private forInbox(inboxIdentifier: string): AxiosInstance {
    const instance = axios.create({
      baseURL: `${this.baseUrl}/public/api/v1/inboxes/${inboxIdentifier}`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data as Record<string, unknown> | undefined;
        const message = (data?.message as string) || (data?.error as string) || error.message;
        logger.error(`Public API error: ${status} ${message}`, {
          url: error.config?.url,
          method: error.config?.method,
        });
        throw new PublicApiError(status || 500, message, data);
      },
    );

    return instance;
  }

  // ─── Contacts ────────────────────────────────────────────

  async createContact(inboxIdentifier: string, data: {
    identifier?: string;
    identifier_hash?: string;
    email?: string;
    name?: string;
    phone_number?: string;
    avatar_url?: string;
    custom_attributes?: Record<string, unknown>;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.post('/contacts', data);
    return res.data;
  }

  async getContact(inboxIdentifier: string, contactIdentifier: string): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.get(`/contacts/${contactIdentifier}`);
    return res.data;
  }

  async updateContact(inboxIdentifier: string, contactIdentifier: string, data: {
    name?: string;
    email?: string;
    phone_number?: string;
    avatar_url?: string;
    custom_attributes?: Record<string, unknown>;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.patch(`/contacts/${contactIdentifier}`, data);
    return res.data;
  }

  // ─── Conversations ──────────────────────────────────────

  async createConversation(inboxIdentifier: string, data: {
    contact_identifier: string;
    custom_attributes?: Record<string, unknown>;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.post('/conversations', data);
    return res.data;
  }

  async listConversations(inboxIdentifier: string, contactIdentifier: string): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.get('/conversations', {
      params: { contact_identifier: contactIdentifier },
    });
    return res.data;
  }

  async getConversation(inboxIdentifier: string, conversationId: number): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.get(`/conversations/${conversationId}`);
    return res.data;
  }

  async resolveConversation(inboxIdentifier: string, conversationId: number): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.post(`/conversations/${conversationId}/toggle_status`);
    return res.data;
  }

  async toggleTyping(inboxIdentifier: string, conversationId: number, data: {
    typing_status: 'on' | 'off';
    contact_identifier: string;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.post(`/conversations/${conversationId}/toggle_typing`, data);
    return res.data;
  }

  async updateLastSeen(inboxIdentifier: string, conversationId: number, data: {
    contact_identifier: string;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.post(`/conversations/${conversationId}/update_last_seen`, data);
    return res.data;
  }

  // ─── Messages ───────────────────────────────────────────

  async createMessage(inboxIdentifier: string, conversationId: number, data: {
    content: string;
    echo_id?: string;
    contact_identifier: string;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.post(`/conversations/${conversationId}/messages`, data);
    return res.data;
  }

  async listMessages(inboxIdentifier: string, conversationId: number): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.get(`/conversations/${conversationId}/messages`);
    return res.data;
  }

  async updateMessage(inboxIdentifier: string, conversationId: number, messageId: number, data: {
    submitted_values?: Record<string, unknown>;
  }): Promise<unknown> {
    const http = this.forInbox(inboxIdentifier);
    const res = await http.patch(`/conversations/${conversationId}/messages/${messageId}`, data);
    return res.data;
  }
}

export class PublicApiError extends Error {
  statusCode: number;
  data?: Record<string, unknown>;

  constructor(statusCode: number, message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'PublicApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}
