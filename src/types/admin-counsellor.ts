export interface CounsellorItem {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  role: 'counsellor';
  status: 'active' | 'blocked';
  google_id_linked: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CounsellorSummary {
  total: number;
  active: number;
  blocked: number;
  google_linked: number;
}

export interface CounsellorLeadMetrics {
  assigned_leads: number;
  completed_leads: number;
}

export interface CounsellorsListResponse {
  counsellors: CounsellorItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: CounsellorSummary;
}

export interface CounsellorDetailsResponse {
  counsellor: CounsellorItem;
  metrics: CounsellorLeadMetrics;
}

export interface ProvisionCounsellorPayload {
  name: string;
  email: string;
  phone?: string | null;
}

export interface PromoteStudentPayload {
  email: string;
}

export interface UpdateCounsellorStatusPayload {
  status: 'active' | 'blocked';
}
