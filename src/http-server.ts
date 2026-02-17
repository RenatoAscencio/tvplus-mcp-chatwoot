import express from 'express';
import crypto from 'crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient } from './api/client.js';
import { ChatwootPublicClient } from './api/public-client.js';
import { ChatwootPlatformClient } from './api/platform-client.js';
import { getChatwootConfig, getPlatformConfig, getBucketConfig, getServerConfig } from './utils/config.js';
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

const SESSION_TIMEOUT = 5 * 60 * 1000;

interface SessionEntry {
  transport: StreamableHTTPServerTransport;
  server: Server;
  lastActivity: number;
}

export async function startHttpServer(): Promise<void> {
  const serverConfig = getServerConfig();
  const chatwootConfig = getChatwootConfig();
  const client = new ChatwootClient(chatwootConfig);
  const buckets = getBucketConfig();

  // Build tool list based on enabled buckets
  const allTools: Tool[] = [...coreTools];

  let publicClient: ChatwootPublicClient | null = null;
  if (buckets.publicApi) {
    publicClient = new ChatwootPublicClient(chatwootConfig.baseUrl);
    allTools.push(...publicTools);
  }

  let platformClient: ChatwootPlatformClient | null = null;
  if (buckets.platformApi) {
    const platformConfig = getPlatformConfig();
    if (platformConfig) {
      platformClient = new ChatwootPlatformClient(platformConfig);
      allTools.push(...platformTools);
    }
  }

  if (buckets.enterprise) allTools.push(...enterpriseTools);
  if (buckets.helpCenter) allTools.push(...helpCenterTools);

  // Name lookups for routing
  const publicToolNames = new Set(publicTools.map((t) => t.name));
  const platformToolNames = new Set(platformTools.map((t) => t.name));
  const enterpriseToolNames = new Set(enterpriseTools.map((t) => t.name));
  const helpCenterToolNames = new Set(helpCenterTools.map((t) => t.name));

  const sessions = new Map<string, SessionEntry>();
  const app = express();

  app.use(express.json());

  // CORS
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept, Mcp-Session-Id',
    );
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
    res.setHeader('Access-Control-Max-Age', '86400');
    next();
  });

  // Auth middleware for MCP endpoint
  function authMiddleware(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void {
    if (!serverConfig.authToken) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing Bearer token' });
      return;
    }

    const token = authHeader.slice(7);
    const expected = serverConfig.authToken;

    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expected);

    if (tokenBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    next();
  }

  /** Route tool call to the correct bucket handler */
  async function routeToolCall(name: string, toolArgs: Record<string, unknown>) {
    if (publicToolNames.has(name)) {
      if (!publicClient) {
        return { content: [{ type: 'text' as const, text: 'Public API bucket not enabled.' }], isError: true };
      }
      return handlePublicToolCall(publicClient, name, toolArgs);
    }
    if (platformToolNames.has(name)) {
      if (!platformClient) {
        return { content: [{ type: 'text' as const, text: 'Platform API bucket not enabled.' }], isError: true };
      }
      return handlePlatformToolCall(platformClient, name, toolArgs, buckets.platformSafeMode);
    }
    if (enterpriseToolNames.has(name)) {
      const safeMode = process.env.MCP_SAFE_MODE === 'true';
      return handleEnterpriseToolCall(client, name, toolArgs, safeMode);
    }
    if (helpCenterToolNames.has(name)) {
      const safeMode = process.env.MCP_SAFE_MODE === 'true';
      return handleHelpCenterToolCall(client, name, toolArgs, safeMode);
    }
    return handleToolCall(client, name, toolArgs);
  }

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      server: 'tvplus-mcp-chatwoot',
      version: '0.6.0',
      activeSessions: sessions.size,
      tools: allTools.length,
    });
  });

  // MCP endpoint
  app.post('/mcp', authMiddleware, async (req, res) => {
    const sessionId = (req.headers['mcp-session-id'] as string) || crypto.randomUUID();

    let session = sessions.get(sessionId);
    if (!session) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => sessionId,
      });

      const server = new Server(
        { name: 'tvplus-mcp-chatwoot', version: '0.6.0' },
        { capabilities: { tools: {} } },
      );

      server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: allTools }));

      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        logger.info(`[${sessionId.slice(0, 8)}] Tool call: ${name}`);
        return routeToolCall(name, (args || {}) as Record<string, unknown>);
      });

      await server.connect(transport);

      session = { transport, server, lastActivity: Date.now() };
      sessions.set(sessionId, session);
      logger.info(`New session: ${sessionId.slice(0, 8)}...`);
    }

    session.lastActivity = Date.now();

    try {
      await session.transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error(`Session ${sessionId.slice(0, 8)} request error`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Handle GET for SSE streams
  app.get('/mcp', authMiddleware, async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string;
    const session = sessionId ? sessions.get(sessionId) : undefined;
    if (!session) {
      res.status(400).json({ error: 'No active session. Send POST /mcp first.' });
      return;
    }
    session.lastActivity = Date.now();
    try {
      await session.transport.handleRequest(req, res);
    } catch (error) {
      logger.error('SSE stream error', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Handle DELETE for session cleanup
  app.delete('/mcp', authMiddleware, async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string;
    const session = sessionId ? sessions.get(sessionId) : undefined;
    if (session) {
      await session.server.close();
      sessions.delete(sessionId);
      logger.info(`Session closed: ${sessionId.slice(0, 8)}...`);
    }
    res.status(200).json({ ok: true });
  });

  // Session cleanup interval
  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        session.server.close().catch(() => {});
        sessions.delete(id);
        logger.debug(`Session expired: ${id.slice(0, 8)}...`);
      }
    }
  }, 60_000);

  app.listen(serverConfig.port, () => {
    logger.info(`HTTP server listening on port ${serverConfig.port}`);
    logger.info(`Health: http://localhost:${serverConfig.port}/health`);
    logger.info(`MCP:    http://localhost:${serverConfig.port}/mcp`);
    logger.info(`Tools:  ${allTools.length} total`);
  });
}
