import { Tool } from '@modelcontextprotocol/sdk/types.js';

const inboxIdentifierProp = {
  inbox_identifier: {
    type: 'string',
    description: 'The unique identifier of the inbox (widget token)',
  },
};

export const publicTools: Tool[] = [
  // ─── Contacts ────────────────────────────────────────
  {
    name: 'public_create_contact',
    description:
      'Create a new contact via the Public/Client API. Uses inbox_identifier for auth (no API token needed).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        identifier: { type: 'string', description: 'External identifier for the contact' },
        identifier_hash: { type: 'string', description: 'HMAC identifier hash for verification' },
        email: { type: 'string', description: 'Contact email' },
        name: { type: 'string', description: 'Contact name' },
        phone_number: { type: 'string', description: 'Contact phone number' },
        avatar_url: { type: 'string', description: 'URL to contact avatar' },
        custom_attributes: { type: 'object', description: 'Custom key-value attributes' },
      },
      required: ['inbox_identifier'],
    },
  },
  {
    name: 'public_get_contact',
    description:
      'Get contact details via the Public/Client API using inbox and contact identifiers.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
      },
      required: ['inbox_identifier', 'contact_identifier'],
    },
  },
  {
    name: 'public_update_contact',
    description:
      'Update a contact via the Public/Client API using inbox and contact identifiers.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
        name: { type: 'string', description: 'Updated contact name' },
        email: { type: 'string', description: 'Updated email' },
        phone_number: { type: 'string', description: 'Updated phone number' },
        avatar_url: { type: 'string', description: 'Updated avatar URL' },
        custom_attributes: { type: 'object', description: 'Updated custom attributes' },
      },
      required: ['inbox_identifier', 'contact_identifier'],
    },
  },

  // ─── Conversations ──────────────────────────────────
  {
    name: 'public_create_conversation',
    description:
      'Create a new conversation via the Public/Client API. Requires inbox and contact identifiers.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
        custom_attributes: { type: 'object', description: 'Custom attributes for the conversation' },
      },
      required: ['inbox_identifier', 'contact_identifier'],
    },
  },
  {
    name: 'public_list_conversations',
    description:
      'List conversations for a contact via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
      },
      required: ['inbox_identifier', 'contact_identifier'],
    },
  },
  {
    name: 'public_get_conversation',
    description:
      'Get conversation details via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
      },
      required: ['inbox_identifier', 'conversation_id'],
    },
  },
  {
    name: 'public_resolve_conversation',
    description:
      'Toggle conversation status (resolve/reopen) via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
      },
      required: ['inbox_identifier', 'conversation_id'],
    },
  },
  {
    name: 'public_toggle_typing',
    description:
      'Toggle typing indicator for a conversation via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
        typing_status: {
          type: 'string',
          description: 'Typing status',
          enum: ['on', 'off'],
        },
      },
      required: ['inbox_identifier', 'conversation_id', 'contact_identifier', 'typing_status'],
    },
  },
  {
    name: 'public_update_last_seen',
    description:
      'Update the last-seen timestamp for a contact in a conversation via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
      },
      required: ['inbox_identifier', 'conversation_id', 'contact_identifier'],
    },
  },

  // ─── Messages ───────────────────────────────────────
  {
    name: 'public_create_message',
    description:
      'Send a message to a conversation via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
        contact_identifier: { type: 'string', description: 'The contact source_id / identifier' },
        content: { type: 'string', description: 'Message content' },
        echo_id: { type: 'string', description: 'Temporary ID for deduplication' },
      },
      required: ['inbox_identifier', 'conversation_id', 'contact_identifier', 'content'],
    },
  },
  {
    name: 'public_list_messages',
    description:
      'List messages in a conversation via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
      },
      required: ['inbox_identifier', 'conversation_id'],
    },
  },
  {
    name: 'public_update_message',
    description:
      'Update a message (e.g. submitted_values for interactive cards) via the Public/Client API.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...inboxIdentifierProp,
        conversation_id: { type: 'number', description: 'The conversation ID' },
        message_id: { type: 'number', description: 'The message ID' },
        submitted_values: { type: 'object', description: 'Key-value pairs for card responses' },
      },
      required: ['inbox_identifier', 'conversation_id', 'message_id'],
    },
  },
];
