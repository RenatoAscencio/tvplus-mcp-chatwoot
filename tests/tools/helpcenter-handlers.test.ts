import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootClient } from '../../src/api/client.js';
import { handleHelpCenterToolCall } from '../../src/tools/helpcenter/handlers.js';

const BASE_URL = 'https://test.chatwoot.com';
const ACCOUNT_ID = 1;
const API_TOKEN = 'test-token';

describe('Help Center Handlers', () => {
  let client: ChatwootClient;
  let scope: nock.Scope;

  beforeEach(() => {
    client = new ChatwootClient({ baseUrl: BASE_URL, accountId: ACCOUNT_ID, apiToken: API_TOKEN });
    scope = nock(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`, {
      reqheaders: { api_access_token: API_TOKEN },
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  // ─── Portals ──────────────────────────────────────

  it('helpcenter_list_portals lists portals', async () => {
    scope.get('/portals').reply(200, [{ id: 1, slug: 'help' }]);
    const result = await handleHelpCenterToolCall(client, 'helpcenter_list_portals', {}, false);
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(Array.isArray(data)).toBe(true);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_create_portal creates a portal', async () => {
    scope.post('/portals').reply(200, { id: 1, slug: 'help', name: 'Help' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_create_portal', {
      name: 'Help', slug: 'help',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_get_portal gets a portal', async () => {
    scope.get('/portals/help').reply(200, { id: 1, slug: 'help' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_get_portal', {
      portal_id: 'help',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_update_portal updates a portal', async () => {
    scope.patch('/portals/help').reply(200, { id: 1, slug: 'help', name: 'Updated' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_update_portal', {
      portal_id: 'help', name: 'Updated',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_delete_portal deletes a portal', async () => {
    scope.delete('/portals/help').reply(200, {});
    const result = await handleHelpCenterToolCall(client, 'helpcenter_delete_portal', {
      portal_id: 'help',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Articles ─────────────────────────────────────

  it('helpcenter_list_articles lists articles', async () => {
    scope.get('/portals/help/articles').query(true).reply(200, [{ id: 1, title: 'Test' }]);
    const result = await handleHelpCenterToolCall(client, 'helpcenter_list_articles', {
      portal_id: 'help',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_create_article creates an article', async () => {
    scope.post('/portals/help/articles').reply(200, { id: 1, title: 'New', slug: 'new' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_create_article', {
      portal_id: 'help', title: 'New', slug: 'new',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_get_article gets an article', async () => {
    scope.get('/portals/help/articles/1').reply(200, { id: 1, title: 'Test' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_get_article', {
      portal_id: 'help', article_id: 1,
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_update_article updates an article', async () => {
    scope.patch('/portals/help/articles/1').reply(200, { id: 1, title: 'Updated' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_update_article', {
      portal_id: 'help', article_id: 1, title: 'Updated',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_delete_article deletes an article', async () => {
    scope.delete('/portals/help/articles/1').reply(200, {});
    const result = await handleHelpCenterToolCall(client, 'helpcenter_delete_article', {
      portal_id: 'help', article_id: 1,
    }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Categories ───────────────────────────────────

  it('helpcenter_list_categories lists categories', async () => {
    scope.get('/portals/help/categories').query(true).reply(200, [{ id: 1, name: 'FAQ' }]);
    const result = await handleHelpCenterToolCall(client, 'helpcenter_list_categories', {
      portal_id: 'help',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_create_category creates a category', async () => {
    scope.post('/portals/help/categories').reply(200, { id: 1, name: 'FAQ' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_create_category', {
      portal_id: 'help', name: 'FAQ',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_get_category gets a category', async () => {
    scope.get('/portals/help/categories/1').reply(200, { id: 1, name: 'FAQ' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_get_category', {
      portal_id: 'help', category_id: 1,
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_update_category updates a category', async () => {
    scope.patch('/portals/help/categories/1').reply(200, { id: 1, name: 'Updated' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_update_category', {
      portal_id: 'help', category_id: 1, name: 'Updated',
    }, false);
    expect(result.isError).toBeFalsy();
  });

  it('helpcenter_delete_category deletes a category', async () => {
    scope.delete('/portals/help/categories/1').reply(200, {});
    const result = await handleHelpCenterToolCall(client, 'helpcenter_delete_category', {
      portal_id: 'help', category_id: 1,
    }, false);
    expect(result.isError).toBeFalsy();
  });

  // ─── Safe Mode ────────────────────────────────────

  it('blocks helpcenter_delete_portal in safe mode', async () => {
    const result = await handleHelpCenterToolCall(client, 'helpcenter_delete_portal', {
      portal_id: 'help',
    }, true);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('MCP_SAFE_MODE');
  });

  it('blocks helpcenter_delete_article in safe mode', async () => {
    const result = await handleHelpCenterToolCall(client, 'helpcenter_delete_article', {
      portal_id: 'help', article_id: 1,
    }, true);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('MCP_SAFE_MODE');
  });

  it('allows reads in safe mode', async () => {
    scope.get('/portals').reply(200, []);
    const result = await handleHelpCenterToolCall(client, 'helpcenter_list_portals', {}, true);
    expect(result.isError).toBeFalsy();
  });

  // ─── Error Handling ───────────────────────────────

  it('returns error for unknown help center tool', async () => {
    const result = await handleHelpCenterToolCall(client, 'helpcenter_nonexistent', {}, false);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('Unknown help center tool');
  });

  it('handles API errors gracefully', async () => {
    scope.get('/portals/nonexistent').reply(404, { message: 'Not found' });
    const result = await handleHelpCenterToolCall(client, 'helpcenter_get_portal', {
      portal_id: 'nonexistent',
    }, false);
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('404');
  });
});
