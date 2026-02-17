import { Tool } from '@modelcontextprotocol/sdk/types.js';

const accountIdProperty = {
  account_id: {
    type: 'number',
    description:
      'Chatwoot account ID to use. If omitted, uses the default account from CHATWOOT_ACCOUNT_ID env var.',
  },
};

export const tools: Tool[] = [
  // ─── Health ──────────────────────────────────────────────
  {
    name: 'chatwoot_health',
    description:
      'Test connection to the Chatwoot instance and return account information. Use this to verify the MCP server is properly configured.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
        ...accountIdProperty,
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
      properties: { ...accountIdProperty },
    },
  },

  // ─── Teams ───────────────────────────────────────────────
  {
    name: 'list_teams',
    description: 'List all teams in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },
  {
    name: 'get_team_members',
    description: 'Get the list of agents in a specific team.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID' },
        ...accountIdProperty,
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
      properties: { ...accountIdProperty },
    },
  },

  // ─── Labels ──────────────────────────────────────────────
  {
    name: 'list_labels',
    description: 'List all labels available in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
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
        ...accountIdProperty,
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
      properties: { ...accountIdProperty },
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
        ...accountIdProperty,
      },
      required: ['short_code', 'content'],
    },
  },

  // ─── Reports ─────────────────────────────────────────────
  {
    name: 'get_account_report',
    description:
      'Get account-level reports and metrics (via API v2). Includes conversation counts, response times, and resolution metrics.',
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
          ],
        },
        type: {
          type: 'string',
          description: 'Report scope',
          enum: ['account', 'agent', 'inbox', 'label', 'team'],
        },
        id: { type: 'string', description: 'Entity ID when type is agent/inbox/label/team' },
        since: { type: 'string', description: 'Start timestamp (Unix timestamp or ISO 8601)' },
        until: { type: 'string', description: 'End timestamp (Unix timestamp or ISO 8601)' },
        ...accountIdProperty,
      },
      required: ['metric', 'type'],
    },
  },

  // ─── Contacts (additional) ──────────────────────────────
  {
    name: 'delete_contact',
    description: 'Permanently delete a contact and all associated data.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID to delete' },
        ...accountIdProperty,
      },
      required: ['contact_id'],
    },
  },
  {
    name: 'filter_contacts',
    description:
      'Filter contacts using advanced query conditions. Each filter has field, operator, and value.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filters: {
          type: 'array',
          items: { type: 'object' },
          description:
            'Array of filter objects with field, filter_operator, and values (e.g., [{"attribute_key":"city","filter_operator":"equal_to","values":["Paris"]}])',
        },
        page: { type: 'number', description: 'Page number (default: 1)' },
        ...accountIdProperty,
      },
      required: ['filters'],
    },
  },

  // ─── Conversations (additional) ───────────────────────
  {
    name: 'get_conversation_labels',
    description: 'Get all labels currently applied to a conversation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        ...accountIdProperty,
      },
      required: ['conversation_id'],
    },
  },
  {
    name: 'get_conversation_counts',
    description:
      'Get conversation count statistics grouped by status (open, pending, resolved, etc.).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          description: 'Optional status filter',
          enum: ['open', 'resolved', 'pending', 'snoozed', 'all'],
        },
        ...accountIdProperty,
      },
    },
  },

  // ─── Messages (additional) ────────────────────────────
  {
    name: 'delete_message',
    description: 'Delete a specific message from a conversation.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        message_id: { type: 'number', description: 'The message ID to delete' },
        ...accountIdProperty,
      },
      required: ['conversation_id', 'message_id'],
    },
  },

  // ─── Agents (additional) ──────────────────────────────
  {
    name: 'get_agent',
    description: 'Get detailed information about a specific agent by their ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agent_id: { type: 'number', description: 'The agent ID' },
        ...accountIdProperty,
      },
      required: ['agent_id'],
    },
  },

  // ─── Teams (additional) ───────────────────────────────
  {
    name: 'get_team',
    description: 'Get detailed information about a specific team.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID' },
        ...accountIdProperty,
      },
      required: ['team_id'],
    },
  },
  {
    name: 'create_team',
    description: 'Create a new team in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Team name' },
        description: { type: 'string', description: 'Team description' },
        allow_auto_assign: {
          type: 'boolean',
          description: 'Allow automatic assignment of conversations (default: true)',
        },
        ...accountIdProperty,
      },
      required: ['name'],
    },
  },
  {
    name: 'update_team',
    description: 'Update an existing team. Only provided fields will be updated.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID to update' },
        name: { type: 'string', description: 'New team name' },
        description: { type: 'string', description: 'New description' },
        allow_auto_assign: { type: 'boolean', description: 'Allow auto-assign' },
        ...accountIdProperty,
      },
      required: ['team_id'],
    },
  },
  {
    name: 'delete_team',
    description: 'Delete a team from the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID to delete' },
        ...accountIdProperty,
      },
      required: ['team_id'],
    },
  },

  // ─── Inboxes (additional) ─────────────────────────────
  {
    name: 'get_inbox',
    description: 'Get detailed information about a specific inbox including channel configuration.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'The inbox ID' },
        ...accountIdProperty,
      },
      required: ['inbox_id'],
    },
  },

  // ─── Labels (additional) ──────────────────────────────
  {
    name: 'update_label',
    description: 'Update an existing label. Only provided fields will be updated.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        label_id: { type: 'number', description: 'The label ID to update' },
        title: { type: 'string', description: 'New label title' },
        description: { type: 'string', description: 'New description' },
        color: { type: 'string', description: 'New hex color code (e.g., #FF0000)' },
        show_on_sidebar: { type: 'boolean', description: 'Show on sidebar' },
        ...accountIdProperty,
      },
      required: ['label_id'],
    },
  },
  {
    name: 'delete_label',
    description: 'Delete a label from the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        label_id: { type: 'number', description: 'The label ID to delete' },
        ...accountIdProperty,
      },
      required: ['label_id'],
    },
  },

  // ─── Canned Responses (additional) ────────────────────
  {
    name: 'update_canned_response',
    description: 'Update an existing canned response template.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        canned_response_id: { type: 'number', description: 'The canned response ID' },
        short_code: { type: 'string', description: 'New short code' },
        content: { type: 'string', description: 'New response content' },
        ...accountIdProperty,
      },
      required: ['canned_response_id'],
    },
  },
  {
    name: 'delete_canned_response',
    description: 'Delete a canned response template.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        canned_response_id: { type: 'number', description: 'The canned response ID to delete' },
        ...accountIdProperty,
      },
      required: ['canned_response_id'],
    },
  },

  // ─── Webhooks ────────────────────────────────────────────
  {
    name: 'list_webhooks',
    description: 'List all registered webhooks in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },
  {
    name: 'create_webhook',
    description:
      'Register a new webhook endpoint to receive event notifications from Chatwoot.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'The webhook endpoint URL' },
        subscriptions: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Events to subscribe to (e.g., ["conversation_created", "message_created", "conversation_status_changed"])',
        },
        ...accountIdProperty,
      },
      required: ['url', 'subscriptions'],
    },
  },
  {
    name: 'update_webhook',
    description: 'Update an existing webhook URL or subscriptions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        webhook_id: { type: 'number', description: 'The webhook ID to update' },
        url: { type: 'string', description: 'New webhook URL' },
        subscriptions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated event subscriptions',
        },
        ...accountIdProperty,
      },
      required: ['webhook_id'],
    },
  },
  {
    name: 'delete_webhook',
    description: 'Remove a webhook subscription.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        webhook_id: { type: 'number', description: 'The webhook ID to delete' },
        ...accountIdProperty,
      },
      required: ['webhook_id'],
    },
  },

  // ─── Reports (additional) ─────────────────────────────
  {
    name: 'get_report_summary',
    description:
      'Get a summary report with aggregated metrics for a time period (via API v2). Includes conversations_count, incoming/outgoing messages, avg response/resolution times.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        since: { type: 'string', description: 'Start timestamp (Unix timestamp or ISO 8601)' },
        until: { type: 'string', description: 'End timestamp (Unix timestamp or ISO 8601)' },
        type: {
          type: 'string',
          description: 'Report scope',
          enum: ['account', 'agent', 'inbox', 'label', 'team'],
        },
        id: { type: 'string', description: 'Entity ID when type is agent/inbox/label/team' },
        group_by: { type: 'string', description: 'Group results by period', enum: ['day', 'week', 'month', 'year'] },
        business_hours: { type: 'boolean', description: 'Calculate metrics using business hours only' },
        ...accountIdProperty,
      },
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
        ...accountIdProperty,
      },
    },
  },
  {
    name: 'create_custom_attribute',
    description:
      'Create a new custom attribute definition for contacts or conversations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        attribute_display_name: { type: 'string', description: 'Display name for the attribute' },
        attribute_display_type: {
          type: 'string',
          description: 'UI display type',
          enum: ['text', 'number', 'currency', 'percent', 'link', 'date', 'list', 'checkbox'],
        },
        attribute_description: { type: 'string', description: 'Description of the attribute' },
        attribute_key: { type: 'string', description: 'Unique key identifier (snake_case)' },
        attribute_model: {
          type: 'string',
          description: 'Model to apply attribute to',
          enum: ['contact_attribute', 'conversation_attribute'],
        },
        attribute_values: {
          type: 'array',
          items: { type: 'string' },
          description: 'Possible values (for list type)',
        },
        default_value: { type: 'string', description: 'Default value' },
        ...accountIdProperty,
      },
      required: ['attribute_display_name', 'attribute_display_type', 'attribute_key', 'attribute_model'],
    },
  },
  {
    name: 'update_custom_attribute',
    description: 'Update an existing custom attribute definition.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        attribute_id: { type: 'number', description: 'The custom attribute ID' },
        attribute_display_name: { type: 'string', description: 'New display name' },
        attribute_description: { type: 'string', description: 'New description' },
        attribute_values: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated possible values (for list type)',
        },
        default_value: { type: 'string', description: 'New default value' },
        ...accountIdProperty,
      },
      required: ['attribute_id'],
    },
  },
  {
    name: 'delete_custom_attribute',
    description: 'Delete a custom attribute definition.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        attribute_id: { type: 'number', description: 'The custom attribute ID to delete' },
        ...accountIdProperty,
      },
      required: ['attribute_id'],
    },
  },

  // ─── Automation Rules ─────────────────────────────────────
  {
    name: 'list_automation_rules',
    description: 'List all automation rules in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },
  {
    name: 'get_automation_rule',
    description: 'Get detailed information about a specific automation rule.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        rule_id: { type: 'number', description: 'The automation rule ID' },
        ...accountIdProperty,
      },
      required: ['rule_id'],
    },
  },
  {
    name: 'create_automation_rule',
    description:
      'Create a new automation rule with event trigger, conditions, and actions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Rule name' },
        description: { type: 'string', description: 'Rule description' },
        event_name: {
          type: 'string',
          description: 'Event that triggers the rule',
          enum: [
            'conversation_created',
            'conversation_updated',
            'message_created',
          ],
        },
        conditions: {
          type: 'array',
          items: { type: 'object' },
          description:
            'Array of condition objects (e.g., [{"attribute_key":"status","filter_operator":"equal_to","values":["open"]}])',
        },
        actions: {
          type: 'array',
          items: { type: 'object' },
          description:
            'Array of action objects (e.g., [{"action_name":"assign_agent","action_params":[1]}])',
        },
        ...accountIdProperty,
      },
      required: ['name', 'event_name', 'conditions', 'actions'],
    },
  },
  {
    name: 'update_automation_rule',
    description: 'Update an existing automation rule.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        rule_id: { type: 'number', description: 'The automation rule ID' },
        name: { type: 'string', description: 'New rule name' },
        description: { type: 'string', description: 'New description' },
        event_name: {
          type: 'string',
          description: 'New event trigger',
          enum: [
            'conversation_created',
            'conversation_updated',
            'message_created',
          ],
        },
        conditions: {
          type: 'array',
          items: { type: 'object' },
          description: 'Updated conditions',
        },
        actions: {
          type: 'array',
          items: { type: 'object' },
          description: 'Updated actions',
        },
        ...accountIdProperty,
      },
      required: ['rule_id'],
    },
  },
  {
    name: 'delete_automation_rule',
    description: 'Delete an automation rule.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        rule_id: { type: 'number', description: 'The automation rule ID to delete' },
        ...accountIdProperty,
      },
      required: ['rule_id'],
    },
  },

  // ─── Custom Filters ──────────────────────────────────────
  {
    name: 'list_custom_filters',
    description:
      'List all saved custom filters. Can filter by type (conversation, contact, or report).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filter_type: {
          type: 'string',
          description: 'Filter type',
          enum: ['conversation', 'contact', 'report'],
        },
        ...accountIdProperty,
      },
    },
  },
  {
    name: 'get_custom_filter',
    description: 'Get a specific custom filter by its ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filter_id: { type: 'number', description: 'The custom filter ID' },
        ...accountIdProperty,
      },
      required: ['filter_id'],
    },
  },
  {
    name: 'create_custom_filter',
    description: 'Create a new custom filter for conversations, contacts, or reports.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Filter name' },
        filter_type: {
          type: 'string',
          description: 'Filter type',
          enum: ['conversation', 'contact', 'report'],
        },
        query: {
          type: 'object',
          description:
            'Filter query object with conditions (e.g., {"attribute_key":"status","filter_operator":"equal_to","values":["open"]})',
        },
        ...accountIdProperty,
      },
      required: ['name', 'filter_type', 'query'],
    },
  },
  {
    name: 'update_custom_filter',
    description: 'Update an existing custom filter.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filter_id: { type: 'number', description: 'The custom filter ID' },
        name: { type: 'string', description: 'New filter name' },
        query: { type: 'object', description: 'Updated filter query' },
        ...accountIdProperty,
      },
      required: ['filter_id'],
    },
  },
  {
    name: 'delete_custom_filter',
    description: 'Delete a custom filter.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filter_id: { type: 'number', description: 'The custom filter ID to delete' },
        ...accountIdProperty,
      },
      required: ['filter_id'],
    },
  },

  // ─── Conversations (filter) ───────────────────────────
  {
    name: 'filter_conversations',
    description:
      'Filter conversations using advanced query conditions. Each filter has attribute_key, filter_operator, values, and optional query_operator (AND/OR).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filters: {
          type: 'array',
          items: { type: 'object' },
          description:
            'Array of filter objects (e.g., [{"attribute_key":"status","filter_operator":"equal_to","values":["open"],"query_operator":"AND"}])',
        },
        page: { type: 'number', description: 'Page number (default: 1)' },
        ...accountIdProperty,
      },
      required: ['filters'],
    },
  },

  // ─── Contacts (merge) ─────────────────────────────────
  {
    name: 'merge_contacts',
    description:
      'Merge two contacts into one. The base contact remains and receives all data (conversations, labels, custom attributes) from the mergee contact. The mergee contact is permanently deleted.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        base_contact_id: { type: 'number', description: 'The contact ID that will remain after the merge' },
        mergee_contact_id: { type: 'number', description: 'The contact ID that will be merged and deleted' },
        ...accountIdProperty,
      },
      required: ['base_contact_id', 'mergee_contact_id'],
    },
  },

  // ─── Inbox Members (agent assignments) ─────────────────
  {
    name: 'list_inbox_agents',
    description: 'List all agents assigned to a specific inbox.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'The inbox ID' },
        ...accountIdProperty,
      },
      required: ['inbox_id'],
    },
  },
  {
    name: 'add_inbox_agents',
    description: 'Add one or more agents to an inbox by their user IDs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'The inbox ID' },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of agent user IDs to add',
        },
        ...accountIdProperty,
      },
      required: ['inbox_id', 'user_ids'],
    },
  },
  {
    name: 'update_inbox_agents',
    description:
      'Replace the agent list for an inbox. All agents except those in user_ids will be removed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'The inbox ID' },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of agent user IDs that should be in the inbox',
        },
        ...accountIdProperty,
      },
      required: ['inbox_id', 'user_ids'],
    },
  },
  {
    name: 'remove_inbox_agents',
    description: 'Remove one or more agents from an inbox.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'The inbox ID' },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of agent user IDs to remove',
        },
        ...accountIdProperty,
      },
      required: ['inbox_id', 'user_ids'],
    },
  },

  // ─── Team Members (add/remove) ─────────────────────────
  {
    name: 'add_team_members',
    description: 'Add one or more agents to a team by their user IDs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID' },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of agent user IDs to add to the team',
        },
        ...accountIdProperty,
      },
      required: ['team_id', 'user_ids'],
    },
  },
  {
    name: 'remove_team_members',
    description: 'Remove one or more agents from a team.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID' },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of agent user IDs to remove from the team',
        },
        ...accountIdProperty,
      },
      required: ['team_id', 'user_ids'],
    },
  },

  // ─── Contact Labels ────────────────────────────────────
  {
    name: 'get_contact_labels',
    description: 'Get all labels currently applied to a specific contact.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID' },
        ...accountIdProperty,
      },
      required: ['contact_id'],
    },
  },
  {
    name: 'add_labels_to_contact',
    description:
      'Set labels on a contact. Provide the full list of labels that should be applied (replaces existing labels).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Label names to apply to the contact',
        },
        ...accountIdProperty,
      },
      required: ['contact_id', 'labels'],
    },
  },

  // ─── Conversation Custom Attributes ───────────────────
  {
    name: 'set_conversation_custom_attributes',
    description:
      'Set custom attributes on a conversation. Useful for tagging conversations with metadata like order IDs, categories, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        conversation_id: { type: 'number', description: 'The conversation ID' },
        custom_attributes: {
          type: 'object',
          description: 'Custom attributes as key-value pairs (e.g., {"order_id": "12345", "priority_tier": "gold"})',
        },
        ...accountIdProperty,
      },
      required: ['conversation_id', 'custom_attributes'],
    },
  },

  // ─── Custom Attributes (get by ID) ────────────────────
  {
    name: 'get_custom_attribute',
    description: 'Get details of a specific custom attribute definition by its ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        attribute_id: { type: 'number', description: 'The custom attribute definition ID' },
        ...accountIdProperty,
      },
      required: ['attribute_id'],
    },
  },

  // ─── Integrations ─────────────────────────────────────
  {
    name: 'list_integrations',
    description: 'List all available integrations (apps) in the Chatwoot account.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },

  // ─── Inbox Agent Bot ──────────────────────────────────
  {
    name: 'get_inbox_agent_bot',
    description: 'Get the agent bot associated with a specific inbox, if any.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        inbox_id: { type: 'number', description: 'The inbox ID' },
        ...accountIdProperty,
      },
      required: ['inbox_id'],
    },
  },

  // ─── Contactable Inboxes ──────────────────────────────
  {
    name: 'get_contactable_inboxes',
    description:
      'Get the list of inboxes through which a contact can be reached. Useful for determining available channels for a contact.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contact_id: { type: 'number', description: 'The contact ID' },
        ...accountIdProperty,
      },
      required: ['contact_id'],
    },
  },

  // ─── Team Members (update) ────────────────────────────
  {
    name: 'update_team_members',
    description:
      'Replace the agent list for a team. Sets exactly the provided user IDs as team members.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'The team ID' },
        user_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of agent user IDs that should be in the team',
        },
        ...accountIdProperty,
      },
      required: ['team_id', 'user_ids'],
    },
  },

  // ─── Reports v2 (additional) ──────────────────────────
  {
    name: 'get_conversation_statistics',
    description:
      'Get conversation statistics grouped by entity (via API v2). Returns metrics like conversations_count, avg_first_response_time, avg_resolution_time per entity.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        entity_type: {
          type: 'string',
          description: 'Entity to group statistics by',
          enum: ['agent', 'team', 'inbox', 'channel'],
        },
        since: { type: 'string', description: 'Start timestamp (Unix timestamp)' },
        until: { type: 'string', description: 'End timestamp (Unix timestamp)' },
        business_hours: { type: 'boolean', description: 'Calculate metrics using business hours only' },
        ...accountIdProperty,
      },
      required: ['entity_type'],
    },
  },
  {
    name: 'get_conversation_metrics',
    description:
      'Get conversation metrics for the account or a specific agent (via API v2). Returns open, unattended, and unassigned conversation counts.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          description: 'Metric scope',
          enum: ['account', 'agent'],
        },
        user_id: { type: 'string', description: 'Agent user ID (required when type is "agent")' },
        ...accountIdProperty,
      },
      required: ['type'],
    },
  },
  {
    name: 'get_first_response_time_report',
    description:
      'Get first response time distribution grouped by channel (via API v2). Shows how quickly agents respond across different channels.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        since: { type: 'string', description: 'Start timestamp (Unix timestamp)' },
        until: { type: 'string', description: 'End timestamp (Unix timestamp)' },
        ...accountIdProperty,
      },
    },
  },
  {
    name: 'get_inbox_label_matrix_report',
    description:
      'Get a matrix report of conversations grouped by inbox and label (via API v2). Useful for understanding label distribution across inboxes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        since: { type: 'string', description: 'Start timestamp (Unix timestamp)' },
        until: { type: 'string', description: 'End timestamp (Unix timestamp)' },
        inbox_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by specific inbox IDs',
        },
        label_ids: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by specific label IDs',
        },
        ...accountIdProperty,
      },
    },
  },
  {
    name: 'get_outgoing_messages_report',
    description:
      'Get outgoing messages count grouped by entity (via API v2). Shows message volume per agent, team, inbox, or label.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        group_by: {
          type: 'string',
          description: 'Entity to group messages by',
          enum: ['agent', 'team', 'inbox', 'label'],
        },
        since: { type: 'string', description: 'Start timestamp (Unix timestamp)' },
        until: { type: 'string', description: 'End timestamp (Unix timestamp)' },
        ...accountIdProperty,
      },
      required: ['group_by'],
    },
  },

  // ─── Profile ──────────────────────────────────────────
  {
    name: 'get_profile',
    description: 'Get the profile information of the authenticated user/agent.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },
];
