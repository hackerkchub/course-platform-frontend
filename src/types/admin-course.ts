export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseMode = 'online' | 'offline' | 'hybrid' | 'self_paced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface AdminCourseItem {
  id: number;
  course_code: string;
  course_name: string;
  slug: string;
  short_description?: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  subcategory_id: number;
  subcategory_name?: string;
  instructor_id?: number | null;
  instructor_name?: string | null;
  instructor_designation?: string | null;
  course_level: CourseLevel;
  language: string;
  mode: CourseMode;
  duration_hours: number;
  duration_days?: number | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  price: number;
  offer_price?: number | null;
  currency?: string;
  status: CourseStatus;
  is_featured?: boolean;
  is_trending?: boolean;
  enrollment_count?: number;
  total_views?: number;
  whatsapp_contact_id?: number | null;
  whatsapp_enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateCoursePayload {
  course_code: string;
  course_name: string;
  slug?: string;
  short_description: string;
  description: string;
  subcategory_id: number;
  instructor_id?: number | null;
  course_level: CourseLevel;
  language: string;
  mode: CourseMode;
  duration_hours: number;
  duration_days?: number | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  intro_video_url?: string | null;
  demo_video_url?: string | null;
  alt_text?: string | null;
  brochure_url?: string | null;
  syllabus_url?: string | null;
  gallery_images?: string[] | null;
  price: number;
  offer_price?: number | null;
  currency?: string;
  tax_inclusive?: boolean;
  gst_percentage?: number;
  is_free?: boolean;
  refund_policy?: string | null;
  refund_days?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_trending?: boolean;
  display_order?: number;
  whatsapp_contact_id?: number | null;
  whatsapp_enabled?: boolean;
  tags?: string[];
  what_you_will_learn?: string[];
  tools_covered?: string[];
  prerequisites?: string[];
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

// Curriculum Types
export type LessonType = 'video' | 'article' | 'quiz' | 'assignment';

export interface LessonItem {
  id: number;
  module_id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  content_url?: string | null;
  duration_seconds?: number;
  is_preview?: boolean;
  is_published?: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModuleItem {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  display_order: number;
  is_published?: boolean;
  lessons: LessonItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateModulePayload {
  title: string;
  description?: string | null;
  display_order?: number;
  is_published?: boolean;
}

export interface CreateLessonPayload {
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  content_url?: string | null;
  duration_seconds?: number;
  is_preview?: boolean;
  is_published?: boolean;
  display_order?: number;
}

export interface ReorderCurriculumPayload {
  modules: Array<{
    id: number;
    display_order: number;
    lessons?: Array<{
      id: number;
      display_order: number;
    }>;
  }>;
}

// Batch Types
export type BatchStatus = 'open' | 'full' | 'closed' | 'completed';

export interface BatchItem {
  id: number;
  course_id: number;
  batch_name: string;
  start_date: string;
  end_date?: string | null;
  class_days?: string | null;
  class_timing?: string | null;
  total_seats: number;
  enrolled_count: number;
  enrollment_deadline?: string | null;
  location?: string | null;
  status: BatchStatus;
  created_at: string;
  updated_at?: string;
}

export interface CreateBatchPayload {
  batch_name: string;
  start_date: string;
  end_date?: string | null;
  class_days?: string | null;
  class_timing?: string | null;
  total_seats: number;
  enrollment_deadline?: string | null;
  location?: string | null;
  status?: BatchStatus;
}

export type UpdateBatchPayload = Partial<CreateBatchPayload>;

// Course Enhancement Types
export interface CourseSeoData {
  seo_title?: string | null;
  seo_description?: string | null;
  meta_keywords?: string[] | null;
  canonical_url?: string | null;
  og_image_url?: string | null;
  focus_keyword?: string | null;
  seo_tags?: string[];
  slug?: string;
  robots_directive?: string;
  schema_type?: string;
}

export interface CoursePricingData {
  price: number;
  offer_price?: number | null;
  currency?: string;
  tax_inclusive?: boolean;
  gst_percentage?: number;
  is_free?: boolean;
  refund_policy?: string | null;
  refund_days?: number;
}

export interface CourseFaqItem {
  id?: number;
  question: string;
  answer: string;
  display_order?: number;
}

export interface CourseBenefitItem {
  title: string;
  description?: string;
  icon?: string;
}

export interface CourseBenefitsData {
  id?: number;
  course_id?: number;
  certificate_enabled: boolean;
  certificate_type?: string | null;
  career_support_enabled: boolean;
  mock_interviews: boolean;
  resume_support: boolean;
  placement_assistance: boolean;
  internship_support: boolean;
  project_count: number;
  lifetime_access: boolean;
  access_duration_days: number;
}

export interface CourseTestimonialItem {
  id?: number;
  course_id?: number;
  name: string;
  text: string;
  video_url?: string | null;
  photo_url?: string | null;
  is_active?: boolean;
}

export type CoursePointType = 'learn' | 'tool' | 'prerequisite' | 'required_skill';

export interface CoursePointItem {
  id?: number;
  course_id?: number;
  point_type: CoursePointType;
  text: string;
  display_order?: number;
}

export type MaterialType =
  | 'brochure'
  | 'syllabus'
  | 'notes'
  | 'worksheet'
  | 'project'
  | 'recording'
  | 'other';

export interface CourseMaterialItem {
  id: number;
  course_id: number;
  title: string;
  material_type: MaterialType;
  file_path: string;
  file_type?: string | null;
  file_size_bytes?: number;
  is_preview: boolean;
  requires_enrollment: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMaterialPayload {
  title: string;
  material_type: MaterialType;
  file_path: string;
  file_type?: string | null;
  file_size_bytes?: number;
  is_preview?: boolean;
  requires_enrollment?: boolean;
  display_order?: number;
}

export interface InstallmentPlanItem {
  id: number;
  course_id: number;
  plan_name: string;
  installment_count: number;
  installment_amount: number;
  interval_days: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInstallmentPayload {
  plan_name: string;
  installment_count: number;
  installment_amount: number;
  interval_days: number;
  is_active?: boolean;
}

export type DiscountType = 'percentage' | 'fixed';

export interface CourseOfferItem {
  id: number;
  course_id: number;
  offer_name: string;
  discount_type: DiscountType;
  discount_value: number;
  coupon_code?: string | null;
  starts_at: string;
  ends_at: string;
  usage_limit?: number | null;
  usage_count?: number;
  per_user_limit?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOfferPayload {
  offer_name: string;
  discount_type: DiscountType;
  discount_value: number;
  coupon_code?: string | null;
  starts_at: string;
  ends_at: string;
  usage_limit?: number | null;
  per_user_limit?: number;
  is_active?: boolean;
}

export interface AdminDemoSettings {
  id?: number;
  course_id: number;
  demo_enabled: boolean;
  demo_request_enabled: boolean;
  demo_type?: 'live' | 'recorded' | null;
  demo_duration_minutes?: number;
  demo_schedule?: string | null;
  time_slots?: string[];
  accepting_requests: boolean;
  request_start_at?: string | null;
  request_end_at?: string | null;
  max_requests_per_slot?: number;
  allowed_demo_types?: ('live' | 'recorded')[];
  meeting_platform?: string | null;
  requires_approval: boolean;
  form_title?: string | null;
  submit_button_text?: string | null;
  success_message?: string | null;
  form_fields?: Record<string, unknown>[];
  custom_questions?: Record<string, unknown>[];
  honeypot_enabled?: boolean;
  rate_limit_per_hour?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateDemoSettingsPayload {
  demo_enabled: boolean;
  demo_request_enabled: boolean;
  demo_type?: 'live' | 'recorded' | null;
  allowed_demo_types?: ('live' | 'recorded')[];
  demo_duration_minutes?: number;
  requires_approval?: boolean;
  accepting_requests?: boolean;
  meeting_platform?: string | null;
  max_requests_per_slot?: number;
  rate_limit_per_hour?: number;
  honeypot_enabled?: boolean;
  demo_schedule?: string | null;
  time_slots?: string[];
  request_start_at?: string | null;
  request_end_at?: string | null;
  form_title?: string | null;
  submit_button_text?: string | null;
  success_message?: string | null;
}


