export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReviewItem {
  id: number;
  course_id: number;
  course_name?: string;
  course_slug?: string;
  user_id: number;
  user_name?: string;
  rating: number;
  title?: string | null;
  text?: string | null;
  moderation_status: ModerationStatus;
  moderation_reason?: string | null;
  moderated_by?: number | null;
  moderated_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ReviewFilterParams {
  page?: number;
  limit?: number;
  moderation_status?: string;
  course_id?: number;
  rating?: number;
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low';
}

export interface ModerateReviewPayload {
  moderation_status: 'approved' | 'rejected';
  reason?: string | null;
}
