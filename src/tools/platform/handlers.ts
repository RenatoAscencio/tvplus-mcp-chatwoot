import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ChatwootPlatformClient, PlatformApiError } from '../../api/platform-client.js';
import { logger } from '../../utils/logger.js';

type ToolArgs = Record<string, unknown>;

/** Platform tools blocked when MCP_PLATFORM_SAFE_MODE is true (default) */
const PLATFORM_WRITE_TOOLS = new Set([
  'platform_create_account',
  'platform_update_account',
  'platform_delete_account',
  'platform_create_agent_bot',
  'platform_update_agent_bot',
  'platform_delete_agent_bot',
  'platform_create_user',
  'platform_update_user',
  'platform_delete_user',
  'platform_create_account_user',
  'platform_delete_account_user',
]);

function textResult(content: string, isError = false): CallToolResult {
  return { content: [{ type: 'text', text: content }], isError };
}

function jsonResult(data: unknown): CallToolResult {
  return textResult(JSON.stringify(data, null, 2));
}

function errorResult(error: unknown): CallToolResult {
  if (error instanceof PlatformApiError) {
    return textResult(`Platform API Error (${error.statusCode}): ${error.message}`, true);
  }
  const message = error instanceof Error ? error.message : String(error);
  return textResult(`Error: ${message}`, true);
}

export async function handlePlatformToolCall(
  client: ChatwootPlatformClient,
  toolName: string,
  args: ToolArgs,
  platformSafeMode: boolean,
): Promise<CallToolResult> {
  try {
    if (platformSafeMode && PLATFORM_WRITE_TOOLS.has(toolName)) {
      logger.warn(`Platform safe mode blocked: ${toolName}`);
      return textResult(
        `Blocked by MCP_PLATFORM_SAFE_MODE: "${toolName}" is a write/delete operation. Set MCP_PLATFORM_SAFE_MODE=false to use this tool.`,
        true,
      );
    }

    logger.debug(`Platform tool call: ${toolName}`, args);
    return await dispatchPlatform(client, toolName, args);
  } catch (error) {
    logger.error(`Platform tool error: ${toolName}`, error);
    return errorResult(error);
  }
}

async function dispatchPlatform(
  client: ChatwootPlatformClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  switch (toolName) {
    // ─── Accounts ──────────────────────────────────────
    case 'platform_create_account': {
      const result = await client.createAccount({
        name: args.name as string,
        locale: args.locale as string | undefined,
      });
      return jsonResult(result);
    }

    case 'platform_get_account': {
      const result = await client.getAccount(args.account_id as number);
      return jsonResult(result);
    }

    case 'platform_update_account': {
      const { account_id, ...data } = args;
      const result = await client.updateAccount(account_id as number, data as Parameters<typeof client.updateAccount>[1]);
      return jsonResult(result);
    }

    case 'platform_delete_account': {
      const result = await client.deleteAccount(args.account_id as number);
      return jsonResult(result);
    }

    // ─── Agent Bots ────────────────────────────────────
    case 'platform_list_agent_bots': {
      const result = await client.listAgentBots();
      return jsonResult(result);
    }

    case 'platform_create_agent_bot': {
      const result = await client.createAgentBot({
        name: args.name as string,
        description: args.description as string | undefined,
        outgoing_url: args.outgoing_url as string,
        avatar_url: args.avatar_url as string | undefined,
      });
      return jsonResult(result);
    }

    case 'platform_get_agent_bot': {
      const result = await client.getAgentBot(args.id as number);
      return jsonResult(result);
    }

    case 'platform_update_agent_bot': {
      const { id, ...data } = args;
      const result = await client.updateAgentBot(id as number, data as Parameters<typeof client.updateAgentBot>[1]);
      return jsonResult(result);
    }

    case 'platform_delete_agent_bot': {
      const result = await client.deleteAgentBot(args.id as number);
      return jsonResult(result);
    }

    // ─── Users ─────────────────────────────────────────
    case 'platform_create_user': {
      const result = await client.createUser({
        name: args.name as string,
        email: args.email as string,
        password: args.password as string | undefined,
        custom_attributes: args.custom_attributes as Record<string, unknown> | undefined,
      });
      return jsonResult(result);
    }

    case 'platform_get_user': {
      const result = await client.getUser(args.id as number);
      return jsonResult(result);
    }

    case 'platform_update_user': {
      const { id, ...data } = args;
      const result = await client.updateUser(id as number, data as Parameters<typeof client.updateUser>[1]);
      return jsonResult(result);
    }

    case 'platform_delete_user': {
      const result = await client.deleteUser(args.id as number);
      return jsonResult(result);
    }

    case 'platform_get_user_sso_link': {
      const result = await client.getUserSsoLink(args.id as number);
      return jsonResult(result);
    }

    // ─── Account Users ─────────────────────────────────
    case 'platform_list_account_users': {
      const result = await client.listAccountUsers(args.account_id as number);
      return jsonResult(result);
    }

    case 'platform_create_account_user': {
      const result = await client.createAccountUser(args.account_id as number, {
        user_id: args.user_id as number,
        role: args.role as 'agent' | 'administrator',
      });
      return jsonResult(result);
    }

    case 'platform_delete_account_user': {
      const result = await client.deleteAccountUser(args.account_id as number, {
        user_id: args.user_id as number,
      });
      return jsonResult(result);
    }

    default:
      return textResult(`Unknown platform tool: ${toolName}`, true);
  }
}
