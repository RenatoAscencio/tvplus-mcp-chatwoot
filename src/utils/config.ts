import dotenv from 'dotenv';

dotenv.config();

export interface ChatwootConfig {
  baseUrl: string;
  accountId?: number;
  apiToken: string;
}

export interface PlatformConfig {
  baseUrl: string;
  apiToken: string;
}

export interface BucketConfig {
  publicApi: boolean;
  platformApi: boolean;
  enterprise: boolean;
  helpCenter: boolean;
  platformSafeMode: boolean;
}

export interface ServerConfig {
  mode: 'stdio' | 'http';
  port: number;
  authToken?: string;
  logLevel: string;
  safeMode: boolean;
}

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getChatwootConfig(): ChatwootConfig {
  const rawAccountId = process.env.CHATWOOT_ACCOUNT_ID;
  return {
    baseUrl: requireEnv('CHATWOOT_BASE_URL').replace(/\/+$/, ''),
    accountId: rawAccountId ? parseInt(rawAccountId, 10) : undefined,
    apiToken: requireEnv('CHATWOOT_API_TOKEN'),
  };
}

export function getPlatformConfig(): PlatformConfig | null {
  const token = process.env.CHATWOOT_PLATFORM_API_TOKEN;
  if (!token) return null;
  return {
    baseUrl: requireEnv('CHATWOOT_BASE_URL').replace(/\/+$/, ''),
    apiToken: token,
  };
}

export function getBucketConfig(): BucketConfig {
  return {
    publicApi: process.env.MCP_ENABLE_PUBLIC_API === 'true',
    platformApi: process.env.MCP_ENABLE_PLATFORM_API === 'true',
    enterprise: process.env.MCP_ENABLE_ENTERPRISE === 'true',
    helpCenter: process.env.MCP_ENABLE_HELP_CENTER === 'true',
    platformSafeMode: process.env.MCP_PLATFORM_SAFE_MODE !== 'false',
  };
}

export function getServerConfig(): ServerConfig {
  return {
    mode: (process.env.MCP_MODE as 'stdio' | 'http') || 'stdio',
    port: parseInt(process.env.PORT || '3000', 10),
    authToken: process.env.AUTH_TOKEN,
    logLevel: process.env.LOG_LEVEL || 'info',
    safeMode: process.env.MCP_SAFE_MODE === 'true',
  };
}
