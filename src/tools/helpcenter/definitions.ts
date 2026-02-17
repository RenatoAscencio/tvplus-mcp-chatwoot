import { Tool } from '@modelcontextprotocol/sdk/types.js';

const accountIdProperty = {
  account_id: {
    type: 'number',
    description:
      'Chatwoot account ID. If omitted, uses default from CHATWOOT_ACCOUNT_ID env var.',
  },
};

const portalIdProperty = {
  portal_id: {
    type: 'string',
    description: 'Portal slug identifier (string, not numeric)',
  },
};

export const helpCenterTools: Tool[] = [
  // ─── Portals ─────────────────────────────────────────
  {
    name: 'helpcenter_list_portals',
    description:
      'List all Help Center portals in the account.',
    inputSchema: {
      type: 'object' as const,
      properties: { ...accountIdProperty },
    },
  },
  {
    name: 'helpcenter_create_portal',
    description:
      'Create a new Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Portal name' },
        slug: { type: 'string', description: 'Portal slug (URL-friendly identifier)' },
        color: { type: 'string', description: 'Theme color (hex, e.g. "#1F93FF")' },
        header_text: { type: 'string', description: 'Header text shown on portal' },
        page_title: { type: 'string', description: 'HTML page title' },
        homepage_link: { type: 'string', description: 'Homepage link URL' },
        custom_domain: { type: 'string', description: 'Custom domain for the portal' },
        archived: { type: 'boolean', description: 'Whether the portal is archived' },
        config: {
          type: 'object',
          description: 'Portal config (allowed_locales, default_locale)',
        },
        ...accountIdProperty,
      },
      required: ['name', 'slug'],
    },
  },
  {
    name: 'helpcenter_get_portal',
    description:
      'Get details of a Help Center portal by its slug.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        ...accountIdProperty,
      },
      required: ['portal_id'],
    },
  },
  {
    name: 'helpcenter_update_portal',
    description:
      'Update a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        name: { type: 'string', description: 'Updated portal name' },
        slug: { type: 'string', description: 'Updated slug' },
        color: { type: 'string', description: 'Updated color' },
        header_text: { type: 'string', description: 'Updated header text' },
        page_title: { type: 'string', description: 'Updated page title' },
        homepage_link: { type: 'string', description: 'Updated homepage link' },
        custom_domain: { type: 'string', description: 'Updated custom domain' },
        archived: { type: 'boolean', description: 'Archive status' },
        config: { type: 'object', description: 'Updated config' },
        ...accountIdProperty,
      },
      required: ['portal_id'],
    },
  },
  {
    name: 'helpcenter_delete_portal',
    description:
      'Delete a Help Center portal. DESTRUCTIVE.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        ...accountIdProperty,
      },
      required: ['portal_id'],
    },
  },

  // ─── Articles ────────────────────────────────────────
  {
    name: 'helpcenter_list_articles',
    description:
      'List articles in a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        page: { type: 'number', description: 'Page number' },
        locale: { type: 'string', description: 'Filter by locale' },
        category_id: { type: 'number', description: 'Filter by category ID' },
        ...accountIdProperty,
      },
      required: ['portal_id'],
    },
  },
  {
    name: 'helpcenter_create_article',
    description:
      'Create a new article in a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        title: { type: 'string', description: 'Article title' },
        slug: { type: 'string', description: 'Article slug' },
        content: { type: 'string', description: 'Article content (HTML or markdown)' },
        description: { type: 'string', description: 'Short description / excerpt' },
        category_id: { type: 'number', description: 'Category ID to place article in' },
        author_id: { type: 'number', description: 'Author user ID' },
        position: { type: 'number', description: 'Sort position' },
        status: {
          type: 'number',
          description: 'Article status: 0=draft, 1=published, 2=archived',
          enum: [0, 1, 2],
        },
        locale: { type: 'string', description: 'Article locale' },
        associated_article_id: { type: 'number', description: 'Associated article ID (translations)' },
        meta: { type: 'object', description: 'Metadata object' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'title', 'slug'],
    },
  },
  {
    name: 'helpcenter_get_article',
    description:
      'Get a specific article from a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        article_id: { type: 'number', description: 'The article ID' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'article_id'],
    },
  },
  {
    name: 'helpcenter_update_article',
    description:
      'Update an article in a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        article_id: { type: 'number', description: 'The article ID' },
        title: { type: 'string', description: 'Updated title' },
        slug: { type: 'string', description: 'Updated slug' },
        content: { type: 'string', description: 'Updated content' },
        description: { type: 'string', description: 'Updated description' },
        category_id: { type: 'number', description: 'Updated category ID' },
        position: { type: 'number', description: 'Updated position' },
        status: { type: 'number', description: 'Updated status (0=draft, 1=published, 2=archived)', enum: [0, 1, 2] },
        locale: { type: 'string', description: 'Updated locale' },
        meta: { type: 'object', description: 'Updated metadata' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'article_id'],
    },
  },
  {
    name: 'helpcenter_delete_article',
    description:
      'Delete an article from a Help Center portal. DESTRUCTIVE.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        article_id: { type: 'number', description: 'The article ID to delete' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'article_id'],
    },
  },

  // ─── Categories ──────────────────────────────────────
  {
    name: 'helpcenter_list_categories',
    description:
      'List categories in a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        locale: { type: 'string', description: 'Filter by locale' },
        ...accountIdProperty,
      },
      required: ['portal_id'],
    },
  },
  {
    name: 'helpcenter_create_category',
    description:
      'Create a new category in a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        name: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Category description' },
        slug: { type: 'string', description: 'Category slug' },
        position: { type: 'number', description: 'Sort position' },
        locale: { type: 'string', description: 'Category locale' },
        icon: { type: 'string', description: 'Category icon (emoji)' },
        parent_category_id: { type: 'number', description: 'Parent category ID (for nesting)' },
        associated_category_id: { type: 'number', description: 'Associated category ID (translations)' },
        ...accountIdProperty,
      },
      required: ['portal_id'],
    },
  },
  {
    name: 'helpcenter_get_category',
    description:
      'Get a specific category from a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        category_id: { type: 'number', description: 'The category ID' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'category_id'],
    },
  },
  {
    name: 'helpcenter_update_category',
    description:
      'Update a category in a Help Center portal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        category_id: { type: 'number', description: 'The category ID' },
        name: { type: 'string', description: 'Updated name' },
        description: { type: 'string', description: 'Updated description' },
        slug: { type: 'string', description: 'Updated slug' },
        position: { type: 'number', description: 'Updated position' },
        locale: { type: 'string', description: 'Updated locale' },
        icon: { type: 'string', description: 'Updated icon (emoji)' },
        parent_category_id: { type: 'number', description: 'Updated parent category ID' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'category_id'],
    },
  },
  {
    name: 'helpcenter_delete_category',
    description:
      'Delete a category from a Help Center portal. DESTRUCTIVE.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...portalIdProperty,
        category_id: { type: 'number', description: 'The category ID to delete' },
        ...accountIdProperty,
      },
      required: ['portal_id', 'category_id'],
    },
  },
];
