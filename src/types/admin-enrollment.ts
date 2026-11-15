export type EnrollmentStatus = 'active' | 'expired' | 'cancelled' | 'completed';
export type EnrollmentSource = 'free' | 'admin_manual' | 'demo_convert';

export interface AdminEnrollmentItem {
  id: number;
  user_id: number;
  student_name?: string;
  student_email?: string;
  course_id: number;
  course_name?: string;
  course_slug?: string;
  batch_id?: number | null;
  batch_name?: string | null;
  source: EnrollmentSource;
  status: EnrollmentStatus;
  progress_percentage?: number;
  enrolled_at: string;
  expires_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
}

export interface EnrollmentFilterParams {
  page?: number;
  limit?: number;
  course_id?: number;
  user_id?: number;
  status?: string;
  source?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface CreateEnrollmentPayload {
  user_id: number;
  course_id: number;
  batch_id?: number | null;
  access_expires_at?: string | null;
  notes?: string | null;
}

export interface UpdateEnrollmentPayload {
  enrollment_status?: EnrollmentStatus;
  batch_id?: number | null;
  access_expires_at?: string | null;
  notes?: string | null;
}
