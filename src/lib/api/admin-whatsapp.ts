import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  WhatsAppContact,
  WhatsAppContactFormData,
  WhatsAppPreviewResponse,
} from '@/types/whatsapp';

export interface WhatsAppListResponse {
  data: WhatsAppContact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface GetWhatsAppContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  is_active?: string;
}

export async function getWhatsAppContacts(
  params: GetWhatsAppContactsParams = {}
): Promise<WhatsAppListResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.search && params.search.trim()) queryParams.search = params.search.trim();
  if (params.department && params.department !== 'all') queryParams.department = params.department;
  if (params.is_active && params.is_active !== 'all') queryParams.is_active = params.is_active;

  const res = await apiClient.get<WhatsAppListResponse>(
    API_ENDPOINTS.whatsapp.adminList,
    { params: queryParams }
  );

  return res.data;
}

export async function getWhatsAppContact(id: number): Promise<WhatsAppContact> {
  const res = await apiClient.get<{ success: boolean; data: WhatsAppContact }>(
    API_ENDPOINTS.whatsapp.adminById(id)
  );
  return res.data.data;
}

export async function createWhatsAppContact(
  payload: WhatsAppContactFormData
): Promise<WhatsAppContact> {
  const res = await apiClient.post<{ success: boolean; data: WhatsAppContact }>(
    API_ENDPOINTS.whatsapp.adminCreate,
    payload
  );
  return res.data.data;
}

export async function updateWhatsAppContact(
  id: number,
  payload: Partial<WhatsAppContactFormData>
): Promise<WhatsAppContact> {
  const res = await apiClient.put<{ success: boolean; data: WhatsAppContact }>(
    API_ENDPOINTS.whatsapp.adminUpdate(id),
    payload
  );
  return res.data.data;
}

export async function setDefaultWhatsAppContact(id: number): Promise<WhatsAppContact> {
  const res = await apiClient.post<{ success: boolean; data: WhatsAppContact }>(
    API_ENDPOINTS.whatsapp.adminSetDefault(id)
  );
  return res.data.data;
}

export async function updateWhatsAppContactStatus(
  id: number,
  isActive: boolean
): Promise<WhatsAppContact> {
  const res = await apiClient.patch<{ success: boolean; data: WhatsAppContact }>(
    API_ENDPOINTS.whatsapp.adminStatus(id),
    { is_active: isActive }
  );
  return res.data.data;
}

export async function deleteWhatsAppContact(id: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.whatsapp.adminDelete(id));
}

export async function getWhatsAppPreview(
  id: number,
  params?: { course_id?: number; custom_message?: string }
): Promise<WhatsAppPreviewResponse> {
  const res = await apiClient.get<{ success: boolean; data: WhatsAppPreviewResponse }>(
    API_ENDPOINTS.whatsapp.adminPreview(id),
    { params }
  );
  return res.data.data;
}
