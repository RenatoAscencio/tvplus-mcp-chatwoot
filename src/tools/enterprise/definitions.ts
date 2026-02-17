import { Tool } from '@modelcontextprotocol/sdk/types.js';

const accountIdProperty = {
  account_id: {
    type: 'number',
    description:
      'Chatwoot account ID. If omitted, uses default from CHATWOOT_ACCOUNT_ID env var.',
  },
};

export const enterpriseTools: Tool[] = [
  // ─── Audit Logs ──────────────────────────────────────
  {
    name: 'enterprise_list_audit_logs',
    description:
      'List audit log entries for the account. Enterprise-only feature — requires audit_logs to be enabled.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        ...accountIdProperty,
      },
    },
  },

  // ─── Reporting Events ────────────────────────────────
  {
    name: 'enterprise_get_account_reporting_events',
    description:
      'Get raw reporting events (first_response, resolution, etc.) for the account. Admin-only.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        since: { type: 'string', description: 'Unix timestamp (seconds) — start of range' },
        until: { type: 'string', description: 'Unix timestamp (seconds) — end of range' },
        inbox_id: { type: 'number', description: 'Filter by inbox ID' },
        user_id: { type: 'number', description: 'Filter by user/agent ID' },
        name: {
          type: 'string',
          description: 'Event name filter (e.g. "first_response", "resolution")',
        },
        ...accountIdProperty,
      },
    },
  },
  {
    name: 'enterprise_get_conversation_reporting_events',
    description:
      'Get reporting events (first response time, resolution time, etc.) for a specific conversation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        ...accountIdProperty,
      },
      required: ['conversation_id'],
    },
  },

  // ─── Account Agent Bots ──────────────────────────────
  {
    name: 'enterprise_list_agent_bots',
    description:
      'List all agent bots scoped to the account (not global platform bots).',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },
  {
    name: 'enterprise_get_agent_bot',
    description:
      'Get details of an account-scoped agent bot by ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        bot_id: { type: 'number', description: 'The agent bot ID' },
        ...accountIdProperty,
      },
      required: ['bot_id'],
    },
  },
  {
    name: 'enterprise_create_agent_bot',
    description:
      'Create a new account-scoped agent bot.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Bot name' },
        description: { type: 'string', description: 'Bot description' },
        outgoing_url: { type: 'string', description: 'Webhook URL for the bot' },
        avatar_url: { type: 'string', description: 'Bot avatar URL' },
        bot_type: { type: 'number', description: 'Bot type (0 = webhook)' },
        bot_config: { type: 'object', description: 'Bot configuration object' },
        ...accountIdProperty,
      },
      required: ['name', 'outgoing_url'],
    },
  },
  {
    name: 'enterprise_update_agent_bot',
    description:
      'Update an account-scoped agent bot.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        bot_id: { type: 'number', description: 'The agent bot ID' },
        name: { type: 'string', description: 'Updated bot name' },
        description: { type: 'string', description: 'Updated description' },
        outgoing_url: { type: 'string', description: 'Updated webhook URL' },
        avatar_url: { type: 'string', description: 'Updated avatar URL' },
        bot_type: { type: 'number', description: 'Updated bot type' },
        bot_config: { type: 'object', description: 'Updated bot configuration' },
        ...accountIdProperty,
      },
      required: ['bot_id'],
    },
  },
  {
    name: 'enterprise_delete_agent_bot',
    description:
      'Delete an account-scoped agent bot. DESTRUCTIVE.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        bot_id: { type: 'number', description: 'The agent bot ID to delete' },
        ...accountIdProperty,
      },
      required: ['bot_id'],
    },
  },
];
