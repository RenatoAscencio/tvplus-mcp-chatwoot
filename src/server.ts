import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient } from './api/client.js';
import { getChatwootConfig } from './utils/config.js';
import { logger } from './utils/logger.js';
import { tools } from './tools/definitions.js';
import { handleToolCall } from './tools/handlers.js';

export function createServer(): Server {
  const config = getChatwootConfig();
  const client = new ChatwootClient(config);

  const server = new Server(
    {
      name: 'tvplus-mcp-chatwoot',
      version: '0.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug(`Listing ${tools.length} tools`);
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.info(`Tool call: ${name}`);
    return handleToolCall(client, name, (args || {}) as Record<string, unknown>);
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
