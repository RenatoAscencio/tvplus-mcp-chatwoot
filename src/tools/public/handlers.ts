import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ChatwootPublicClient, PublicApiError } from '../../api/public-client.js';
import { logger } from '../../utils/logger.js';

type ToolArgs = Record<string, unknown>;

function textResult(content: string, isError = false): CallToolResult {
  return { content: [{ type: 'text', text: content }], isError };
}

function jsonResult(data: unknown): CallToolResult {
  return textResult(JSON.stringify(data, null, 2));
}

function errorResult(error: unknown): CallToolResult {
  if (error instanceof PublicApiError) {
    return textResult(`Public API Error (${error.statusCode}): ${error.message}`, true);
  }
  const message = error instanceof Error ? error.message : String(error);
  return textResult(`Error: ${message}`, true);
}

function inbox(args: ToolArgs): string {
  return args.inbox_identifier as string;
}

export async function handlePublicToolCall(
  client: ChatwootPublicClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  try {
    logger.debug(`Public tool call: ${toolName}`, args);
    return await dispatchPublic(client, toolName, args);
  } catch (error) {
    logger.error(`Public tool error: ${toolName}`, error);
    return errorResult(error);
  }
}

async function dispatchPublic(
  client: ChatwootPublicClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  switch (toolName) {
    // ─── Contacts ──────────────────────────────────────
    case 'public_create_contact': {
      const { inbox_identifier, ...data } = args;
      const result = await client.createContact(inbox(args), data as Parameters<typeof client.createContact>[1]);
      return jsonResult(result);
    }

    case 'public_get_contact': {
      const result = await client.getContact(inbox(args), args.contact_identifier as string);
      return jsonResult(result);
    }

    case 'public_update_contact': {
      const { inbox_identifier, contact_identifier, ...data } = args;
      const result = await client.updateContact(
        inbox(args),
        contact_identifier as string,
        data as Parameters<typeof client.updateContact>[2],
      );
      return jsonResult(result);
    }

    // ─── Conversations ────────────────────────────────
    case 'public_create_conversation': {
      const result = await client.createConversation(inbox(args), {
        contact_identifier: args.contact_identifier as string,
        custom_attributes: args.custom_attributes as Record<string, unknown> | undefined,
      });
      return jsonResult(result);
    }

    case 'public_list_conversations': {
      const result = await client.listConversations(inbox(args), args.contact_identifier as string);
      return jsonResult(result);
    }

    case 'public_get_conversation': {
      const result = await client.getConversation(inbox(args), args.conversation_id as number);
      return jsonResult(result);
    }

    case 'public_resolve_conversation': {
      const result = await client.resolveConversation(inbox(args), args.conversation_id as number);
      return jsonResult(result);
    }

    case 'public_toggle_typing': {
      const result = await client.toggleTyping(inbox(args), args.conversation_id as number, {
        typing_status: args.typing_status as 'on' | 'off',
        contact_identifier: args.contact_identifier as string,
      });
      return jsonResult(result);
    }

    case 'public_update_last_seen': {
      const result = await client.updateLastSeen(inbox(args), args.conversation_id as number, {
        contact_identifier: args.contact_identifier as string,
      });
      return jsonResult(result);
    }

    // ─── Messages ─────────────────────────────────────
    case 'public_create_message': {
      const result = await client.createMessage(inbox(args), args.conversation_id as number, {
        content: args.content as string,
        echo_id: args.echo_id as string | undefined,
        contact_identifier: args.contact_identifier as string,
      });
      return jsonResult(result);
    }

    case 'public_list_messages': {
      const result = await client.listMessages(inbox(args), args.conversation_id as number);
      return jsonResult(result);
    }

    case 'public_update_message': {
      const result = await client.updateMessage(
        inbox(args),
        args.conversation_id as number,
        args.message_id as number,
        { submitted_values: args.submitted_values as Record<string, unknown> | undefined },
      );
      return jsonResult(result);
    }

    default:
      return textResult(`Unknown public tool: ${toolName}`, true);
  }
}
