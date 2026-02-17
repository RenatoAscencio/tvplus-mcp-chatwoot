import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient, ChatwootApiError } from '../../api/client.js';
import { logger } from '../../utils/logger.js';

type ToolArgs = Record<string, unknown>;

/** Help Center destructive tools blocked by MCP_SAFE_MODE */
const HELPCENTER_DESTRUCTIVE_TOOLS = new Set([
  'helpcenter_delete_portal',
  'helpcenter_delete_article',
  'helpcenter_delete_category',
]);

function textResult(content: string, isError = false): CallToolResult {
  return { content: [{ type: 'text', text: content }], isError };
}

function jsonResult(data: unknown): CallToolResult {
  return textResult(JSON.stringify(data, null, 2));
}

function errorResult(error: unknown): CallToolResult {
  if (error instanceof ChatwootApiError) {
    return textResult(`Chatwoot API Error (${error.statusCode}): ${error.message}`, true);
  }
  const message = error instanceof Error ? error.message : String(error);
  return textResult(`Error: ${message}`, true);
}

function acct(args: ToolArgs): number | undefined {
  return args.account_id as number | undefined;
}

export async function handleHelpCenterToolCall(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
  safeMode: boolean,
): Promise<CallToolResult> {
  try {
    if (safeMode && HELPCENTER_DESTRUCTIVE_TOOLS.has(toolName)) {
      logger.warn(`Safe mode blocked: ${toolName}`);
      return textResult(
        `Blocked by MCP_SAFE_MODE: "${toolName}" is a destructive operation. Set MCP_SAFE_MODE=false to use this tool.`,
        true,
      );
    }

    logger.debug(`Help Center tool call: ${toolName}`, args);
    return await dispatchHelpCenter(client, toolName, args);
  } catch (error) {
    logger.error(`Help Center tool error: ${toolName}`, error);
    return errorResult(error);
  }
}

async function dispatchHelpCenter(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  switch (toolName) {
    // ─── Portals ───────────────────────────────────────
    case 'helpcenter_list_portals': {
      const result = await client.listPortals(acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_create_portal': {
      const { account_id, ...data } = args;
      const result = await client.createPortal(data as Parameters<typeof client.createPortal>[0], acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_get_portal': {
      const result = await client.getPortal(args.portal_id as string, acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_update_portal': {
      const { portal_id, account_id, ...data } = args;
      const result = await client.updatePortal(portal_id as string, data as Parameters<typeof client.updatePortal>[1], acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_delete_portal': {
      const result = await client.deletePortal(args.portal_id as string, acct(args));
      return jsonResult(result);
    }

    // ─── Articles ──────────────────────────────────────
    case 'helpcenter_list_articles': {
      const result = await client.listArticles(args.portal_id as string, {
        page: args.page as number | undefined,
        locale: args.locale as string | undefined,
        category_id: args.category_id as number | undefined,
      }, acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_create_article': {
      const { portal_id, account_id, ...data } = args;
      const result = await client.createArticle(portal_id as string, data as Parameters<typeof client.createArticle>[1], acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_get_article': {
      const result = await client.getArticle(args.portal_id as string, args.article_id as number, acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_update_article': {
      const { portal_id, article_id, account_id, ...data } = args;
      const result = await client.updateArticle(portal_id as string, article_id as number, data as Parameters<typeof client.updateArticle>[2], acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_delete_article': {
      const result = await client.deleteArticle(args.portal_id as string, args.article_id as number, acct(args));
      return jsonResult(result);
    }

    // ─── Categories ────────────────────────────────────
    case 'helpcenter_list_categories': {
      const result = await client.listCategories(args.portal_id as string, {
        locale: args.locale as string | undefined,
      }, acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_create_category': {
      const { portal_id, account_id, ...data } = args;
      const result = await client.createCategory(portal_id as string, data as Parameters<typeof client.createCategory>[1], acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_get_category': {
      const result = await client.getCategory(args.portal_id as string, args.category_id as number, acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_update_category': {
      const { portal_id, category_id, account_id, ...data } = args;
      const result = await client.updateCategory(portal_id as string, category_id as number, data as Parameters<typeof client.updateCategory>[2], acct(args));
      return jsonResult(result);
    }

    case 'helpcenter_delete_category': {
      const result = await client.deleteCategory(args.portal_id as string, args.category_id as number, acct(args));
      return jsonResult(result);
    }

    default:
      return textResult(`Unknown help center tool: ${toolName}`, true);
  }
}
