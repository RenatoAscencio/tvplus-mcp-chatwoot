# Chatwoot API Coverage — Audit #3 (Final)

Date: 2026-02-16
Source of truth: `developers.chatwoot.com/llms.txt` (full endpoint index)

## Summary

| Metric | Value |
|--------|-------|
| Tools | 81 |
| Tests | 94 |
| Version | 0.5.0 |
| New gaps found | **0** |
| Status | **COMPLETE** |

## Methodology

1. Fetched complete endpoint index from `developers.chatwoot.com/llms.txt`
2. Classified every URL into: Application API v1, Application API v2, Client API, or Platform API
3. Cross-referenced each Application API endpoint against implemented tools
4. Verified HTTP method, path, and handler mapping in `client.ts`, `definitions.ts`, `handlers.ts`

## Full Cross-Reference

### Contacts (Application API v1) — 10 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `contacts/list-contacts` | GET | `list_contacts` | OK |
| `contacts/show-contact` | GET | `get_contact` | OK |
| `contacts/create-contact` | POST | `create_contact` | OK |
| `contacts/update-contact` | PATCH | `update_contact` | OK |
| `contacts/delete-contact` | DELETE | `delete_contact` | OK |
| `contacts/search-contacts` | GET | `search_contacts` | OK |
| `contacts/contact-conversations` | GET | `get_contact_conversations` | OK |
| `contacts/contact-filter` | POST | `filter_contacts` | OK |
| `contacts/merge-contacts` | POST | `merge_contacts` | OK |
| `contacts/get-contactable-inboxes` | GET | `get_contactable_inboxes` | OK |
| `contacts/create-contact-inbox` | POST | — | EXCLUDED |

### Contact Labels (Application API v1) — 2 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `contact-labels/list-labels` | GET | `get_contact_labels` | OK |
| `contact-labels/add-labels` | POST | `add_labels_to_contact` | OK |

### Conversations (Application API v1) — 11 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `conversations/conversations-list` | GET | `list_conversations` | OK |
| `conversations/conversation-details` | GET | `get_conversation` | OK |
| `conversations/create-new-conversation` | POST | `create_conversation` | OK |
| `conversations/toggle-status` | POST | `update_conversation_status` | OK |
| `conversation-assignments/assign-conversation` | POST | `assign_conversation` | OK |
| `conversations/add-labels` | POST | `add_labels_to_conversation` | OK |
| `conversations/list-labels` | GET | `get_conversation_labels` | OK |
| `conversations/toggle-priority` | PATCH | `set_conversation_priority` | OK |
| `conversations/get-conversation-counts` | GET | `get_conversation_counts` | OK |
| `conversations/conversations-filter` | POST | `filter_conversations` | OK |
| `conversations/update-custom-attributes` | POST | `set_conversation_custom_attributes` | OK |
| `conversations/update-conversation` | PATCH | — | Covered by `set_conversation_priority` |
| `conversations/conversation-reporting-events` | GET | — | EXCLUDED |

### Messages (Application API v1) — 3 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `messages/get-messages` | GET | `list_messages` | OK |
| `messages/create-new-message` | POST | `send_message` | OK |
| `messages/delete-a-message` | DELETE | `delete_message` | OK |

### Agents (Application API v1) — 2 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `agents/list-agents-in-account` | GET | `list_agents` | OK |
| (implicit GET by ID) | GET | `get_agent` | OK |
| `agents/add-a-new-agent` | POST | — | EXCLUDED |
| `agents/update-agent-in-account` | PATCH | — | EXCLUDED |
| `agents/remove-an-agent-from-account` | DELETE | — | EXCLUDED |

### Teams (Application API v1) — 9 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `teams/list-all-teams` | GET | `list_teams` | OK |
| `teams/get-a-team-details` | GET | `get_team` | OK |
| `teams/list-agents-in-team` | GET | `get_team_members` | OK |
| `teams/create-a-team` | POST | `create_team` | OK |
| `teams/update-a-team` | PATCH | `update_team` | OK |
| `teams/delete-a-team` | DELETE | `delete_team` | OK |
| `teams/add-a-new-agent` | POST | `add_team_members` | OK |
| `teams/update-agents-in-team` | PATCH | `update_team_members` | OK |
| `teams/remove-an-agent-from-team` | DELETE | `remove_team_members` | OK |

