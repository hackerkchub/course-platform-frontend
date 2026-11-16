import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  CounsellorsListResponse,
  CounsellorDetailsResponse,
  ProvisionCounsellorPayload,
  PromoteStudentPayload,
  CounsellorItem,
} from '@/types/admin-counsellor';

export interface GetCounsellorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'blocked';
}

/**
 * Fetch paginated list of counsellors with search & status filters
 */
export async function getAdminCounsellors(
  params: GetCounsellorsParams = {}
): Promise<CounsellorsListResponse> {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.search && params.search.trim()) queryParams.search = params.search.trim();
  if (params.status && params.status !== 'all') queryParams.status = params.status;

  const res = await apiClient.get<{ success: boolean; data: CounsellorsListResponse }>(
    API_ENDPOINTS.counsellors.adminList,
    { params: queryParams }
  );

  return res.data.data;
}

/**
 * Fetch single counsellor details with real lead metrics
 */
export async function getAdminCounsellorDetails(
  id: number
): Promise<CounsellorDetailsResponse> {
  const res = await apiClient.get<{ success: boolean; data: CounsellorDetailsResponse }>(
    API_ENDPOINTS.counsellors.adminById(id)
  );

  return res.data.data;
}

/**
 * Provision a new Counsellor account (pending first-time Google sign-in)
 */
export async function provisionAdminCounsellor(
  payload: ProvisionCounsellorPayload
): Promise<CounsellorItem> {
  const res = await apiClient.post<{ success: boolean; data: { counsellor: CounsellorItem } }>(
    API_ENDPOINTS.counsellors.adminProvision,
    payload
  );

  return res.data.data.counsellor;
}

/**
 * Promote an existing Student account to Counsellor
 */
export async function promoteAdminStudent(
  payload: PromoteStudentPayload
): Promise<CounsellorItem> {
  const res = await apiClient.post<{ success: boolean; data: { counsellor: CounsellorItem } }>(
    API_ENDPOINTS.counsellors.adminPromote,
    payload
  );

  return res.data.data.counsellor;
}

/**
 * Activate or Deactivate a Counsellor account
 */
export async function updateAdminCounsellorStatus(
  id: number,
  status: 'active' | 'blocked'
): Promise<CounsellorItem> {
  const res = await apiClient.patch<{ success: boolean; data: { counsellor: CounsellorItem } }>(
    API_ENDPOINTS.counsellors.adminStatus(id),
    { status }
  );

  return res.data.data.counsellor;
}

export const adminCounsellorsApi = {
  getCounsellors: getAdminCounsellors,
  getCounsellorDetails: getAdminCounsellorDetails,
  provisionCounsellor: provisionAdminCounsellor,
  promoteStudent: promoteAdminStudent,
  updateStatus: updateAdminCounsellorStatus,
};

export default adminCounsellorsApi;
