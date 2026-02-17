import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient } from './api/client.js';
import { ChatwootPublicClient } from './api/public-client.js';
import { ChatwootPlatformClient } from './api/platform-client.js';
import { getChatwootConfig, getPlatformConfig, getBucketConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { tools as coreTools } from './tools/definitions.js';
import { handleToolCall } from './tools/handlers.js';
import { publicTools } from './tools/public/definitions.js';
import { handlePublicToolCall } from './tools/public/handlers.js';
import { platformTools } from './tools/platform/definitions.js';
import { handlePlatformToolCall } from './tools/platform/handlers.js';
import { enterpriseTools } from './tools/enterprise/definitions.js';
import { handleEnterpriseToolCall } from './tools/enterprise/handlers.js';
import { helpCenterTools } from './tools/helpcenter/definitions.js';
import { handleHelpCenterToolCall } from './tools/helpcenter/handlers.js';

export function createServer(): Server {
  const config = getChatwootConfig();
  const client = new ChatwootClient(config);
  const buckets = getBucketConfig();

  // Build tool list based on enabled buckets
  const allTools: Tool[] = [...coreTools];

  // Public API client (no api_access_token needed)
  let publicClient: ChatwootPublicClient | null = null;
  if (buckets.publicApi) {
    publicClient = new ChatwootPublicClient(config.baseUrl);
    allTools.push(...publicTools);
    logger.info(`Public API bucket enabled: ${publicTools.length} tools`);
  }

  // Platform API client (separate token)
  let platformClient: ChatwootPlatformClient | null = null;
  if (buckets.platformApi) {
    const platformConfig = getPlatformConfig();
    if (platformConfig) {
      platformClient = new ChatwootPlatformClient(platformConfig);
      allTools.push(...platformTools);
      logger.info(`Platform API bucket enabled: ${platformTools.length} tools (safe_mode=${buckets.platformSafeMode})`);
    } else {
      logger.warn('MCP_ENABLE_PLATFORM_API=true but CHATWOOT_PLATFORM_API_TOKEN is not set — Platform bucket disabled');
    }
  }

  // Enterprise bucket (uses existing Application API client)
  if (buckets.enterprise) {
    allTools.push(...enterpriseTools);
    logger.info(`Enterprise bucket enabled: ${enterpriseTools.length} tools`);
  }

  // Help Center bucket (uses existing Application API client)
  if (buckets.helpCenter) {
    allTools.push(...helpCenterTools);
    logger.info(`Help Center bucket enabled: ${helpCenterTools.length} tools`);
  }

  // Build name→bucket lookup for routing
  const publicToolNames = new Set(publicTools.map((t) => t.name));
  const platformToolNames = new Set(platformTools.map((t) => t.name));
  const enterpriseToolNames = new Set(enterpriseTools.map((t) => t.name));
  const helpCenterToolNames = new Set(helpCenterTools.map((t) => t.name));

  const server = new Server(
    {
      name: 'tvplus-mcp-chatwoot',
      version: '0.6.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug(`Listing ${allTools.length} tools`);
    return { tools: allTools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const toolArgs = (args || {}) as Record<string, unknown>;
    logger.info(`Tool call: ${name}`);

    // Route to the correct bucket handler
    if (publicToolNames.has(name)) {
      if (!publicClient) {
        return {
          content: [{ type: 'text', text: 'Public API bucket is not enabled. Set MCP_ENABLE_PUBLIC_API=true.' }],
          isError: true,
        };
      }
      return handlePublicToolCall(publicClient, name, toolArgs);
    }

    if (platformToolNames.has(name)) {
      if (!platformClient) {
        return {
          content: [{ type: 'text', text: 'Platform API bucket is not enabled. Set MCP_ENABLE_PLATFORM_API=true and CHATWOOT_PLATFORM_API_TOKEN.' }],
          isError: true,
        };
      }
      return handlePlatformToolCall(platformClient, name, toolArgs, buckets.platformSafeMode);
    }

    if (enterpriseToolNames.has(name)) {
      if (!buckets.enterprise) {
        return {
          content: [{ type: 'text', text: 'Enterprise bucket is not enabled. Set MCP_ENABLE_ENTERPRISE=true.' }],
          isError: true,
        };
      }
      const safeMode = process.env.MCP_SAFE_MODE === 'true';
      return handleEnterpriseToolCall(client, name, toolArgs, safeMode);
    }

    if (helpCenterToolNames.has(name)) {
      if (!buckets.helpCenter) {
        return {
          content: [{ type: 'text', text: 'Help Center bucket is not enabled. Set MCP_ENABLE_HELP_CENTER=true.' }],
          isError: true,
        };
      }
      const safeMode = process.env.MCP_SAFE_MODE === 'true';
      return handleHelpCenterToolCall(client, name, toolArgs, safeMode);
    }

    // Default: core Application API tools
    return handleToolCall(client, name, toolArgs);
  });

  server.onerror = (error) => {
    logger.error('MCP Server error', error);
  };

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await server.close();
    process.exit(0);
  });

  return server;
}
