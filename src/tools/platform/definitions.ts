import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const platformTools: Tool[] = [
  // ─── Accounts ────────────────────────────────────────
  {
    name: 'platform_create_account',
    description:
      'Create a new Chatwoot account via the Platform API. Requires CHATWOOT_PLATFORM_API_TOKEN.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Account name' },
        locale: { type: 'string', description: 'Account locale (e.g. "en")' },
      },
      required: ['name'],
    },
  },
  {
    name: 'platform_get_account',
    description:
      'Get account details via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'number', description: 'The account ID' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'platform_update_account',
    description:
      'Update an account via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'number', description: 'The account ID' },
        name: { type: 'string', description: 'Updated account name' },
        locale: { type: 'string', description: 'Updated locale' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'platform_delete_account',
    description:
      'Delete an account via the Platform API. DESTRUCTIVE — permanently removes the account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'number', description: 'The account ID to delete' },
      },
      required: ['account_id'],
    },
  },

  // ─── Agent Bots (Global) ────────────────────────────
  {
    name: 'platform_list_agent_bots',
    description:
      'List all global agent bots via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'platform_create_agent_bot',
    description:
      'Create a global agent bot via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Bot name' },
        description: { type: 'string', description: 'Bot description' },
        outgoing_url: { type: 'string', description: 'Webhook URL for the bot' },
        avatar_url: { type: 'string', description: 'Bot avatar URL' },
      },
      required: ['name', 'outgoing_url'],
    },
  },
  {
    name: 'platform_get_agent_bot',
    description:
      'Get a global agent bot by ID via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The agent bot ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'platform_update_agent_bot',
    description:
      'Update a global agent bot via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The agent bot ID' },
        name: { type: 'string', description: 'Updated bot name' },
        description: { type: 'string', description: 'Updated description' },
        outgoing_url: { type: 'string', description: 'Updated webhook URL' },
        avatar_url: { type: 'string', description: 'Updated avatar URL' },
      },
      required: ['id'],
    },
  },
  {
    name: 'platform_delete_agent_bot',
    description:
      'Delete a global agent bot via the Platform API. DESTRUCTIVE.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The agent bot ID to delete' },
      },
      required: ['id'],
    },
  },

  // ─── Users ──────────────────────────────────────────
  {
    name: 'platform_create_user',
    description:
      'Create a new user via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'User name' },
        email: { type: 'string', description: 'User email' },
        password: { type: 'string', description: 'User password' },
        custom_attributes: { type: 'object', description: 'Custom attributes' },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'platform_get_user',
    description:
      'Get a user by ID via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The user ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'platform_update_user',
    description:
      'Update a user via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The user ID' },
        name: { type: 'string', description: 'Updated name' },
        email: { type: 'string', description: 'Updated email' },
        password: { type: 'string', description: 'Updated password' },
        custom_attributes: { type: 'object', description: 'Updated custom attributes' },
      },
      required: ['id'],
    },
  },
  {
    name: 'platform_delete_user',
    description:
      'Delete a user via the Platform API. DESTRUCTIVE — permanently removes the user.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The user ID to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'platform_get_user_sso_link',
    description:
      'Get a single sign-on login link for a user via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'The user ID' },
      },
      required: ['id'],
    },
  },

  // ─── Account Users ──────────────────────────────────
  {
    name: 'platform_list_account_users',
    description:
      'List all users in an account via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'number', description: 'The account ID' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'platform_create_account_user',
    description:
      'Add a user to an account via the Platform API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'number', description: 'The account ID' },
        user_id: { type: 'number', description: 'The user ID to add' },
        role: {
          type: 'string',
          description: 'User role in the account',
          enum: ['agent', 'administrator'],
        },
      },
      required: ['account_id', 'user_id', 'role'],
    },
  },
  {
    name: 'platform_delete_account_user',
    description:
      'Remove a user from an account via the Platform API. DESTRUCTIVE.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'number', description: 'The account ID' },
        user_id: { type: 'number', description: 'The user ID to remove' },
      },
      required: ['account_id', 'user_id'],
    },
  },
];
