import { describe, it, expect } from 'vitest';
import { tools } from '../../src/tools/definitions.js';

describe('Tool Definitions', () => {
  it('should have more than 28 tools (original count)', () => {
    expect(tools.length).toBeGreaterThan(28);
  });

  it('all tools should have name and description', () => {
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it('all tools should have inputSchema with account_id property', () => {
    for (const tool of tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      const props = tool.inputSchema.properties as Record<string, unknown>;
      expect(props.account_id).toBeDefined();
    }
  });

  it('should have no duplicate tool names', () => {
    const names = tools.map((t) => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('tool names should follow verb_noun convention', () => {
    const validPrefixes = [
      'chatwoot_', 'list_', 'get_', 'create_', 'update_', 'delete_',
      'search_', 'filter_', 'send_', 'assign_', 'add_', 'set_',
      'merge_', 'remove_',
    ];
    for (const tool of tools) {
      const hasValidPrefix = validPrefixes.some((prefix) => tool.name.startsWith(prefix));
      expect(hasValidPrefix, `Tool "${tool.name}" should start with a valid verb prefix`).toBe(true);
    }
  });

  it('required fields should be arrays', () => {
    for (const tool of tools) {
      if (tool.inputSchema.required) {
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      }
    }
  });
});
