/**
 * Course Platform - Phase 5 Instructor Management Data Contracts
 * Strongly-typed interfaces mapping directly to verified backend responses.
 */

export type InstructorStatus = 'active' | 'inactive';

export interface InstructorSocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface Instructor {
  id: number;
  name: string;
  designation?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  photo_url?: string | null;
  social_links?: InstructorSocialLinks | null;
  status: InstructorStatus;
  created_at?: string;
  updated_at?: string;
  course_count?: number;
}

export interface CreateInstructorPayload {
  name: string;
  designation?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  photo_url?: string | null;
  social_links?: InstructorSocialLinks | null;
  status?: InstructorStatus;
}

export interface UpdateInstructorPayload {
  name?: string;
  designation?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  photo_url?: string | null;
  social_links?: InstructorSocialLinks | null;
  status?: InstructorStatus;
}

export interface InstructorListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}

export interface InstructorPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InstructorListResponse {
  items: Instructor[];
  instructors?: Instructor[];
  pagination: InstructorPagination;
  stats?: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface InstructorUploadResponse {
  url: string;
}
