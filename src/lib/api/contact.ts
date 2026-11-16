import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface SubmitContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  admin_notes?: string | null;
  created_at: string;
}

export async function submitContactForm(payload: SubmitContactPayload): Promise<{ success: boolean; message: string; reference_id: number }> {
  const res = await apiClient.post(API_ENDPOINTS.contact.submit, payload);
  return res.data;
}

export async function fetchAdminContacts(params: {
  status?: string;
  assigned_to?: string | number;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ contacts: ContactMessageItem[]; total: number }> {
  const res = await apiClient.get(API_ENDPOINTS.contact.adminList, { params });
  return res.data;
}

export async function fetchAdminContactById(id: number): Promise<ContactMessageItem> {
  const res = await apiClient.get(API_ENDPOINTS.contact.adminById(id));
  return res.data.data;
}

export async function updateAdminContactStatus(id: number, data: { status: string; admin_notes?: string }): Promise<ContactMessageItem> {
  const res = await apiClient.patch(API_ENDPOINTS.contact.adminStatus(id), data);
  return res.data.data;
}

export async function assignAdminContact(id: number, assignedTo: number | null): Promise<ContactMessageItem> {
  const res = await apiClient.patch(API_ENDPOINTS.contact.adminAssign(id), { assigned_to: assignedTo });
  return res.data.data;
}
