import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ChatwootClient, ChatwootApiError } from '../api/client.js';
import { logger } from '../utils/logger.js';

type ToolArgs = Record<string, unknown>;

/** Tools blocked when MCP_SAFE_MODE=true */
const DESTRUCTIVE_TOOLS = new Set([
  'delete_contact',
  'delete_message',
  'delete_team',
  'delete_label',
  'delete_canned_response',
  'delete_webhook',
  'delete_custom_attribute',
  'delete_automation_rule',
  'delete_custom_filter',
  'remove_inbox_agents',
  'remove_team_members',
  'merge_contacts',
  'create_webhook',
  'update_webhook',
]);

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

/** Extract account_id from args (optional override) */
function acct(args: ToolArgs): number | undefined {
  return args.account_id as number | undefined;
}

export async function handleToolCall(
  client: ChatwootClient,
  toolName: string,
  args: ToolArgs,
): Promise<CallToolResult> {
  try {
    if (process.env.MCP_SAFE_MODE === 'true' && DESTRUCTIVE_TOOLS.has(toolName)) {
      logger.warn(`Safe mode blocked: ${toolName}`);
      return textResult(
        `Blocked by MCP_SAFE_MODE: "${toolName}" is a destructive operation. Set MCP_SAFE_MODE=false or remove it to use this tool.`,
        true,
      );
    }

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
      const result = await client.health(acct(args));
      return textResult(
        `Connected to Chatwoot successfully.\nAccount ID: ${result.accountId}\nAccount: ${result.accountName || 'OK'}`,
      );
    }

    // ─── Contacts ────────────────────────────────────────
    case 'list_contacts': {
      const data = await client.listContacts(
        args.page as number | undefined,
        args.sort as string | undefined,
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_contact': {
      const data = await client.getContact(args.contact_id as number, acct(args));
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
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_contact': {
      const contactId = args.contact_id as number;
      const updates: Record<string, unknown> = {};
      if (args.name !== undefined) updates.name = args.name;
      if (args.email !== undefined) updates.email = args.email;
      if (args.phone_number !== undefined) updates.phone_number = args.phone_number;
      if (args.custom_attributes !== undefined) updates.custom_attributes = args.custom_attributes;
      const data = await client.updateContact(contactId, updates, acct(args));
      return jsonResult(data);
    }

    case 'search_contacts': {
      const data = await client.searchContacts(
        args.query as string,
        args.page as number | undefined,
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_contact_conversations': {
      const data = await client.getContactConversations(args.contact_id as number, acct(args));
      return jsonResult(data);
    }

    case 'delete_contact': {
      await client.deleteContact(args.contact_id as number, acct(args));
      return textResult('Contact deleted successfully.');
    }

    case 'filter_contacts': {
      const data = await client.filterContacts(
        args.filters as Array<Record<string, unknown>>,
        args.page as number | undefined,
        acct(args),
      );
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
      }, acct(args));
      return jsonResult(data);
    }

    case 'get_conversation': {
      const data = await client.getConversation(args.conversation_id as number, acct(args));
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
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_conversation_status': {
      const data = await client.updateConversationStatus(
        args.conversation_id as number,
        args.status as 'open' | 'resolved' | 'pending' | 'snoozed',
        acct(args),
      );
      return jsonResult(data);
    }

    case 'assign_conversation': {
      const data = await client.assignConversation(
        args.conversation_id as number,
        args.assignee_id as number | undefined,
        args.team_id as number | undefined,
        acct(args),
      );
      return jsonResult(data);
    }

    case 'add_labels_to_conversation': {
      const data = await client.addLabelsToConversation(
        args.conversation_id as number,
        args.labels as string[],
        acct(args),
      );
      return jsonResult(data);
    }

    case 'set_conversation_priority': {
      const data = await client.toggleConversationPriority(
        args.conversation_id as number,
        args.priority as 'urgent' | 'high' | 'medium' | 'low' | 'none',
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_conversation_labels': {
      const data = await client.getConversationLabels(args.conversation_id as number, acct(args));
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
        acct(args),
      );
      return jsonResult(data);
    }

    case 'list_messages': {
      const data = await client.listMessages(args.conversation_id as number, acct(args));
      return jsonResult(data);
    }

    case 'delete_message': {
      await client.deleteMessage(
        args.conversation_id as number,
        args.message_id as number,
        acct(args),
      );
      return textResult('Message deleted successfully.');
    }

    // ─── Agents ──────────────────────────────────────────
    case 'list_agents': {
      const data = await client.listAgents(acct(args));
      return jsonResult(data);
    }

    case 'get_agent': {
      const data = await client.getAgent(args.agent_id as number, acct(args));
      return jsonResult(data);
    }

    // ─── Teams ───────────────────────────────────────────
    case 'list_teams': {
      const data = await client.listTeams(acct(args));
      return jsonResult(data);
    }

    case 'get_team': {
      const data = await client.getTeam(args.team_id as number, acct(args));
      return jsonResult(data);
    }

    case 'get_team_members': {
      const data = await client.getTeamMembers(args.team_id as number, acct(args));
      return jsonResult(data);
    }

    case 'create_team': {
      const data = await client.createTeam({
        name: args.name as string,
        description: args.description as string | undefined,
        allow_auto_assign: args.allow_auto_assign as boolean | undefined,
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_team': {
      const updates: { name?: string; description?: string; allow_auto_assign?: boolean } = {};
      if (args.name !== undefined) updates.name = args.name as string;
      if (args.description !== undefined) updates.description = args.description as string;
      if (args.allow_auto_assign !== undefined) updates.allow_auto_assign = args.allow_auto_assign as boolean;
      const data = await client.updateTeam(args.team_id as number, updates, acct(args));
      return jsonResult(data);
    }

    case 'delete_team': {
      await client.deleteTeam(args.team_id as number, acct(args));
      return textResult('Team deleted successfully.');
    }

    // ─── Inboxes ─────────────────────────────────────────
    case 'list_inboxes': {
      const data = await client.listInboxes(acct(args));
      return jsonResult(data);
    }

    case 'get_inbox': {
      const data = await client.getInbox(args.inbox_id as number, acct(args));
      return jsonResult(data);
    }

    // ─── Labels ──────────────────────────────────────────
    case 'list_labels': {
      const data = await client.listLabels(acct(args));
      return jsonResult(data);
    }

    case 'create_label': {
      const data = await client.createLabel({
        title: args.title as string,
        description: args.description as string | undefined,
        color: args.color as string | undefined,
        show_on_sidebar: args.show_on_sidebar as boolean | undefined,
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_label': {
      const updates: { title?: string; description?: string; color?: string; show_on_sidebar?: boolean } = {};
      if (args.title !== undefined) updates.title = args.title as string;
      if (args.description !== undefined) updates.description = args.description as string;
      if (args.color !== undefined) updates.color = args.color as string;
      if (args.show_on_sidebar !== undefined) updates.show_on_sidebar = args.show_on_sidebar as boolean;
      const data = await client.updateLabel(args.label_id as number, updates, acct(args));
      return jsonResult(data);
    }

    case 'delete_label': {
      await client.deleteLabel(args.label_id as number, acct(args));
      return textResult('Label deleted successfully.');
    }

    // ─── Canned Responses ────────────────────────────────
    case 'list_canned_responses': {
      const data = await client.listCannedResponses(acct(args));
      return jsonResult(data);
    }

    case 'create_canned_response': {
      const data = await client.createCannedResponse({
        short_code: args.short_code as string,
        content: args.content as string,
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_canned_response': {
      const updates: { short_code?: string; content?: string } = {};
      if (args.short_code !== undefined) updates.short_code = args.short_code as string;
      if (args.content !== undefined) updates.content = args.content as string;
      const data = await client.updateCannedResponse(args.canned_response_id as number, updates, acct(args));
      return jsonResult(data);
    }

    case 'delete_canned_response': {
      await client.deleteCannedResponse(args.canned_response_id as number, acct(args));
      return textResult('Canned response deleted successfully.');
    }

    // ─── Reports ─────────────────────────────────────────
    case 'get_account_report': {
      const data = await client.getAccountReport({
        metric: args.metric as string,
        type: args.type as string,
        since: args.since as string | undefined,
        until: args.until as string | undefined,
        id: args.id as string | undefined,
      }, acct(args));
      return jsonResult(data);
    }

    case 'get_report_summary': {
      const data = await client.getReportSummary({
        since: args.since as string | undefined,
        until: args.until as string | undefined,
        type: args.type as string | undefined,
        id: args.id as string | undefined,
        group_by: args.group_by as string | undefined,
        business_hours: args.business_hours as boolean | undefined,
      }, acct(args));
      return jsonResult(data);
    }

    case 'get_conversation_counts': {
      const data = await client.getConversationCounts(args.status as string | undefined, acct(args));
      return jsonResult(data);
    }

    // ─── Webhooks ────────────────────────────────────────
    case 'list_webhooks': {
      const data = await client.listWebhooks(acct(args));
      return jsonResult(data);
    }

    case 'create_webhook': {
      const data = await client.createWebhook({
        url: args.url as string,
        subscriptions: args.subscriptions as string[],
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_webhook': {
      const updates: { url?: string; subscriptions?: string[] } = {};
      if (args.url !== undefined) updates.url = args.url as string;
      if (args.subscriptions !== undefined) updates.subscriptions = args.subscriptions as string[];
      const data = await client.updateWebhook(args.webhook_id as number, updates, acct(args));
      return jsonResult(data);
    }

    case 'delete_webhook': {
      await client.deleteWebhook(args.webhook_id as number, acct(args));
      return textResult('Webhook deleted successfully.');
    }

    // ─── Custom Attributes ───────────────────────────────
    case 'list_custom_attributes': {
      const data = await client.listCustomAttributes(args.model as string | undefined, acct(args));
      return jsonResult(data);
    }

    case 'create_custom_attribute': {
      const data = await client.createCustomAttribute({
        attribute_display_name: args.attribute_display_name as string,
        attribute_display_type: args.attribute_display_type as string,
        attribute_description: args.attribute_description as string | undefined,
        attribute_key: args.attribute_key as string,
        attribute_model: args.attribute_model as string,
        attribute_values: args.attribute_values as string[] | undefined,
        default_value: args.default_value as string | undefined,
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_custom_attribute': {
      const updates: Record<string, unknown> = {};
      if (args.attribute_display_name !== undefined) updates.attribute_display_name = args.attribute_display_name;
      if (args.attribute_description !== undefined) updates.attribute_description = args.attribute_description;
      if (args.attribute_values !== undefined) updates.attribute_values = args.attribute_values;
      if (args.default_value !== undefined) updates.default_value = args.default_value;
      const data = await client.updateCustomAttribute(
        args.attribute_id as number,
        updates as { attribute_display_name?: string; attribute_description?: string; attribute_values?: string[]; default_value?: string },
        acct(args),
      );
      return jsonResult(data);
    }

    case 'delete_custom_attribute': {
      await client.deleteCustomAttribute(args.attribute_id as number, acct(args));
      return textResult('Custom attribute deleted successfully.');
    }

    // ─── Automation Rules ────────────────────────────────
    case 'list_automation_rules': {
      const data = await client.listAutomationRules(acct(args));
      return jsonResult(data);
    }

    case 'get_automation_rule': {
      const data = await client.getAutomationRule(args.rule_id as number, acct(args));
      return jsonResult(data);
    }

    case 'create_automation_rule': {
      const data = await client.createAutomationRule({
        name: args.name as string,
        description: args.description as string | undefined,
        event_name: args.event_name as string,
        conditions: args.conditions as Array<Record<string, unknown>>,
        actions: args.actions as Array<Record<string, unknown>>,
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_automation_rule': {
      const updates: Record<string, unknown> = {};
      if (args.name !== undefined) updates.name = args.name;
      if (args.description !== undefined) updates.description = args.description;
      if (args.event_name !== undefined) updates.event_name = args.event_name;
      if (args.conditions !== undefined) updates.conditions = args.conditions;
      if (args.actions !== undefined) updates.actions = args.actions;
      const data = await client.updateAutomationRule(
        args.rule_id as number,
        updates as { name?: string; description?: string; event_name?: string; conditions?: Array<Record<string, unknown>>; actions?: Array<Record<string, unknown>> },
        acct(args),
      );
      return jsonResult(data);
    }

    case 'delete_automation_rule': {
      await client.deleteAutomationRule(args.rule_id as number, acct(args));
      return textResult('Automation rule deleted successfully.');
    }

    // ─── Custom Filters ─────────────────────────────────
    case 'list_custom_filters': {
      const data = await client.listCustomFilters(args.filter_type as string | undefined, acct(args));
      return jsonResult(data);
    }

    case 'get_custom_filter': {
      const data = await client.getCustomFilter(args.filter_id as number, acct(args));
      return jsonResult(data);
    }

    case 'create_custom_filter': {
      const data = await client.createCustomFilter({
        name: args.name as string,
        filter_type: args.filter_type as string,
        query: args.query as Record<string, unknown>,
      }, acct(args));
      return jsonResult(data);
    }

    case 'update_custom_filter': {
      const updates: { name?: string; query?: Record<string, unknown> } = {};
      if (args.name !== undefined) updates.name = args.name as string;
      if (args.query !== undefined) updates.query = args.query as Record<string, unknown>;
      const data = await client.updateCustomFilter(args.filter_id as number, updates, acct(args));
      return jsonResult(data);
    }

    case 'delete_custom_filter': {
      await client.deleteCustomFilter(args.filter_id as number, acct(args));
      return textResult('Custom filter deleted successfully.');
    }

    // ─── Conversations (filter) ──────────────────────────
    case 'filter_conversations': {
      const data = await client.filterConversations(
        args.filters as Array<Record<string, unknown>>,
        args.page as number | undefined,
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Contacts (merge) ────────────────────────────────
    case 'merge_contacts': {
      const data = await client.mergeContacts(
        args.base_contact_id as number,
        args.mergee_contact_id as number,
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Inbox Members ───────────────────────────────────
    case 'list_inbox_agents': {
      const data = await client.listInboxAgents(args.inbox_id as number, acct(args));
      return jsonResult(data);
    }

    case 'add_inbox_agents': {
      const data = await client.addInboxAgents(
        args.inbox_id as number,
        args.user_ids as number[],
        acct(args),
      );
      return jsonResult(data);
    }

    case 'update_inbox_agents': {
      const data = await client.updateInboxAgents(
        args.inbox_id as number,
        args.user_ids as number[],
        acct(args),
      );
      return jsonResult(data);
    }

    case 'remove_inbox_agents': {
      const data = await client.removeInboxAgents(
        args.inbox_id as number,
        args.user_ids as number[],
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Team Members ────────────────────────────────────
    case 'add_team_members': {
      const data = await client.addTeamMembers(
        args.team_id as number,
        args.user_ids as number[],
        acct(args),
      );
      return jsonResult(data);
    }

    case 'remove_team_members': {
      const data = await client.removeTeamMembers(
        args.team_id as number,
        args.user_ids as number[],
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Contact Labels ─────────────────────────────────
    case 'get_contact_labels': {
      const data = await client.getContactLabels(args.contact_id as number, acct(args));
      return jsonResult(data);
    }

    case 'add_labels_to_contact': {
      const data = await client.addLabelsToContact(
        args.contact_id as number,
        args.labels as string[],
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Conversation Custom Attributes ──────────────────
    case 'set_conversation_custom_attributes': {
      const data = await client.setConversationCustomAttributes(
        args.conversation_id as number,
        args.custom_attributes as Record<string, unknown>,
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Custom Attributes (get by ID) ──────────────────
    case 'get_custom_attribute': {
      const data = await client.getCustomAttribute(args.attribute_id as number, acct(args));
      return jsonResult(data);
    }

    // ─── Integrations ────────────────────────────────────
    case 'list_integrations': {
      const data = await client.listIntegrations(acct(args));
      return jsonResult(data);
    }

    // ─── Inbox Agent Bot ─────────────────────────────────
    case 'get_inbox_agent_bot': {
      const data = await client.getInboxAgentBot(args.inbox_id as number, acct(args));
      return jsonResult(data);
    }

    // ─── Contactable Inboxes ─────────────────────────────
    case 'get_contactable_inboxes': {
      const data = await client.getContactableInboxes(args.contact_id as number, acct(args));
      return jsonResult(data);
    }

    // ─── Team Members (update) ───────────────────────────
    case 'update_team_members': {
      const data = await client.updateTeamMembers(
        args.team_id as number,
        args.user_ids as number[],
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Reports v2 (additional) ─────────────────────────
    case 'get_conversation_statistics': {
      const data = await client.getConversationStatistics(
        args.entity_type as 'agent' | 'team' | 'inbox' | 'channel',
        {
          since: args.since as string | undefined,
          until: args.until as string | undefined,
          business_hours: args.business_hours as boolean | undefined,
        },
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_conversation_metrics': {
      const data = await client.getConversationMetrics(
        args.type as 'account' | 'agent',
        args.user_id as string | undefined,
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_first_response_time_report': {
      const data = await client.getFirstResponseTimeDistribution(
        {
          since: args.since as string | undefined,
          until: args.until as string | undefined,
        },
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_inbox_label_matrix_report': {
      const data = await client.getInboxLabelMatrix(
        {
          since: args.since as string | undefined,
          until: args.until as string | undefined,
          inbox_ids: args.inbox_ids as number[] | undefined,
          label_ids: args.label_ids as number[] | undefined,
        },
        acct(args),
      );
      return jsonResult(data);
    }

    case 'get_outgoing_messages_report': {
      const data = await client.getOutgoingMessagesCount(
        args.group_by as 'agent' | 'team' | 'inbox' | 'label',
        {
          since: args.since as string | undefined,
          until: args.until as string | undefined,
        },
        acct(args),
      );
      return jsonResult(data);
    }

    // ─── Profile ─────────────────────────────────────────
    case 'get_profile': {
      const data = await client.getProfile(acct(args));
      return jsonResult(data);
    }

    default:
      return textResult(`Unknown tool: ${toolName}`, true);
  }
}
