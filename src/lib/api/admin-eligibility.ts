import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  EligibilityRulesData,
  EligibilityCheckItem,
  EligibilityChecksFilterParams,
} from '@/types/admin-eligibility';
import type { ApiResponse } from '@/types/api';

export interface EligibilityChecksResult {
  checks: EligibilityCheckItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminEligibilityApi = {
  /**
   * Get student eligibility checks for a course
   * Authorized: counsellor, admin, super_admin
   */
  async getCourseChecks(
    courseId: number,
    params: EligibilityChecksFilterParams = {}
  ): Promise<EligibilityChecksResult> {
    const res = await apiClient.get<ApiResponse<EligibilityCheckItem[]> & {
      pagination?: { page: number; limit: number; total: number; totalPages?: number };
    }>(API_ENDPOINTS.eligibility.adminChecks(courseId), { params });

    const data = res.data;
    const checks = Array.isArray(data.data) ? data.data : [];
    const total = data.pagination?.total ?? checks.length;
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const totalPages = data.pagination?.totalPages || Math.max(1, Math.ceil(total / limit));

    return {
      checks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  /**
   * Get eligibility rules for a course
   * Authorized: admin, super_admin
   */
  async getCourseRules(courseId: number): Promise<EligibilityRulesData> {
    const res = await apiClient.get<ApiResponse<EligibilityRulesData>>(
      API_ENDPOINTS.eligibility.adminRules(courseId)
    );
    return res.data?.data || { eligibility_enabled: false };
  },

  /**
   * Update eligibility rules for a course
   * Authorized: admin, super_admin
   */
  async updateCourseRules(
    courseId: number,
    payload: EligibilityRulesData
  ): Promise<EligibilityRulesData> {
    const res = await apiClient.put<ApiResponse<EligibilityRulesData>>(
      API_ENDPOINTS.eligibility.adminRules(courseId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update eligibility rules');
    }
    return res.data.data;
  },
};
