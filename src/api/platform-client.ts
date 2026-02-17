import axios, { AxiosInstance, AxiosError } from 'axios';
import { PlatformConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class ChatwootPlatformClient {
  private http: AxiosInstance;

  constructor(config: PlatformConfig) {
    this.http = axios.create({
      baseURL: `${config.baseUrl}/platform/api/v1`,
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
        logger.error(`Platform API error: ${status} ${message}`, {
          url: error.config?.url,
          method: error.config?.method,
        });
        throw new PlatformApiError(status || 500, message, data);
      },
    );
  }

  // ─── Accounts ──────────────────────────────────────────

  async createAccount(data: { name: string; locale?: string }): Promise<unknown> {
    const res = await this.http.post('/accounts', data);
    return res.data;
  }

  async getAccount(accountId: number): Promise<unknown> {
    const res = await this.http.get(`/accounts/${accountId}`);
    return res.data;
  }

  async updateAccount(accountId: number, data: { name?: string; locale?: string }): Promise<unknown> {
    const res = await this.http.patch(`/accounts/${accountId}`, data);
    return res.data;
  }

  async deleteAccount(accountId: number): Promise<unknown> {
    const res = await this.http.delete(`/accounts/${accountId}`);
    return res.data;
  }

  // ─── Agent Bots (Global) ──────────────────────────────

  async listAgentBots(): Promise<unknown> {
    const res = await this.http.get('/agent_bots');
    return res.data;
  }

  async createAgentBot(data: {
    name: string;
    description?: string;
    outgoing_url: string;
    avatar_url?: string;
  }): Promise<unknown> {
    const res = await this.http.post('/agent_bots', data);
    return res.data;
  }

  async getAgentBot(id: number): Promise<unknown> {
    const res = await this.http.get(`/agent_bots/${id}`);
    return res.data;
  }

  async updateAgentBot(id: number, data: {
    name?: string;
    description?: string;
    outgoing_url?: string;
    avatar_url?: string;
  }): Promise<unknown> {
    const res = await this.http.patch(`/agent_bots/${id}`, data);
    return res.data;
  }

  async deleteAgentBot(id: number): Promise<unknown> {
    const res = await this.http.delete(`/agent_bots/${id}`);
    return res.data;
  }

  // ─── Users ─────────────────────────────────────────────

  async createUser(data: {
    name: string;
    email: string;
    password?: string;
    custom_attributes?: Record<string, unknown>;
  }): Promise<unknown> {
    const res = await this.http.post('/users', data);
    return res.data;
  }

  async getUser(id: number): Promise<unknown> {
    const res = await this.http.get(`/users/${id}`);
    return res.data;
  }

  async updateUser(id: number, data: {
    name?: string;
    email?: string;
    password?: string;
    custom_attributes?: Record<string, unknown>;
  }): Promise<unknown> {
    const res = await this.http.patch(`/users/${id}`, data);
    return res.data;
  }

  async deleteUser(id: number): Promise<unknown> {
    const res = await this.http.delete(`/users/${id}`);
    return res.data;
  }

  async getUserSsoLink(id: number): Promise<unknown> {
    const res = await this.http.get(`/users/${id}/login`);
    return res.data;
  }

  // ─── Account Users ────────────────────────────────────

  async listAccountUsers(accountId: number): Promise<unknown> {
    const res = await this.http.get(`/accounts/${accountId}/account_users`);
    return res.data;
  }

  async createAccountUser(accountId: number, data: {
    user_id: number;
    role: 'agent' | 'administrator';
  }): Promise<unknown> {
    const res = await this.http.post(`/accounts/${accountId}/account_users`, data);
    return res.data;
  }

  async deleteAccountUser(accountId: number, data: { user_id: number }): Promise<unknown> {
    const res = await this.http.delete(`/accounts/${accountId}/account_users`, { data });
    return res.data;
  }
}

export class PlatformApiError extends Error {
  statusCode: number;
  data?: Record<string, unknown>;

  constructor(statusCode: number, message: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'PlatformApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}
