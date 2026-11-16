export interface WhatsAppContact {
  id: number;
  display_name: string;
  department: string;
  country_code: string;
  phone_number: string;
  normalized_phone: string;
  is_active: boolean;
  is_default: boolean;
  custom_message_template: string | null;
  notes: string | null;
  assigned_courses_count?: number;
  created_by?: number | null;
  created_by_name?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppContactFormData {
  display_name: string;
  department: string;
  country_code: string;
  phone_number: string;
  is_active: boolean;
  is_default: boolean;
  custom_message_template?: string | null;
  notes?: string | null;
}

export interface WhatsAppPreviewResponse {
  contact_id: number;
  display_name: string;
  department: string;
  normalized_phone: string;
  interpolated_message: string;
  click_to_chat_url: string;
}

export interface CourseWhatsAppInfo {
  available: boolean;
  display_name?: string;
  department?: string;
  click_to_chat_url?: string;
  prefilled_message?: string;
}