### Inboxes (Application API v1) — 3 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `inboxes/list-all-inboxes` | GET | `list_inboxes` | OK |
| `inboxes/get-an-inbox` | GET | `get_inbox` | OK |
| `inboxes/show-inbox-agent-bot` | GET | `get_inbox_agent_bot` | OK |
| `inboxes/create-an-inbox` | POST | — | EXCLUDED |
| `inboxes/update-inbox` | PATCH | — | EXCLUDED |
| `inboxes/add-or-remove-agent-bot` | POST | — | EXCLUDED |

### Inbox Members (Application API v1) — 4 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `inboxes/list-agents-in-inbox` | GET | `list_inbox_agents` | OK |
| `inboxes/add-a-new-agent` | POST | `add_inbox_agents` | OK |
| `inboxes/update-agents-in-inbox` | PATCH | `update_inbox_agents` | OK |
| `inboxes/remove-an-agent-from-inbox` | DELETE | `remove_inbox_agents` | OK |

### Labels (Application API v1) — 4 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| (implicit list) | GET | `list_labels` | OK |
| (implicit create) | POST | `create_label` | OK |
| (implicit update) | PATCH | `update_label` | OK |
| (implicit delete) | DELETE | `delete_label` | OK |

### Canned Responses (Application API v1) — 4 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `canned-responses/list-all-canned-responses-in-an-account` | GET | `list_canned_responses` | OK |
| `canned-responses/add-a-new-canned-response` | POST | `create_canned_response` | OK |
| `canned-responses/update-canned-response-in-account` | PATCH | `update_canned_response` | OK |
| `canned-responses/remove-a-canned-response-from-account` | DELETE | `delete_canned_response` | OK |

### Reports (Application API v2) — 7 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `reports/get-account-reports` | GET | `get_account_report` | OK |
| `reports/get-account-reports-summary` | GET | `get_report_summary` | OK |
| `reports/get-conversation-statistics-grouped-by-*` (×4) | GET | `get_conversation_statistics` | OK |
| `reports/account-conversation-metrics` | GET | `get_conversation_metrics` | OK |
| `reports/agent-conversation-metrics` | GET | `get_conversation_metrics` (type=agent) | OK |
| `reports/get-first-response-time-distribution-by-channel` | GET | `get_first_response_time_report` | OK |
| `reports/get-inbox-label-matrix-report` | GET | `get_inbox_label_matrix_report` | OK |
| `reports/get-outgoing-messages-count-grouped-by-entity` | GET | `get_outgoing_messages_report` | OK |
| `reports/account-reporting-events` | GET | — | EXCLUDED |

### Webhooks (Application API v1) — 4 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `webhooks/list-all-webhooks` | GET | `list_webhooks` | OK |
| `webhooks/add-a-webhook` | POST | `create_webhook` | OK |
| `webhooks/update-a-webhook-object` | PATCH | `update_webhook` | OK |
| `webhooks/delete-a-webhook` | DELETE | `delete_webhook` | OK |

### Custom Attributes (Application API v1) — 5 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `custom-attributes/list-all-custom-attributes-in-an-account` | GET | `list_custom_attributes` | OK |
| `custom-attributes/get-a-custom-attribute-details` | GET | `get_custom_attribute` | OK |
| `custom-attributes/add-a-new-custom-attribute` | POST | `create_custom_attribute` | OK |
| `custom-attributes/update-custom-attribute-in-account` | PATCH | `update_custom_attribute` | OK |
| `custom-attributes/remove-a-custom-attribute-from-account` | DELETE | `delete_custom_attribute` | OK |

### Automation Rules (Application API v1) — 5 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `automation-rule/list-all-automation-rules-in-an-account` | GET | `list_automation_rules` | OK |
| `automation-rule/get-a-automation-rule-details` | GET | `get_automation_rule` | OK |
| `automation-rule/add-a-new-automation-rule` | POST | `create_automation_rule` | OK |
| `automation-rule/update-automation-rule-in-account` | PATCH | `update_automation_rule` | OK |
| `automation-rule/remove-a-automation-rule-from-account` | DELETE | `delete_automation_rule` | OK |

### Custom Filters (Application API v1) — 5 tools

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `custom-filters/list-all-custom-filters` | GET | `list_custom_filters` | OK |
| `custom-filters/get-a-custom-filter-details` | GET | `get_custom_filter` | OK |
| `custom-filters/create-a-custom-filter` | POST | `create_custom_filter` | OK |
| `custom-filters/update-a-custom-filter` | PATCH | `update_custom_filter` | OK |
| `custom-filters/delete-a-custom-filter` | DELETE | `delete_custom_filter` | OK |

