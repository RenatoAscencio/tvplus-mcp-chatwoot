import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { ChatwootPublicClient } from '../../src/api/public-client.js';
import { handlePublicToolCall } from '../../src/tools/public/handlers.js';

const BASE_URL = 'https://test.chatwoot.com';
const INBOX_ID = 'abc123';

describe('Public API Handlers', () => {
  let client: ChatwootPublicClient;
  let scope: nock.Scope;

  beforeEach(() => {
    client = new ChatwootPublicClient(BASE_URL);
    scope = nock(`${BASE_URL}/public/api/v1/inboxes/${INBOX_ID}`);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  // ─── Contacts ──────────────────────────────────────

  it('public_create_contact creates a contact', async () => {
    scope.post('/contacts').reply(200, { id: 1, name: 'Test' });
    const result = await handlePublicToolCall(client, 'public_create_contact', {
      inbox_identifier: INBOX_ID,
      name: 'Test',
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.id).toBe(1);
    expect(result.isError).toBeFalsy();
  });

  it('public_get_contact gets a contact', async () => {
    scope.get('/contacts/contact-123').reply(200, { id: 1, name: 'Test' });
    const result = await handlePublicToolCall(client, 'public_get_contact', {
      inbox_identifier: INBOX_ID,
      contact_identifier: 'contact-123',
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.name).toBe('Test');
    expect(result.isError).toBeFalsy();
  });

  it('public_update_contact updates a contact', async () => {
    scope.patch('/contacts/contact-123').reply(200, { id: 1, name: 'Updated' });
    const result = await handlePublicToolCall(client, 'public_update_contact', {
      inbox_identifier: INBOX_ID,
      contact_identifier: 'contact-123',
      name: 'Updated',
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.name).toBe('Updated');
    expect(result.isError).toBeFalsy();
  });

  // ─── Conversations ────────────────────────────────

  it('public_create_conversation creates a conversation', async () => {
    scope.post('/conversations').reply(200, { id: 10 });
    const result = await handlePublicToolCall(client, 'public_create_conversation', {
      inbox_identifier: INBOX_ID,
      contact_identifier: 'contact-123',
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.id).toBe(10);
    expect(result.isError).toBeFalsy();
  });

  it('public_list_conversations lists conversations', async () => {
    scope.get('/conversations').query(true).reply(200, [{ id: 10 }]);
    const result = await handlePublicToolCall(client, 'public_list_conversations', {
      inbox_identifier: INBOX_ID,
      contact_identifier: 'contact-123',
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(Array.isArray(data)).toBe(true);
    expect(result.isError).toBeFalsy();
  });

  it('public_get_conversation gets a conversation', async () => {
    scope.get('/conversations/10').reply(200, { id: 10, status: 'open' });
    const result = await handlePublicToolCall(client, 'public_get_conversation', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.status).toBe('open');
    expect(result.isError).toBeFalsy();
  });

  it('public_resolve_conversation resolves', async () => {
    scope.post('/conversations/10/toggle_status').reply(200, { id: 10, status: 'resolved' });
    const result = await handlePublicToolCall(client, 'public_resolve_conversation', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
    });
    expect(result.isError).toBeFalsy();
  });

  it('public_toggle_typing toggles typing', async () => {
    scope.post('/conversations/10/toggle_typing').reply(200, {});
    const result = await handlePublicToolCall(client, 'public_toggle_typing', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
      contact_identifier: 'contact-123',
      typing_status: 'on',
    });
    expect(result.isError).toBeFalsy();
  });

  it('public_update_last_seen updates last seen', async () => {
    scope.post('/conversations/10/update_last_seen').reply(200, {});
    const result = await handlePublicToolCall(client, 'public_update_last_seen', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
      contact_identifier: 'contact-123',
    });
    expect(result.isError).toBeFalsy();
  });

  // ─── Messages ─────────────────────────────────────

  it('public_create_message sends a message', async () => {
    scope.post('/conversations/10/messages').reply(200, { id: 100, content: 'Hello' });
    const result = await handlePublicToolCall(client, 'public_create_message', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
      contact_identifier: 'contact-123',
      content: 'Hello',
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.content).toBe('Hello');
    expect(result.isError).toBeFalsy();
  });

  it('public_list_messages lists messages', async () => {
    scope.get('/conversations/10/messages').reply(200, [{ id: 100 }]);
    const result = await handlePublicToolCall(client, 'public_list_messages', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
    });
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(Array.isArray(data)).toBe(true);
    expect(result.isError).toBeFalsy();
  });

  it('public_update_message updates a message', async () => {
    scope.patch('/conversations/10/messages/100').reply(200, { id: 100 });
    const result = await handlePublicToolCall(client, 'public_update_message', {
      inbox_identifier: INBOX_ID,
      conversation_id: 10,
      message_id: 100,
    });
    expect(result.isError).toBeFalsy();
  });

  // ─── Error Handling ───────────────────────────────

  it('returns error for unknown public tool', async () => {
    const result = await handlePublicToolCall(client, 'public_nonexistent', {
      inbox_identifier: INBOX_ID,
    });
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('Unknown public tool');
  });

  it('handles API errors gracefully', async () => {
    scope.get('/contacts/bad').reply(404, { message: 'Not found' });
    const result = await handlePublicToolCall(client, 'public_get_contact', {
      inbox_identifier: INBOX_ID,
      contact_identifier: 'bad',
    });
    expect(result.isError).toBe(true);
    expect((result.content[0] as { text: string }).text).toContain('404');
  });
});
