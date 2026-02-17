# Chatwoot Application API — MCP Coverage

Last updated: 2026-02-16

## Summary

| Metric | Count |
|--------|-------|
| Tools (v0.1.0) | 28 |
| Tools (v0.3.0) | 59 |
| Tools (v0.4.0) | 68 |
| Tools (v0.5.0) | 81 |
| Resources covered | 21 |
| Endpoints excluded | ~11 (see Exclusions) |

## Coverage Matrix

### Contacts

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/contacts` | GET | `list_contacts` | OK |
| `/contacts/{id}` | GET | `get_contact` | OK |
| `/contacts` | POST | `create_contact` | OK |
| `/contacts/{id}` | PATCH | `update_contact` | OK |
| `/contacts/{id}` | DELETE | `delete_contact` | OK |
| `/contacts/search` | GET | `search_contacts` | OK |
| `/contacts/{id}/conversations` | GET | `get_contact_conversations` | OK |
| `/contacts/filter` | POST | `filter_contacts` | OK |
| `/actions/contact_merge` | POST | `merge_contacts` | v0.4 |
| `/contacts/{id}/contactable_inboxes` | GET | `get_contactable_inboxes` | NEW v0.5 |

### Contact Labels

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/contacts/{id}/labels` | GET | `get_contact_labels` | NEW v0.5 |
| `/contacts/{id}/labels` | POST | `add_labels_to_contact` | NEW v0.5 |

### Conversations

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/conversations` | GET | `list_conversations` | OK |
| `/conversations/{id}` | GET | `get_conversation` | OK |
| `/conversations` | POST | `create_conversation` | OK |
| `/conversations/{id}/toggle_status` | POST | `update_conversation_status` | OK |
| `/conversations/{id}/assignments` | POST | `assign_conversation` | OK |
| `/conversations/{id}/labels` | POST | `add_labels_to_conversation` | OK |
| `/conversations/{id}/labels` | GET | `get_conversation_labels` | OK |
| `/conversations/{id}` | PATCH | `set_conversation_priority` | OK |
| `/conversations/counts` | GET | `get_conversation_counts` | OK |
| `/conversations/filter` | POST | `filter_conversations` | v0.4 |
| `/conversations/{id}/custom_attributes` | POST | `set_conversation_custom_attributes` | NEW v0.5 |

### Messages

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/conversations/{id}/messages` | GET | `list_messages` | OK |
| `/conversations/{id}/messages` | POST | `send_message` | OK |
| `/conversations/{id}/messages/{msg_id}` | DELETE | `delete_message` | OK |

### Agents

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/agents` | GET | `list_agents` | OK |
| `/agents/{id}` | GET | `get_agent` | OK |
| `/agents` | POST | — | EXCLUDED |
| `/agents/{id}` | PATCH | — | EXCLUDED |
| `/agents/{id}` | DELETE | — | EXCLUDED |

### Teams

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/teams` | GET | `list_teams` | OK |
| `/teams/{id}` | GET | `get_team` | OK |
| `/teams/{id}/team_members` | GET | `get_team_members` | OK |
| `/teams` | POST | `create_team` | OK |
| `/teams/{id}` | PATCH | `update_team` | OK |
| `/teams/{id}` | DELETE | `delete_team` | OK |
| `/teams/{id}/team_members` | POST | `add_team_members` | v0.4 |
| `/teams/{id}/team_members` | PATCH | `update_team_members` | NEW v0.5 |
| `/teams/{id}/team_members` | DELETE | `remove_team_members` | v0.4 |

### Inboxes

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/inboxes` | GET | `list_inboxes` | OK |
| `/inboxes/{id}` | GET | `get_inbox` | OK |
| `/inboxes/{id}/agent_bot` | GET | `get_inbox_agent_bot` | NEW v0.5 |
| `/inboxes` | POST | — | EXCLUDED |
| `/inboxes/{id}` | PATCH | — | EXCLUDED |

### Inbox Members

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/inbox_members/{inbox_id}` | GET | `list_inbox_agents` | v0.4 |
| `/inbox_members` | POST | `add_inbox_agents` | v0.4 |
| `/inbox_members` | PATCH | `update_inbox_agents` | v0.4 |
| `/inbox_members` | DELETE | `remove_inbox_agents` | v0.4 |

