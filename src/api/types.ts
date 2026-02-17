export interface ChatwootContact {
  id: number;
  name?: string;
  email?: string;
  phone_number?: string;
  identifier?: string;
  thumbnail?: string;
  custom_attributes?: Record<string, unknown>;
  additional_attributes?: Record<string, unknown>;
  contact_inboxes?: Array<Record<string, unknown>>;
  created_at?: string;
  updated_at?: string;
  last_activity_at?: string;
}

export interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: 'open' | 'resolved' | 'pending' | 'snoozed';
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  assignee?: Record<string, unknown>;
  contact?: ChatwootContact;
  messages?: ChatwootMessage[];
  labels?: string[];
  team_id?: number;
  additional_attributes?: Record<string, unknown>;
  custom_attributes?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  unread_count?: number;
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing' | 'activity' | 'template';
  content_type?: string;
  private: boolean;
  sender?: Record<string, unknown>;
  conversation_id: number;
  attachments?: Array<Record<string, unknown>>;
  content_attributes?: Record<string, unknown>;
  created_at?: string;
}

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  role: 'agent' | 'administrator';
  availability_status?: 'available' | 'busy' | 'offline';
  confirmed?: boolean;
  thumbnail?: string;
}

export interface ChatwootTeam {
  id: number;
  name: string;
  description?: string;
  allow_auto_assign?: boolean;
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  avatar_url?: string;
  greeting_enabled?: boolean;
  greeting_message?: string;
}

export interface ChatwootLabel {
  id: number;
  title: string;
  description?: string;
  color?: string;
  show_on_sidebar?: boolean;
}

export interface ChatwootCannedResponse {
  id: number;
  short_code: string;
  content: string;
}

export interface ChatwootWebhook {
  id: number;
  url: string;
  subscriptions: string[];
}

export interface ChatwootCustomAttribute {
  id: number;
  attribute_display_name: string;
  attribute_display_type: string;
  attribute_description?: string;
  attribute_key: string;
  attribute_model: 'contact_attribute' | 'conversation_attribute';
  attribute_values?: string[];
  default_value?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatwootAutomationRule {
  id: number;
  name: string;
  description?: string;
  event_name: string;
  conditions: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChatwootCustomFilter {
  id: number;
  name: string;
  filter_type: 'conversation' | 'contact' | 'report';
  query: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: {
    meta?: {
      count?: number;
      current_page?: number;
      all_count?: number;
    };
    payload?: T[];
  };
}

export interface ChatwootApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
