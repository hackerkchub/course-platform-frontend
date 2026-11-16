import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface NotificationSettingItem {
  id: number;
  event_type: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  inapp_enabled: boolean;
  notify_super_admin: boolean;
  notify_counsellor: boolean;
  notify_instructor: boolean;
  notify_student: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLogItem {
  id: number;
  idempotency_key?: string | null;
  user_id?: number | null;
  type: string;
  event_type?: string | null;
  event_id?: string | null;
  template_name?: string | null;
  channel: 'email' | 'whatsapp' | 'inapp';
  recipient: string;
  payload?: any;
  status: 'queued' | 'processing' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  sent_at?: string | null;
  next_retry_at?: string | null;
  error_message?: string | null;
  created_at: string;
}

export async function fetchNotificationSettings(): Promise<NotificationSettingItem[]> {
  const res = await apiClient.get<{ success: boolean; data: NotificationSettingItem[] }>(
    API_ENDPOINTS.notifications.adminSettings
  );
  return res.data.data;
}

export async function updateNotificationSetting(eventType: string, updates: Partial<NotificationSettingItem>): Promise<NotificationSettingItem> {
  const res = await apiClient.patch<{ success: boolean; data: NotificationSettingItem }>(
    API_ENDPOINTS.notifications.adminUpdateSetting(eventType),
    updates
  );
  return res.data.data;
}

export async function fetchNotificationLogs(params: {
  channel?: string;
  status?: string;
  eventType?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ logs: NotificationLogItem[]; total: number }> {
  const res = await apiClient.get(API_ENDPOINTS.notifications.adminLogs, { params });
  return res.data;
}

export async function retryNotificationLog(id: number): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.notifications.adminRetry(id));
  return res.data;
}

export async function recordWhatsAppConsent(data: {
  phone: string;
  status: 'opted_in' | 'opted_out';
  source?: string;
  evidence?: string;
  reason?: string;
}): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.notifications.whatsappConsent, data);
  return res.data;
}
