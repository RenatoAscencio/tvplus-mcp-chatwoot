import dotenv from 'dotenv';

dotenv.config();

export interface ChatwootConfig {
  baseUrl: string;
  accountId: number;
  apiToken: string;
}

export interface ServerConfig {
  mode: 'stdio' | 'http';
  port: number;
  authToken?: string;
  logLevel: string;
}

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getChatwootConfig(): ChatwootConfig {
  return {
    baseUrl: requireEnv('CHATWOOT_BASE_URL').replace(/\/+$/, ''),
    accountId: parseInt(requireEnv('CHATWOOT_ACCOUNT_ID'), 10),
    apiToken: requireEnv('CHATWOOT_API_TOKEN'),
  };
}

export function getServerConfig(): ServerConfig {
  return {
    mode: (process.env.MCP_MODE as 'stdio' | 'http') || 'stdio',
    port: parseInt(process.env.PORT || '3000', 10),
    authToken: process.env.AUTH_TOKEN,
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