### Labels

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/labels` | GET | `list_labels` | OK |
| `/labels` | POST | `create_label` | OK |
| `/labels/{id}` | PATCH | `update_label` | OK |
| `/labels/{id}` | DELETE | `delete_label` | OK |

### Canned Responses

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/canned_responses` | GET | `list_canned_responses` | OK |
| `/canned_responses` | POST | `create_canned_response` | OK |
| `/canned_responses/{id}` | PATCH | `update_canned_response` | OK |
| `/canned_responses/{id}` | DELETE | `delete_canned_response` | OK |

### Webhooks

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/webhooks` | GET | `list_webhooks` | OK |
| `/webhooks` | POST | `create_webhook` | OK |
| `/webhooks/{id}` | PATCH | `update_webhook` | OK |
| `/webhooks/{id}` | DELETE | `delete_webhook` | OK |

### Reports (API v2)

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/api/v2/.../reports` | GET | `get_account_report` | v0.4 |
| `/api/v2/.../reports/summary` | GET | `get_report_summary` | v0.4 |
| `/api/v2/.../summary_reports/{entity}` | GET | `get_conversation_statistics` | NEW v0.5 |
| `/api/v2/.../reports/conversations` | GET | `get_conversation_metrics` | NEW v0.5 |
| `/api/v2/.../reports/first_response_time_distribution` | GET | `get_first_response_time_report` | NEW v0.5 |
| `/api/v2/.../reports/inbox_label_matrix` | GET | `get_inbox_label_matrix_report` | NEW v0.5 |
| `/api/v2/.../reports/outgoing_messages_count` | GET | `get_outgoing_messages_report` | NEW v0.5 |

### Custom Attributes

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/custom_attribute_definitions` | GET | `list_custom_attributes` | OK |
| `/custom_attribute_definitions/{id}` | GET | `get_custom_attribute` | NEW v0.5 |
| `/custom_attribute_definitions` | POST | `create_custom_attribute` | OK |
| `/custom_attribute_definitions/{id}` | PATCH | `update_custom_attribute` | OK |
| `/custom_attribute_definitions/{id}` | DELETE | `delete_custom_attribute` | OK |

### Automation Rules

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/automation_rules` | GET | `list_automation_rules` | OK |
| `/automation_rules/{id}` | GET | `get_automation_rule` | OK |
| `/automation_rules` | POST | `create_automation_rule` | OK |
| `/automation_rules/{id}` | PATCH | `update_automation_rule` | OK |
| `/automation_rules/{id}` | DELETE | `delete_automation_rule` | OK |

### Custom Filters

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/custom_filters` | GET | `list_custom_filters` | OK |
| `/custom_filters/{id}` | GET | `get_custom_filter` | OK |
| `/custom_filters` | POST | `create_custom_filter` | OK |
| `/custom_filters/{id}` | PATCH | `update_custom_filter` | OK |
| `/custom_filters/{id}` | DELETE | `delete_custom_filter` | OK |

### Integrations

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/integrations/apps` | GET | `list_integrations` | NEW v0.5 |

### Profile

| Endpoint | Method | MCP Tool | Status |
|----------|--------|----------|--------|
| `/profile` | GET | `get_profile` | v0.4 |

## Exclusions

| Endpoint | Reason |
|----------|--------|
| Agents CRUD (POST/PATCH/DELETE) | Admin operation — risky for AI automation |
| Inboxes CRUD (POST/PATCH) | Complex channel-specific config not suitable for MCP |
| Agent Bots CRUD | Specialized feature, low demand |
| Help Center / Portals | Separate content domain (roadmap) |
| Account Users CRUD | Super-admin, security-sensitive |
| Integration Hooks CRUD (POST/PATCH/DELETE) | Platform-level config modifications |
| Contact Inboxes POST | Rarely needed, complex association |
| Audit Logs | Enterprise only |
| CSAT Survey | Niche, low demand |
| Account Reporting Events | Admin-only access |
| Conversation Reporting Events | Per-conversation niche endpoint |

## Notes

- Reports use API v2 (`/api/v2/accounts/{id}/reports` and `/summary_reports`), all other endpoints use v1
- Platform API and Public/Client API are NOT in scope (documented in roadmap)
- File attachments in messages require multipart upload — not practical for MCP (LLMs don't produce binary files)
- All tools include optional `account_id` for multi-account support
