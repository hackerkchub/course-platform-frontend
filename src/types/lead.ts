export type LeadStatus = 'pending' | 'contacted' | 'scheduled' | 'attended' | 'converted' | 'lost';

export interface DemoRequest {
  id: number;
  reference_no: string;
  course_id: number;
  course_name?: string;
  user_id: number;
  student_name: string;
  student_email: string;
  phone: string;
  status: LeadStatus;
  scheduled_time: string;
  assigned_to?: number | null;
  counsellor_name?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNoteItem {
  id: number;
  demo_request_id: number;
  performed_by: number;
  author_name: string;
  note: string;
  created_at: string;
}
