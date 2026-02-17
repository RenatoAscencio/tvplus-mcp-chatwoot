import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient, ChatwootApiError } from '../../api/client.js';
import { logger } from '../../utils/logger.js';

type ToolArgs = Record<string, unknown>;

/** Enterprise destructive tools blocked by MCP_SAFE_MODE */
const ENTERPRISE_DESTRUCTIVE_TOOLS = new Set([
  'enterprise_create_agent_bot',
  'enterprise_update_agent_bot',
  'enterprise_delete_agent_bot',
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

export async function handleEnterpriseToolCall(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
  safeMode: boolean,
): Promise<CallToolResult> {
  try {
    if (safeMode && ENTERPRISE_DESTRUCTIVE_TOOLS.has(toolName)) {
      logger.warn(`Safe mode blocked: ${toolName}`);
      return textResult(
        `Blocked by MCP_SAFE_MODE: "${toolName}" is a destructive operation. Set MCP_SAFE_MODE=false to use this tool.`,
        true,
      );
    }

    logger.debug(`Enterprise tool call: ${toolName}`, args);
    return await dispatchEnterprise(client, toolName, args);
  } catch (error) {
    logger.error(`Enterprise tool error: ${toolName}`, error);
    return errorResult(error);
  }
}

async function dispatchEnterprise(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  switch (toolName) {
    // ─── Audit Logs ──────────────────────────────────
    case 'enterprise_list_audit_logs': {
      const result = await client.listAuditLogs(args.page as number | undefined, acct(args));
      return jsonResult(result);
    }

    // ─── Reporting Events ────────────────────────────
    case 'enterprise_get_account_reporting_events': {
      const result = await client.getAccountReportingEvents({
        page: args.page as number | undefined,
        since: args.since as string | undefined,
        until: args.until as string | undefined,
        inbox_id: args.inbox_id as number | undefined,
        user_id: args.user_id as number | undefined,
        name: args.name as string | undefined,
      }, acct(args));
      return jsonResult(result);
    }

    case 'enterprise_get_conversation_reporting_events': {
      const result = await client.getConversationReportingEvents(
        args.conversation_id as number,
        acct(args),
      );
      return jsonResult(result);
    }

    // ─── Account Agent Bots ──────────────────────────
    case 'enterprise_list_agent_bots': {
      const result = await client.listAccountAgentBots(acct(args));
      return jsonResult(result);
    }

    case 'enterprise_get_agent_bot': {
      const result = await client.getAccountAgentBot(args.bot_id as number, acct(args));
      return jsonResult(result);
    }

    case 'enterprise_create_agent_bot': {
      const result = await client.createAccountAgentBot({
        name: args.name as string,
        description: args.description as string | undefined,
        outgoing_url: args.outgoing_url as string,
        avatar_url: args.avatar_url as string | undefined,
        bot_type: args.bot_type as number | undefined,
        bot_config: args.bot_config as Record<string, unknown> | undefined,
      }, acct(args));
      return jsonResult(result);
    }

    case 'enterprise_update_agent_bot': {
      const { bot_id, account_id, ...data } = args;
      const result = await client.updateAccountAgentBot(
        bot_id as number,
        data as Parameters<typeof client.updateAccountAgentBot>[1],
        acct(args),
      );
      return jsonResult(result);
    }

    case 'enterprise_delete_agent_bot': {
      const result = await client.deleteAccountAgentBot(args.bot_id as number, acct(args));
      return jsonResult(result);
    }

    default:
      return textResult(`Unknown enterprise tool: ${toolName}`, true);
  }
}
