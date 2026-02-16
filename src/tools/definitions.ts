import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  // ─── Health ──────────────────────────────────────────────
  {
    name: 'chatwoot_health',
    description:
      'Test connection to the Chatwoot instance and return account information. Use this to verify the MCP server is properly configured.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },

  // ─── Contacts ────────────────────────────────────────────
  {
    name: 'list_contacts',
    description:
      'List contacts in the Chatwoot account with pagination. Returns contact name, email, phone, and metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        sort: {
          type: 'string',
          description: 'Sort field',
          enum: ['name', 'email', 'phone_number', 'last_activity_at', 'created_at'],
        },
      },
    },
  },
  {
    name: 'get_contact',
    description: 'Get detailed information about a specific contact by their ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID' },
      },
      required: ['contact_id'],
    },
  },
  {
    name: 'create_contact',
    description:
      'Create a new contact in Chatwoot. At least one of name, email, or phone_number is recommended.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Contact name' },
        email: { type: 'string', description: 'Contact email address' },
        phone_number: {
          type: 'string',
          description: 'Phone number with country code (e.g., +5212345678)',
        },
        identifier: { type: 'string', description: 'Custom unique identifier' },
        inbox_id: { type: 'number', description: 'Inbox to associate the contact with' },
        custom_attributes: {
          type: 'object',
          description: 'Custom attributes as key-value pairs',
        },
      },
    },
  },
  {
    name: 'update_contact',
    description: 'Update an existing contact. Only provided fields will be updated.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID to update' },
        name: { type: 'string', description: 'New name' },
        email: { type: 'string', description: 'New email' },
        phone_number: { type: 'string', description: 'New phone number' },
        custom_attributes: { type: 'object', description: 'Custom attributes to set' },
      },
      required: ['contact_id'],
    },
  },
  {
    name: 'search_contacts',
    description:
      'Search contacts by name, email, phone number, or identifier. Returns matching contacts.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (name, email, phone, or identifier)' },
        page: { type: 'number', description: 'Page number (default: 1)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_contact_conversations',
    description: 'Get all conversations associated with a specific contact.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID' },
      },
      required: ['contact_id'],
    },
  },

  // ─── Conversations ──────────────────────────────────────
  {
    name: 'list_conversations',
    description:
      'List conversations with optional filters for status, assignee, inbox, team, and labels.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['open', 'resolved', 'pending', 'snoozed', 'all'],
        },
        assignee_type: {
          type: 'string',
          description: 'Filter by assignee type',
          enum: ['me', 'unassigned', 'all', 'assigned'],
        },
        inbox_id: { type: 'number', description: 'Filter by inbox ID' },
        team_id: { type: 'number', description: 'Filter by team ID' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by label names',
        },
        page: { type: 'number', description: 'Page number (default: 1)' },
      },
    },
  },
  {
    name: 'get_conversation',
    description:
      'Get detailed information about a specific conversation, including contact info, assignee, labels, and recent messages.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
      },
      required: ['conversation_id'],
    },
  },
  {
    name: 'create_conversation',
    description:
      'Create a new conversation. Requires an inbox_id. Optionally link to a contact and send an initial message.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'Inbox ID for the conversation' },
        contact_id: { type: 'number', description: 'Contact ID to associate' },
        message: { type: 'string', description: 'Initial message content' },
        status: {
          type: 'string',
          description: 'Initial status',
          enum: ['open', 'pending'],
        },
        assignee_id: { type: 'number', description: 'Agent ID to assign' },
        team_id: { type: 'number', description: 'Team ID to assign' },
      },
      required: ['inbox_id'],
    },
  },
  {
    name: 'update_conversation_status',
    description: 'Change the status of a conversation (open, resolved, pending, or snoozed).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        status: {
          type: 'string',
          description: 'New status',
          enum: ['open', 'resolved', 'pending', 'snoozed'],
        },
      },
      required: ['conversation_id', 'status'],
    },
  },
  {
    name: 'assign_conversation',
    description:
      'Assign a conversation to a specific agent, team, or both. Omit both to unassign.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        assignee_id: { type: 'number', description: 'Agent ID to assign (omit to unassign agent)' },
        team_id: { type: 'number', description: 'Team ID to assign (omit to unassign team)' },
      },
      required: ['conversation_id'],
    },
  },
  {
    name: 'add_labels_to_conversation',
    description: 'Add one or more labels to a conversation. Existing labels are preserved.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Label names to add',
        },
      },
      required: ['conversation_id', 'labels'],
    },
  },
  {
    name: 'set_conversation_priority',
    description: 'Set the priority level of a conversation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        priority: {
          type: 'string',
          description: 'Priority level',
          enum: ['urgent', 'high', 'medium', 'low', 'none'],
        },
      },
      required: ['conversation_id', 'priority'],
    },
  },

  // ─── Messages ────────────────────────────────────────────
  {
    name: 'send_message',
    description:
      'Send a message in a conversation. Can be a regular reply or a private note (visible only to agents).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        content: { type: 'string', description: 'Message content' },
        private: {
          type: 'boolean',
          description: 'If true, sends as a private note (only visible to agents). Default: false',
        },
        message_type: {
          type: 'string',
          description: 'Message type',
          enum: ['outgoing', 'incoming'],
        },
      },
      required: ['conversation_id', 'content'],
    },
  },
  {
    name: 'list_messages',
    description: 'Get all messages in a conversation, ordered chronologically.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
      },
      required: ['conversation_id'],
    },
  },

  // ─── Agents ──────────────────────────────────────────────
  {
    name: 'list_agents',
    description:
      'List all agents in the Chatwoot account with their roles and availability status.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },

  // ─── Teams ───────────────────────────────────────────────
  {
    name: 'list_teams',
    description: 'List all teams in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_team_members',
    description: 'Get the list of agents in a specific team.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID' },
      },
      required: ['team_id'],
    },
  },

  // ─── Inboxes ─────────────────────────────────────────────
  {
    name: 'list_inboxes',
    description:
      'List all inboxes (channels) in the Chatwoot account. Shows channel type, name, and configuration.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },

  // ─── Labels ──────────────────────────────────────────────
  {
    name: 'list_labels',
    description: 'List all labels available in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_label',
    description: 'Create a new label for categorizing conversations and contacts.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Label name' },
        description: { type: 'string', description: 'Label description' },
        color: { type: 'string', description: 'Hex color code (e.g., #FF0000)' },
        show_on_sidebar: {
          type: 'boolean',
          description: 'Show label on sidebar (default: true)',
        },
      },
      required: ['title'],
    },
  },

  // ─── Canned Responses ────────────────────────────────────
  {
    name: 'list_canned_responses',
    description:
      'List all canned (pre-written) responses. These are quick reply templates for agents.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_canned_response',
    description: 'Create a new canned response template for quick replies.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        short_code: {
          type: 'string',
          description: 'Short code to trigger this response (e.g., "greeting")',
        },
        content: { type: 'string', description: 'The response content text' },
      },
      required: ['short_code', 'content'],
    },
  },

  // ─── Reports ─────────────────────────────────────────────
  {
    name: 'get_account_report',
    description:
      'Get account-level reports and metrics. Includes conversation counts, response times, and resolution metrics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        metric: {
          type: 'string',
          description: 'The metric to retrieve',
          enum: [
            'conversations_count',
            'incoming_messages_count',
            'outgoing_messages_count',
            'avg_first_response_time',
            'avg_resolution_time',
            'resolutions_count',
            'reply_time',
          ],
        },
        type: {
          type: 'string',
          description: 'Report scope',
          enum: ['account', 'agent', 'inbox', 'label', 'team'],
        },
        since: { type: 'string', description: 'Start date (ISO 8601 format)' },
        until: { type: 'string', description: 'End date (ISO 8601 format)' },
      },
      required: ['metric', 'type'],
    },
  },

  // ─── Webhooks ────────────────────────────────────────────
  {
    name: 'list_webhooks',
    description: 'List all registered webhooks in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },

  // ─── Custom Attributes ───────────────────────────────────
  {
    name: 'list_custom_attributes',
    description:
      'List all custom attribute definitions. Can filter by model type (contact or conversation).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        model: {
          type: 'string',
          description: 'Filter by model type',
          enum: ['contact_attribute', 'conversation_attribute'],
        },
      },
    },
  },
];
