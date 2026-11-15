export type LeadStatus = 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
export type DemoType = 'live' | 'recorded';

export const LEAD_STATUS_RANKS: Record<LeadStatus, number> = {
  pending: 10,
  contacted: 20,
  scheduled: 30,
  completed: 40,
  cancelled: 50,
};

export interface DemoLeadItem {
  id: number;
  reference_no: string;
  course_id: number;
  course_name?: string;
  course_slug?: string;
  user_id?: number | null;
  student_name: string;
  email: string;
  phone: string;
  city?: string | null;
  current_qualification?: string | null;
  experience_level?: string | null;
  preferred_demo_type?: DemoType | string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  status: LeadStatus;
  scheduled_at?: string | null;
  meeting_link?: string | null;
  assigned_to?: number | null;
  assigned_user_name?: string | null;
  admin_notes?: string | null;
  follow_up_at?: string | null;
  attended?: boolean | null;
  converted_to_enrollment?: boolean | number | null;
  enrollment_id?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface DemoActivityLogItem {
  id: number;
  demo_request_id: number;
  action: string;
  old_status?: string | null;
  new_status?: string | null;
  note?: string | null;
  performed_by?: number | null;
  performer_name?: string | null;
  performer_role?: string | null;
  created_at: string;
}

export interface DemoLeadDetail extends DemoLeadItem {
  activity_history?: DemoActivityLogItem[];
}

export interface DemoRequestsSummary {
  total: number;
  pending: number;
  contacted: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface LeadFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  course_id?: number;
  demo_type?: string;
  from_date?: string;
  to_date?: string;
}

export interface UpdateLeadPayload {
  status?: LeadStatus;
  assigned_to?: number | null;
  scheduled_at?: string | null;
  meeting_link?: string | null;
  admin_notes?: string | null;
  follow_up_at?: string | null;
  attended?: boolean | null;
}

export interface BulkUpdateLeadsPayload {
  ids: number[];
  status?: LeadStatus;
  assigned_to?: number | null;
  admin_notes?: string;
}

export interface ConvertLeadPayload {
  batch_id?: number | null;
  access_expires_at?: string | null;
}
