#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { getServerConfig } from './utils/config.js';
import { startHttpServer } from './http-server.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  const config = getServerConfig();

  if (config.mode === 'http') {
    logger.info('Starting in HTTP mode...');
    await startHttpServer();
  } else {
    logger.info('Starting in STDIO mode...');
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('MCP server connected via STDIO');
  }
}

main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
