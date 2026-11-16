import type { CourseWhatsAppInfo } from './whatsapp';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type CourseMode = 'online' | 'offline' | 'hybrid' | 'self_paced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  display_order: number;
  status: 'active' | 'inactive';
  course_count?: number;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  status: 'active' | 'inactive';
  category_name?: string;
  course_count?: number;
  total_courses?: number;
}

export interface InstructorProfile {
  id: number;
  name: string;
  designation?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  photo_url?: string | null;
  headline?: string | null;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  } | null;
  status?: 'active' | 'inactive';
  course_count?: number;
}

export interface CourseCard {
  id: number;
  course_code?: string;
  course_name: string;
  slug: string;
  url?: string;
  short_description: string;
  category?: {
    name: string;
    slug: string;
  };
  subcategory?: {
    name: string;
    slug: string;
  };
  category_name?: string;
  category_slug?: string;
  subcategory_name?: string;
  subcategory_slug?: string;
  instructor?: {
    id: number;
    name: string;
    photo_url?: string | null;
  } | null;
  course_level: CourseLevel;
  language?: string;
  mode?: CourseMode;
  duration_hours: number;
  total_lessons: number;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  price: number;
  offer_price?: number | null;
  currency: string;
  is_free?: boolean;
  has_offer?: boolean;
  discount_percentage?: number;
  rating_avg: number;
  rating_count: number;
  is_featured?: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  demo_enabled?: boolean;
  next_batch_start?: string | null;
  total_seats_available?: number | null;
  is_wishlisted?: boolean;
  is_enrolled?: boolean;
}

export interface Batch {
  batch_id: number;
  batch_name: string;
  start_date: string;
  class_days?: string;
  class_timing?: string;
  seats_available: number;
}

export interface Lesson {
  lesson_id: number;
  title: string;
  lesson_type: 'video' | 'article' | 'quiz' | 'assignment';
  duration_seconds: number;
  is_preview: boolean;
  content_url?: string | null;
  is_completed?: boolean;
}

export interface CurriculumModule {
  module_id: number;
  title: string;
  display_order: number;
  lessons: Lesson[];
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  text: string;
  video_url?: string | null;
  photo_url?: string | null;
}

/**
 * Exact verified course detail payload returned by GET /api/courses/:slug
 */
export interface CourseDetailPayload {
  basic: {
    id: number;
    course_code: string;
    course_name: string;
    slug: string;
    short_description: string;
    description: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
    subcategory: {
      id: number;
      name: string;
      slug: string;
    };
    tags: string[];
    course_level: CourseLevel;
    language: string;
    mode: CourseMode;
    duration_hours: number;
    duration_days?: number | null;
    total_modules: number;
    total_lessons: number;
    status: CourseStatus;
    badges: {
      is_featured: boolean;
      is_new: boolean;
      is_trending: boolean;
    };
  };
  url: string;
  breadcrumbs: Array<{ label: string; url: string }>;
  media: {
    thumbnail_url?: string | null;
    banner_url?: string | null;
    gallery_images?: string[];
    intro_video_url?: string | null;
    demo_video_url?: string | null;
    alt_text?: string | null;
  };
  instructor: InstructorProfile | null;
  pricing: {
    price: number;
    offer_price?: number | null;
    discount_percentage: number;
    currency: string;
    tax_inclusive: boolean;
    gst_percentage: number;
    is_free: boolean;
    offer?: {
      offer_name: string;
      discount_type: string;
      discount_value: number;
      coupon_code: string;
      starts_at: string;
      ends_at: string;
      is_active: boolean;
    } | null;
    installment?: {
      enabled: boolean;
      plans: Array<{
        plan_name: string;
        installment_count: number;
        installment_amount: number;
        interval_days: number;
      }>;
    };
    refund_policy?: string | null;
    refund_days: number;
  };
  demo: {
    demo_enabled: boolean;
    demo_request_enabled: boolean;
    demo_type: string;
    demo_duration_minutes: number;
    booking: {
      accepting_requests: boolean;
      meeting_platform: string;
      requires_approval: boolean;
    };
    stats: {
      demo_request_count: number;
    };
  };
  eligibility: {
    eligibility_enabled: boolean;
    minimum_qualification?: string | null;
    minimum_percentage?: number | null;
    experience_required: boolean;
    disclaimer?: string | null;
  };
  files: {
    brochure_url?: string | null;
    syllabus_url?: string | null;
  };
  curriculum: CurriculumModule[];
  learning: {
    what_you_will_learn: string[];
    tools_covered: string[];
    prerequisites: string[];
  };
  enrollment: {
    enrollment_limit?: number | null;
    access_duration_days?: number | null;
    lifetime_access: boolean;
  };
  batches: Batch[];
  benefits: {
    certificate_enabled: boolean;
    certificate_type?: string | null;
    career_support_enabled: boolean;
    mock_interviews: boolean;
    resume_support: boolean;
    placement_assistance: boolean;
    internship_support: boolean;
    project_count: number;
  };
  social_proof: {
    reviews_summary: {
      average_rating: number;
      review_count: number;
    };
    faqs: FAQItem[];
    testimonials: TestimonialItem[];
  };
  stats: {
    total_views: number;
    unique_visitors: number;
    enquiry_count: number;
    demo_request_count: number;
    wishlist_count: number;
    share_count: number;
    enrollment_count: number;
  };
  seo: {
    seo_title?: string | null;
    seo_description?: string | null;
    focus_keyword?: string | null;
    canonical_url?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image_url?: string | null;
    robots_directive?: string | null;
    schema_type?: string | null;
  };
  whatsapp?: CourseWhatsAppInfo;
  user_state: {
    is_wishlisted: boolean;
    is_enrolled: boolean;
    has_demo_request: boolean;
  };
}