### Integrations (Application API v1) — 1 tool

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `integrations/list-all-the-integrations` | GET | `list_integrations` | OK |
| `integrations/create-an-integration-hook` | POST | — | EXCLUDED |
| `integrations/update-an-integration-hook` | PATCH | — | EXCLUDED |
| `integrations/delete-an-integration-hook` | DELETE | — | EXCLUDED |

### Profile (Application API v1) — 1 tool

| llms.txt URL | Method | MCP Tool | Status |
|--------------|--------|----------|--------|
| `profile/fetch-user-profile` | GET | `get_profile` | OK |

### Health — 1 tool

| Endpoint | MCP Tool | Status |
|----------|----------|--------|
| `GET /api/v1/accounts/{id}` | `chatwoot_health` | OK |

## Client API Endpoints (NOT Application API)

These URLs in llms.txt point to Client/Public API (`/public/api/v1/inboxes/{inbox_identifier}/...`):

| llms.txt Path | Reason |
|---------------|--------|
| `contacts-api/*` | Client API (create/get/update contact via widget) |
| `conversations-api/*` | Client API (create/list/resolve conversations via widget) |
| `conversations-api/toggle-typing-status` | Client API |
| `conversations-api/update-last-seen` | Client API |
| `messages-api/*` | Client API (create/list/update messages via widget) |

## Platform API Endpoints (NOT Application API)

| llms.txt Path | Reason |
|---------------|--------|
| `accounts/*` | Platform API (super-admin) |
| `agentbots/*` | Platform API (global agent bots) |
| `users/*` | Platform API (user CRUD) |

## Still-Excluded Application API Endpoints

| Endpoint | Method | Reason |
|----------|--------|--------|
| Agents CRUD | POST/PATCH/DELETE | Admin — risky for AI automation |
| Inboxes Create/Update | POST/PATCH | Complex channel-specific config |
| Agent Bots CRUD | All | Specialized feature, low demand |
| Integration Hooks CRUD | POST/PATCH/DELETE | Platform-level config modifications |
| Contact Inboxes Create | POST | Rarely needed, complex association |
| Help Center / Portals | All | Separate content domain (roadmap) |
| Account Users CRUD | All | Super-admin, security-sensitive |
| Audit Logs | GET | Enterprise only |
| CSAT Survey | GET | Niche, low demand |
| Account Reporting Events | GET | Admin-only |
| Conversation Reporting Events | GET | Per-conversation niche |
| Account Agent Bots List/Get | GET | Specialized, low demand |

## Mutable Tool Risk Assessment

| Tool | HTTP Method | Risk Level | Notes |
|------|-------------|------------|-------|
| `delete_contact` | DELETE | HIGH | Permanently removes contact + data |
| `delete_message` | DELETE | MEDIUM | Removes single message |
| `delete_team` | DELETE | HIGH | Removes team + assignments |
| `delete_label` | DELETE | MEDIUM | Removes label from system |
| `delete_canned_response` | DELETE | LOW | Removes template |
| `delete_webhook` | DELETE | MEDIUM | Stops event notifications |
| `delete_custom_attribute` | DELETE | MEDIUM | Removes attribute definition |
| `delete_automation_rule` | DELETE | MEDIUM | Stops automation |
| `delete_custom_filter` | DELETE | LOW | Removes saved filter |
| `remove_inbox_agents` | DELETE | MEDIUM | Unassigns agents from inbox |
| `remove_team_members` | DELETE | MEDIUM | Removes agents from team |
| `merge_contacts` | POST | HIGH | Permanently deletes mergee contact |
| `create_webhook` | POST | MEDIUM | Can send data to external URLs |
| `update_webhook` | PATCH | MEDIUM | Can redirect data to external URLs |

## Consistency Verification

### Naming
- All entity IDs use `*_id` suffix consistently
- All tools follow `verb_noun` pattern (list_, get_, create_, update_, delete_, etc.)

### HTTP Methods
- All `update_*` tools use PATCH (verified in client.ts)
- All `delete_*` tools use DELETE
- `update_conversation_status` and `assign_conversation` use POST (Chatwoot API design)

### Pagination
- Tools with pagination support: `list_contacts`, `search_contacts`, `filter_contacts`, `list_conversations`, `filter_conversations`
- Tools without pagination (small collections): agents, teams, labels, inboxes, etc.

## Conclusion

**No new Application API endpoints to implement.** The 81-tool coverage is complete for all safe, generally-useful Application API v1/v2 endpoints. The MCP server is ready for v0.5.0 release.
