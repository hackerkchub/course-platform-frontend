/**
 * Course Platform - Phase 4 Student Panel Data Contracts
 * Strongly typed interfaces mapping directly to verified backend responses.
 */

export type EnrollmentStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export interface EnrollmentCourse {
  id: number;
  course_name: string;
  slug: string;
  thumbnail_url?: string | null;
}

export interface EnrollmentBatch {
  id: number;
  name: string;
}

export interface StudentEnrollment {
  enrollment_id: number;
  course: EnrollmentCourse;
  batch?: EnrollmentBatch | null;
  enrollment_status: EnrollmentStatus;
  enrolled_at: string;
  access_expires_at?: string | null;
  completed_at?: string | null;
  progress_percentage: number;
  last_lesson_id?: number | null;
}

export interface StudentEnrollmentsResponse {
  items: StudentEnrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type LessonType = 'video' | 'article' | 'quiz' | 'assignment';

export interface LessonProgress {
  completed: boolean;
  last_position_seconds: number;
  updated_at?: string | null;
}

export interface CurriculumLesson {
  id: number;
  module_id: number;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  content_url?: string | null;
  duration_seconds: number;
  is_preview: boolean;
  display_order: number;
  progress?: LessonProgress;
}

export interface CurriculumModule {
  id: number;
  title: string;
  description?: string | null;
  display_order: number;
  lessons: CurriculumLesson[];
}

export interface StudentCurriculumResponse {
  course_id: number;
  enrollment: {
    id: number;
    status: EnrollmentStatus | string;
    access_expires_at?: string | null;
  };
  modules: CurriculumModule[];
}

export interface SaveProgressPayload {
  completed?: boolean;
  last_position_seconds?: number;
}

export interface SaveProgressResponse {
  lesson_id: number;
  completed: boolean;
  last_position_seconds: number;
  course_completed: boolean;
}

export interface WishlistCourse {
  id: number;
  course_name: string;
  slug: string;
  url?: string;
  thumbnail_url?: string | null;
  price: number;
  offer_price?: number | null;
  is_free: boolean;
  course_level?: string;
  mode?: string;
  duration_hours?: number;
  rating_avg?: number;
  rating_count?: number;
  wishlisted: boolean;
  wishlisted_at: string;
  instructor?: {
    id: number;
    name: string;
    photo_url?: string | null;
  } | null;
}

export interface WishlistResponse {
  courses: WishlistCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DemoStatus = 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
export type DemoType = 'live' | 'recorded';

export interface DemoRequest {
  id: number;
  course_id: number;
  course_name?: string;
  reference_no?: string;
  preferred_demo_type: DemoType;
  preferred_date?: string | null;
  preferred_time?: string | null;
  scheduled_at?: string | null;
  meeting_link?: string | null;
  status: DemoStatus;
  created_at: string;
}

export interface DemoSettings {
  demo_enabled: boolean;
  demo_request_enabled: boolean;
  demo_type?: DemoType | null;
  demo_duration_minutes?: number;
  demo_schedule?: string | null;
  time_slots?: string[] | null;
  accepting_requests: boolean;
  allowed_demo_types?: DemoType[] | null;
  meeting_platform?: string | null;
  form_title?: string | null;
  submit_button_text?: string | null;
  success_message?: string | null;
}

export interface BookDemoPayload {
  student_name: string;
  email: string;
  phone: string;
  city?: string | null;
  current_qualification?: string | null;
  experience_level?: string | null;
  preferred_demo_type: DemoType;
  preferred_date?: string | null;
  preferred_time?: string | null;
  message?: string | null;
  consent: true;
}

export interface EligibilityQuestion {
  key: string;
  question: string;
  field_type: 'text' | 'select' | 'radio' | 'number';
  options?: string[];
  required?: boolean;
}

export interface EligibilityConfiguration {
  course_id: number;
  eligibility_enabled: boolean;
  minimum_qualification?: string | null;
  minimum_percentage?: number | null;
  eligible_streams?: string[] | null;
  minimum_age?: number | null;
  maximum_age?: number | null;
  required_skills?: string[] | null;
  experience_required?: 'fresher_allowed' | 'experience_required' | null;
  custom_questions?: EligibilityQuestion[] | null;
  disclaimer?: string | null;
}

export interface EligibilityResult {
  has_checked: boolean;
  id?: number | null;
  result: 'eligible' | 'not_eligible' | null;
  eligible: boolean | null;
  message?: string | null;
  failed_rules?: string[] | null;
  checked_at?: string | null;
}

export interface SubmitEligibilityResponse {
  id: number;
  result: 'eligible' | 'not_eligible';
  eligible: boolean;
  message?: string | null;
  failed_rules: string[];
  checked_at: string;
}

export interface CourseReview {
  id: number;
  rating: number;
  title?: string | null;
  text?: string | null;
  user_name?: string;
  user_avatar?: string | null;
  created_at: string;
  is_verified_enrollment?: boolean;
  moderation_status?: 'pending' | 'approved' | 'rejected';
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  summary: {
    average_rating: number;
    total_reviews: number;
    distribution?: Record<number, number>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubmitReviewPayload {
  rating: number;
  title?: string;
  text?: string;
}

export interface CourseMaterial {
  id: number;
  title: string;
  description?: string | null;
  file_type?: string | null;
  file_size_bytes?: number | null;
  requires_enrollment: boolean;
  is_preview: boolean;
  download_url: string;
}

export interface SelfEnrollPayload {
  batch_id?: number | null;
}

export interface SelfEnrollResponse {
  enrollment_id: number;
  course_id: number;
  batch_id: number | null;
  enrollment_status: EnrollmentStatus;
  enrolled_at: string;
  access_expires_at: string | null;
}
