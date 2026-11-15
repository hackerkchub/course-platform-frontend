import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  AdminReviewItem,
  ReviewFilterParams,
  ModerateReviewPayload,
} from '@/types/admin-review';
import type { ApiResponse } from '@/types/api';

export interface ReviewsListResult {
  reviews: AdminReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminReviewsApi = {
  async getReviews(params: ReviewFilterParams = {}): Promise<ReviewsListResult> {
    const res = await apiClient.get<ApiResponse<AdminReviewItem[]> & {
      pagination?: { page: number; limit: number; total: number; totalPages?: number };
    }>(API_ENDPOINTS.reviews.adminList, { params });

    const data = res.data;
    const reviews = Array.isArray(data.data) ? data.data : [];
    const total = data.pagination?.total ?? reviews.length;
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const totalPages = data.pagination?.totalPages || Math.max(1, Math.ceil(total / limit));

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async moderateReview(id: number, payload: ModerateReviewPayload): Promise<AdminReviewItem> {
    const res = await apiClient.patch<ApiResponse<AdminReviewItem>>(
      API_ENDPOINTS.reviews.adminModerate(id),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to moderate review');
    }
    return res.data.data;
  },
};
