import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient, ChatwootApiError } from '../api/client.js';
import { logger } from '../utils/logger.js';

type ToolArgs = Record<string, unknown>;

function textResult(content: string, isError = false): CallToolResult {
  return {
    content: [{ type: 'text', text: content }],
    isError,
  };
}

function jsonResult(data: unknown): CallToolResult {
  return textResult(JSON.stringify(data, null, 2));
}

function errorResult(error: unknown): CallToolResult {
  if (error instanceof ChatwootApiError) {
    return textResult(
      `Chatwoot API Error (${error.statusCode}): ${error.message}`,
      true,
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return textResult(`Error: ${message}`, true);
}

export async function handleToolCall(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  try {
    logger.debug(`Tool call: ${toolName}`, args);
    const result = await dispatch(client, toolName, args);
    return result;
  } catch (error) {
    logger.error(`Tool error: ${toolName}`, error);
    return errorResult(error);
  }
}

async function dispatch(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  switch (toolName) {
    // ─── Health ──────────────────────────────────────────
    case 'chatwoot_health': {
      const result = await client.health();
      return textResult(
        `Connected to Chatwoot successfully.\nAccount: ${result.accountName || 'OK'}`,
      );
    }

    // ─── Contacts ────────────────────────────────────────
    case 'list_contacts': {
      const data = await client.listContacts(
        args.page as number | undefined,
        args.sort as string | undefined,
      );
      return jsonResult(data);
    }

    case 'get_contact': {
      const data = await client.getContact(args.contact_id as number);
      return jsonResult(data);
    }

    case 'create_contact': {
      const data = await client.createContact({
        name: args.name as string | undefined,
        email: args.email as string | undefined,
        phone_number: args.phone_number as string | undefined,
        identifier: args.identifier as string | undefined,
        inbox_id: args.inbox_id as number | undefined,
        custom_attributes: args.custom_attributes as Record<string, unknown> | undefined,
      });
      return jsonResult(data);
    }

    case 'update_contact': {
      const contactId = args.contact_id as number;
      const updates: Record<string, unknown> = {};
      if (args.name !== undefined) updates.name = args.name;
      if (args.email !== undefined) updates.email = args.email;
      if (args.phone_number !== undefined) updates.phone_number = args.phone_number;
      if (args.custom_attributes !== undefined) updates.custom_attributes = args.custom_attributes;
      const data = await client.updateContact(contactId, updates);
      return jsonResult(data);
    }

    case 'search_contacts': {
      const data = await client.searchContacts(
        args.query as string,
        args.page as number | undefined,
      );
      return jsonResult(data);
    }

    case 'get_contact_conversations': {
      const data = await client.getContactConversations(args.contact_id as number);
      return jsonResult(data);
    }

    // ─── Conversations ──────────────────────────────────
    case 'list_conversations': {
      const data = await client.listConversations({
        status: args.status as string | undefined,
        assignee_type: args.assignee_type as string | undefined,
        inbox_id: args.inbox_id as number | undefined,
        team_id: args.team_id as number | undefined,
        labels: args.labels as string[] | undefined,
        page: args.page as number | undefined,
      });
      return jsonResult(data);
    }

    case 'get_conversation': {
      const data = await client.getConversation(args.conversation_id as number);
      return jsonResult(data);
    }

    case 'create_conversation': {
      const data = await client.createConversation({
        inbox_id: args.inbox_id as number,
        contact_id: args.contact_id as number | undefined,
        message: args.message ? { content: args.message as string } : undefined,
        status: args.status as string | undefined,
        assignee_id: args.assignee_id as number | undefined,
        team_id: args.team_id as number | undefined,
      });
      return jsonResult(data);
    }

    case 'update_conversation_status': {
      const data = await client.updateConversationStatus(
        args.conversation_id as number,
        args.status as 'open' | 'resolved' | 'pending' | 'snoozed',
      );
      return jsonResult(data);
    }

    case 'assign_conversation': {
      const data = await client.assignConversation(
        args.conversation_id as number,
        args.assignee_id as number | undefined,
        args.team_id as number | undefined,
      );
      return jsonResult(data);
    }

    case 'add_labels_to_conversation': {
      const data = await client.addLabelsToConversation(
        args.conversation_id as number,
        args.labels as string[],
      );
      return jsonResult(data);
    }

    case 'set_conversation_priority': {
      const data = await client.toggleConversationPriority(
        args.conversation_id as number,
        args.priority as 'urgent' | 'high' | 'medium' | 'low' | 'none',
      );
      return jsonResult(data);
    }

    // ─── Messages ────────────────────────────────────────
    case 'send_message': {
      const data = await client.sendMessage(
        args.conversation_id as number,
        args.content as string,
        {
          private: args.private as boolean | undefined,
          message_type: args.message_type as 'outgoing' | 'incoming' | undefined,
        },
      );
      return jsonResult(data);
    }

    case 'list_messages': {
      const data = await client.listMessages(args.conversation_id as number);
      return jsonResult(data);
    }

    // ─── Agents ──────────────────────────────────────────
    case 'list_agents': {
      const data = await client.listAgents();
      return jsonResult(data);
    }

    // ─── Teams ───────────────────────────────────────────
    case 'list_teams': {
      const data = await client.listTeams();
      return jsonResult(data);
    }

    case 'get_team_members': {
      const data = await client.getTeamMembers(args.team_id as number);
      return jsonResult(data);
    }

    // ─── Inboxes ─────────────────────────────────────────
    case 'list_inboxes': {
      const data = await client.listInboxes();
      return jsonResult(data);
    }

    // ─── Labels ──────────────────────────────────────────
    case 'list_labels': {
      const data = await client.listLabels();
      return jsonResult(data);
    }

    case 'create_label': {
      const data = await client.createLabel({
        title: args.title as string,
        description: args.description as string | undefined,
        color: args.color as string | undefined,
        show_on_sidebar: args.show_on_sidebar as boolean | undefined,
      });
      return jsonResult(data);
    }

    // ─── Canned Responses ────────────────────────────────
    case 'list_canned_responses': {
      const data = await client.listCannedResponses();
      return jsonResult(data);
    }

    case 'create_canned_response': {
      const data = await client.createCannedResponse({
        short_code: args.short_code as string,
        content: args.content as string,
      });
      return jsonResult(data);
    }

    // ─── Reports ─────────────────────────────────────────
    case 'get_account_report': {
      const data = await client.getAccountReport({
        metric: args.metric as string,
        type: args.type as string,
        since: args.since as string | undefined,
        until: args.until as string | undefined,
      });
      return jsonResult(data);
    }

    // ─── Webhooks ────────────────────────────────────────
    case 'list_webhooks': {
      const data = await client.listWebhooks();
      return jsonResult(data);
    }

    // ─── Custom Attributes ───────────────────────────────
    case 'list_custom_attributes': {
      const data = await client.listCustomAttributes(args.model as string | undefined);
      return jsonResult(data);
    }

    default:
      return textResult(`Unknown tool: ${toolName}`, true);
  }
}
