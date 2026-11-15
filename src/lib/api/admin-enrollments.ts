import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  AdminEnrollmentItem,
  EnrollmentFilterParams,
  CreateEnrollmentPayload,
  UpdateEnrollmentPayload,
} from '@/types/admin-enrollment';
import type { ApiResponse } from '@/types/api';

export interface EnrollmentsListResult {
  enrollments: AdminEnrollmentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminEnrollmentsApi = {
  async getEnrollments(params: EnrollmentFilterParams = {}): Promise<EnrollmentsListResult> {
    const res = await apiClient.get<ApiResponse<AdminEnrollmentItem[]> & {
      pagination?: { page: number; limit: number; total: number; totalPages?: number };
    }>(API_ENDPOINTS.enrollments.adminList, { params });

    const data = res.data;
    const enrollments = Array.isArray(data.data) ? data.data : [];
    const total = data.pagination?.total ?? enrollments.length;
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const totalPages = data.pagination?.totalPages || Math.max(1, Math.ceil(total / limit));

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async grantEnrollment(payload: CreateEnrollmentPayload): Promise<AdminEnrollmentItem> {
    const res = await apiClient.post<ApiResponse<AdminEnrollmentItem>>(
      API_ENDPOINTS.enrollments.adminGrant,
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to grant enrollment');
    }
    return res.data.data;
  },

  async updateEnrollment(id: number, payload: UpdateEnrollmentPayload): Promise<AdminEnrollmentItem> {
    const res = await apiClient.patch<ApiResponse<AdminEnrollmentItem>>(
      API_ENDPOINTS.enrollments.adminUpdate(id),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update enrollment');
    }
    return res.data.data;
  },
};
