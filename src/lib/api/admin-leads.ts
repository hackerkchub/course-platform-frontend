import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  DemoLeadItem,
  DemoLeadDetail,
  DemoRequestsSummary,
  LeadFilterParams,
  UpdateLeadPayload,
  BulkUpdateLeadsPayload,
  ConvertLeadPayload,
} from '@/types/admin-lead';
import type { ApiResponse } from '@/types/api';

export interface LeadsListResult {
  leads: DemoLeadItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: DemoRequestsSummary;
}

export const adminLeadsApi = {
  /**
   * List demo requests / leads with filters & pagination
   * Authorized: counsellor, admin, super_admin
   */
  async getLeads(params: LeadFilterParams = {}): Promise<LeadsListResult> {
    const res = await apiClient.get<any>(API_ENDPOINTS.demo.adminRequests, { params });

    const payload = res.data;

    // Robust parsing supporting both:
    // Structure A (actual backend): payload.data = { requests: [...], summary: {...}, pagination: {...} }
    // Structure B (direct array): payload.data = [...]
    // Structure C (root requests): payload.requests = [...]
    let rawList: DemoLeadItem[] = [];
    let summary: DemoRequestsSummary | undefined = undefined;
    let paginationData: any = payload?.pagination;

    if (Array.isArray(payload?.data)) {
      rawList = payload.data;
    } else if (payload?.data && typeof payload.data === 'object') {
      if (Array.isArray(payload.data.requests)) {
        rawList = payload.data.requests;
      }
      summary = payload.data.summary;
      paginationData = payload.data.pagination || paginationData;
    } else if (Array.isArray(payload?.requests)) {
      rawList = payload.requests;
      summary = payload.summary;
    }

    const leads: DemoLeadItem[] = Array.isArray(rawList) ? rawList : [];
    const page = Number(params.page || paginationData?.page || 1);
    const limit = Number(params.limit || paginationData?.limit || 10);
    const total = Number(paginationData?.total ?? leads.length);
    const totalPages = Number(
      paginationData?.totalPages ||
      paginationData?.total_pages ||
      Math.max(1, Math.ceil(total / limit))
    );

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summary: summary || payload?.summary,
    };
  },

  /**
   * Get single lead detail with activity logs
   * Authorized: counsellor, admin, super_admin
   */
  async getLeadById(id: number): Promise<DemoLeadDetail> {
    const res = await apiClient.get<ApiResponse<DemoLeadDetail>>(
      API_ENDPOINTS.demo.adminRequestById(id)
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to load lead details');
    }
    return res.data.data;
  },

  /**
   * Update lead status, scheduling info, notes
   * Authorized: counsellor, admin, super_admin (reverting rank requires admin)
   */
  async updateLead(id: number, payload: UpdateLeadPayload): Promise<DemoLeadItem> {
    const res = await apiClient.patch<ApiResponse<DemoLeadItem>>(
      API_ENDPOINTS.demo.adminUpdateRequest(id),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update lead');
    }
    return res.data.data;
  },

  /**
   * Append internal follow-up note to lead
   * Authorized: counsellor, admin, super_admin
   */
  async addNote(id: number, note: string): Promise<DemoLeadItem> {
    const res = await apiClient.post<ApiResponse<DemoLeadItem>>(
      API_ENDPOINTS.demo.adminAddNote(id),
      { note }
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to add note');
    }
    return res.data.data;
  },

  /**
   * Bulk update status or assignment
   * Authorized: counsellor, admin, super_admin
   */
  async bulkUpdate(payload: BulkUpdateLeadsPayload): Promise<{ updatedCount: number }> {
    const res = await apiClient.patch<ApiResponse<{ updatedCount: number }>>(
      API_ENDPOINTS.demo.adminBulk,
      payload
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to perform bulk update');
    }
    return res.data.data || { updatedCount: payload.ids.length };
  },

  /**
   * Convert lead to student enrollment
   * Authorized: admin, super_admin
   */
  async convertLead(id: number, payload: ConvertLeadPayload = {}): Promise<{ enrollment_id: number }> {
    const res = await apiClient.post<ApiResponse<{ enrollment_id: number }>>(
      API_ENDPOINTS.demo.adminConvert(id),
      payload
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to convert lead to enrollment');
    }
    return res.data.data;
  },

  /**
   * Delete lead record
   * Authorized: admin, super_admin
   */
  async deleteLead(id: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.demo.adminDeleteRequest(id)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete lead');
    }
  },

  /**
   * Export leads to CSV
   * Authorized: admin, super_admin
   */
  async exportCsv(): Promise<Blob> {
    const res = await apiClient.get(API_ENDPOINTS.demo.adminExport, {
      responseType: 'blob',
    });
    return res.data;
  },
};
