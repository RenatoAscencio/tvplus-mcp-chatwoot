import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tools as coreTools } from '../../src/tools/definitions.js';
import { publicTools } from '../../src/tools/public/definitions.js';
import { platformTools } from '../../src/tools/platform/definitions.js';
import { enterpriseTools } from '../../src/tools/enterprise/definitions.js';
import { helpCenterTools } from '../../src/tools/helpcenter/definitions.js';
import { getBucketConfig } from '../../src/utils/config.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

describe('Bucket Registration', () => {
  // ─── Array Counts ──────────────────────────────────

  describe('tool counts', () => {
    it('core tools = 81', () => {
      expect(coreTools).toHaveLength(81);
    });

    it('public tools = 12', () => {
      expect(publicTools).toHaveLength(12);
    });

    it('platform tools = 17', () => {
      expect(platformTools).toHaveLength(17);
    });

    it('enterprise tools = 8', () => {
      expect(enterpriseTools).toHaveLength(8);
    });

    it('help center tools = 15', () => {
      expect(helpCenterTools).toHaveLength(15);
    });

    it('all buckets total = 133', () => {
      const total =
        coreTools.length +
        publicTools.length +
        platformTools.length +
        enterpriseTools.length +
        helpCenterTools.length;
      expect(total).toBe(133);
    });
  });

  // ─── Name Uniqueness ──────────────────────────────

  describe('tool name uniqueness', () => {
    it('no duplicate names within core', () => {
      const names = coreTools.map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('no duplicate names across all buckets', () => {
      const allTools: Tool[] = [
        ...coreTools,
        ...publicTools,
        ...platformTools,
        ...enterpriseTools,
        ...helpCenterTools,
      ];
      const names = allTools.map((t) => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  // ─── Naming Conventions ───────────────────────────

  describe('naming conventions', () => {
    it('all public tools start with "public_"', () => {
      for (const tool of publicTools) {
        expect(tool.name).toMatch(/^public_/);
      }
    });

    it('all platform tools start with "platform_"', () => {
      for (const tool of platformTools) {
        expect(tool.name).toMatch(/^platform_/);
      }
    });

    it('all enterprise tools start with "enterprise_"', () => {
      for (const tool of enterpriseTools) {
        expect(tool.name).toMatch(/^enterprise_/);
      }
    });

    it('all help center tools start with "helpcenter_"', () => {
      for (const tool of helpCenterTools) {
        expect(tool.name).toMatch(/^helpcenter_/);
      }
    });

    it('no core tools use bucket prefixes', () => {
      const bucketPrefixes = /^(public_|platform_|enterprise_|helpcenter_)/;
      for (const tool of coreTools) {
        expect(tool.name).not.toMatch(bucketPrefixes);
      }
    });
  });

  // ─── Tool Schema Validity ─────────────────────────

  describe('schema validity', () => {
    function validateToolSchemas(tools: Tool[], label: string) {
      it(`${label}: every tool has name, description, inputSchema`, () => {
        for (const tool of tools) {
          expect(tool.name).toBeTruthy();
          expect(tool.description).toBeTruthy();
          expect(tool.inputSchema).toBeDefined();
          expect(tool.inputSchema.type).toBe('object');
        }
      });
    }

    validateToolSchemas(coreTools, 'core');
    validateToolSchemas(publicTools, 'public');
    validateToolSchemas(platformTools, 'platform');
    validateToolSchemas(enterpriseTools, 'enterprise');
    validateToolSchemas(helpCenterTools, 'helpcenter');
  });

  // ─── Conditional Registration Logic ───────────────

  describe('getBucketConfig', () => {
    const envBackup: Record<string, string | undefined> = {};

    beforeEach(() => {
      envBackup.MCP_ENABLE_PUBLIC_API = process.env.MCP_ENABLE_PUBLIC_API;
      envBackup.MCP_ENABLE_PLATFORM_API = process.env.MCP_ENABLE_PLATFORM_API;
      envBackup.MCP_ENABLE_ENTERPRISE = process.env.MCP_ENABLE_ENTERPRISE;
      envBackup.MCP_ENABLE_HELP_CENTER = process.env.MCP_ENABLE_HELP_CENTER;
      envBackup.MCP_PLATFORM_SAFE_MODE = process.env.MCP_PLATFORM_SAFE_MODE;

      delete process.env.MCP_ENABLE_PUBLIC_API;
      delete process.env.MCP_ENABLE_PLATFORM_API;
      delete process.env.MCP_ENABLE_ENTERPRISE;
      delete process.env.MCP_ENABLE_HELP_CENTER;
      delete process.env.MCP_PLATFORM_SAFE_MODE;
    });

    afterEach(() => {
      process.env.MCP_ENABLE_PUBLIC_API = envBackup.MCP_ENABLE_PUBLIC_API;
      process.env.MCP_ENABLE_PLATFORM_API = envBackup.MCP_ENABLE_PLATFORM_API;
      process.env.MCP_ENABLE_ENTERPRISE = envBackup.MCP_ENABLE_ENTERPRISE;
      process.env.MCP_ENABLE_HELP_CENTER = envBackup.MCP_ENABLE_HELP_CENTER;
      process.env.MCP_PLATFORM_SAFE_MODE = envBackup.MCP_PLATFORM_SAFE_MODE;
    });

    it('defaults: all buckets disabled', () => {
      const config = getBucketConfig();
      expect(config.publicApi).toBe(false);
      expect(config.platformApi).toBe(false);
      expect(config.enterprise).toBe(false);
      expect(config.helpCenter).toBe(false);
    });

    it('defaults: platform safe mode ON', () => {
      const config = getBucketConfig();
      expect(config.platformSafeMode).toBe(true);
    });

    it('enables public when MCP_ENABLE_PUBLIC_API=true', () => {
      process.env.MCP_ENABLE_PUBLIC_API = 'true';
      expect(getBucketConfig().publicApi).toBe(true);
    });

    it('enables platform when MCP_ENABLE_PLATFORM_API=true', () => {
      process.env.MCP_ENABLE_PLATFORM_API = 'true';
      expect(getBucketConfig().platformApi).toBe(true);
    });

    it('enables enterprise when MCP_ENABLE_ENTERPRISE=true', () => {
      process.env.MCP_ENABLE_ENTERPRISE = 'true';
      expect(getBucketConfig().enterprise).toBe(true);
    });

    it('enables help center when MCP_ENABLE_HELP_CENTER=true', () => {
      process.env.MCP_ENABLE_HELP_CENTER = 'true';
      expect(getBucketConfig().helpCenter).toBe(true);
    });

    it('platform safe mode OFF when MCP_PLATFORM_SAFE_MODE=false', () => {
      process.env.MCP_PLATFORM_SAFE_MODE = 'false';
      expect(getBucketConfig().platformSafeMode).toBe(false);
    });

    it('simulates all-on: 133 tools total', () => {
      process.env.MCP_ENABLE_PUBLIC_API = 'true';
      process.env.MCP_ENABLE_PLATFORM_API = 'true';
      process.env.MCP_ENABLE_ENTERPRISE = 'true';
      process.env.MCP_ENABLE_HELP_CENTER = 'true';

      const config = getBucketConfig();
      let count = coreTools.length;
      if (config.publicApi) count += publicTools.length;
      if (config.platformApi) count += platformTools.length;
      if (config.enterprise) count += enterpriseTools.length;
      if (config.helpCenter) count += helpCenterTools.length;
      expect(count).toBe(133);
    });

    it('simulates core-only (default): 81 tools', () => {
      const config = getBucketConfig();
      let count = coreTools.length;
      if (config.publicApi) count += publicTools.length;
      if (config.platformApi) count += platformTools.length;
      if (config.enterprise) count += enterpriseTools.length;
      if (config.helpCenter) count += helpCenterTools.length;
      expect(count).toBe(81);
    });

    it('simulates core + public: 93 tools', () => {
      process.env.MCP_ENABLE_PUBLIC_API = 'true';
      const config = getBucketConfig();
      let count = coreTools.length;
      if (config.publicApi) count += publicTools.length;
      expect(count).toBe(93);
    });

    it('simulates core + platform: 98 tools', () => {
      process.env.MCP_ENABLE_PLATFORM_API = 'true';
      const config = getBucketConfig();
      let count = coreTools.length;
      if (config.platformApi) count += platformTools.length;
      expect(count).toBe(98);
    });
  });
});
