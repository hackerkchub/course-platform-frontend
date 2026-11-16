/**
 * Course Platform - Phase 5 Instructor Management API Client Service
 * Centralized service mapping to verified backend instructor and upload routes.
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  Instructor,
  CreateInstructorPayload,
  UpdateInstructorPayload,
  InstructorListParams,
  InstructorListResponse,
} from '@/types/instructor';

/**
 * 2 MB max upload limit strictly matching backend uploadService validation
 */
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Public: Retrieve all active instructors
 */
export async function fetchPublicInstructors(): Promise<Instructor[]> {
  const res = await apiClient.get(API_ENDPOINTS.instructors.list);
  const data = res?.data;
  if (Array.isArray(data?.data)) {
    return data.data as Instructor[];
  }
  if (Array.isArray(data)) {
    return data as Instructor[];
  }
  return [];
}

/**
 * Public: Retrieve instructor details by numeric ID
 */
export async function fetchPublicInstructorById(id: number): Promise<Instructor> {
  const res = await apiClient.get(API_ENDPOINTS.instructors.byId(id));
  const data = res?.data;
  return (data?.data || data) as Instructor;
}

/**
 * Admin: List instructors with search, status filtering, and pagination
 */
export async function fetchAdminInstructors(
  params: InstructorListParams = {}
): Promise<InstructorListResponse> {
  const queryParams: Record<string, string | number> = {
    page: params.page || 1,
    limit: params.limit || 20,
  };

  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  if (params.status && params.status !== 'all') {
    queryParams.status = params.status;
  }

  const res = await apiClient.get(API_ENDPOINTS.instructors.adminList, {
    params: queryParams,
  });

  const payload = res?.data;
  const rawItems = payload?.data?.items || payload?.data || payload?.items || [];
  const items: Instructor[] = Array.isArray(rawItems) ? rawItems : [];

  const rawPagination = payload?.pagination || payload?.data?.pagination || {};
  const total = Number(payload?.total ?? rawPagination?.total ?? items.length);
  const page = Number(params.page || rawPagination?.page || 1);
  const limit = Number(params.limit || rawPagination?.limit || 20);
  const totalPages = Number(rawPagination?.totalPages || Math.ceil(total / limit) || 1);

  // Compute active/inactive breakdown from current set or metadata
  const activeCount = items.filter((ins) => ins.status === 'active').length;
  const inactiveCount = items.filter((ins) => ins.status === 'inactive').length;

  return {
    items,
    instructors: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    stats: {
      total,
      active: activeCount,
      inactive: inactiveCount,
    },
  };
}

/**
 * Admin: Retrieve instructor details for editing
 */
export async function fetchAdminInstructorById(id: number): Promise<Instructor> {
  const res = await apiClient.get(API_ENDPOINTS.instructors.adminById(id));
  const data = res?.data;
  return (data?.data || data) as Instructor;
}

/**
 * Admin: Create a new instructor record
 */
export async function createAdminInstructor(
  payload: CreateInstructorPayload
): Promise<Instructor> {
  const res = await apiClient.post(API_ENDPOINTS.instructors.adminCreate, payload);
  const data = res?.data;
  return (data?.data || data) as Instructor;
}

/**
 * Admin: Update an existing instructor record
 */
export async function updateAdminInstructor(
  id: number,
  payload: UpdateInstructorPayload
): Promise<Instructor> {
  const res = await apiClient.patch(API_ENDPOINTS.instructors.adminUpdate(id), payload);
  const data = res?.data;
  return (data?.data || data) as Instructor;
}

/**
 * Admin: Soft deactivation of an instructor (sets status = 'inactive')
 */
export async function deactivateAdminInstructor(id: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.instructors.adminDelete(id));
}

/**
 * Admin: Reactivate an instructor (sets status = 'active')
 */
export async function activateAdminInstructor(id: number): Promise<Instructor> {
  const res = await apiClient.patch(API_ENDPOINTS.instructors.adminUpdate(id), {
    status: 'active',
  });
  const data = res?.data;
  return (data?.data || data) as Instructor;
}

/**
 * Admin: Upload instructor profile photo with client-side verification
 * Enforces magic-byte compatibility: .jpg, .jpeg, .png, .webp under 2 MB
 */
export async function uploadInstructorPhoto(file: File): Promise<string> {
  if (!file) {
    throw new Error('Please select an image file to upload.');
  }

  // 1. File size verification (2 MB max)
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error('Profile photo must be smaller than 2 MB.');
  }

  // 2. MIME type / extension verification
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!hasValidExt && !hasValidMime) {
    throw new Error('Unsupported image format. Allowed formats: JPG, PNG, WEBP.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'image');

  const res = await apiClient.post(API_ENDPOINTS.instructors.adminUpload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const payload = res?.data;
  const returnedPath =
    (typeof payload?.data?.path === 'string' && payload.data.path.trim()) ||
    (typeof payload?.data?.url === 'string' && payload.data.url.trim()) ||
    (typeof payload?.path === 'string' && payload.path.trim()) ||
    (typeof payload?.url === 'string' && payload.url.trim()) ||
    '';

  if (!returnedPath) {
    throw new Error('Server returned an invalid photo URL response.');
  }

  return returnedPath;
}

/**
 * Admin: Provision login identity and link to instructor profile
 */
export async function provisionAdminInstructor(
  payload: { instructor_id?: number; email?: string; name?: string; password?: string; phone?: string; designation?: string | null }
): Promise<Instructor> {
  const res = await apiClient.post(API_ENDPOINTS.instructors.adminProvision, payload);
  return (res?.data?.data || res?.data) as Instructor;
}

/**
 * Admin: Update instructor profile and synchronized user status
 */
export async function updateInstructorAccountStatus(
  id: number,
  status: 'active' | 'inactive'
): Promise<Instructor> {
  const res = await apiClient.patch(API_ENDPOINTS.instructors.adminStatus(id), { status });
  return (res?.data?.data || res?.data) as Instructor;
}

/**
 * Admin: Fetch assigned instructors for a course
 */
export async function fetchCourseInstructors(courseId: number): Promise<any[]> {
  const res = await apiClient.get(API_ENDPOINTS.instructors.adminCourseInstructors(courseId));
  return (res?.data?.data || res?.data || []) as any[];
}

/**
 * Admin: Assign instructor to course (primary or secondary)
 */
export async function assignInstructorToCourse(
  courseId: number,
  payload: { instructor_id: number; is_primary?: boolean | number; can_manage_curriculum?: boolean | number }
): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructors.adminAssignCourse(courseId), payload);
  return res?.data?.data || res?.data;
}

/**
 * Admin: Reassign primary instructor for course
 */
export async function reassignPrimaryInstructor(
  courseId: number,
  instructorId: number
): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructors.adminReassignPrimary(courseId), {
    instructor_id: instructorId,
  });
  return res?.data?.data || res?.data;
}

/**
 * Admin: Remove instructor assignment from course
 */
export async function removeInstructorFromCourse(
  courseId: number,
  instructorId: number
): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.instructors.adminRemoveCourseInstructor(courseId, instructorId));
  return res?.data;
}

/**
 * Admin: Assign instructor to batch
 */
export async function assignInstructorToBatch(
  batchId: number,
  instructorId: number
): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructors.adminAssignBatch(batchId), {
    instructor_id: instructorId,
  });
  return res?.data?.data || res?.data;
}

/**
 * Unified instructorApi object preserving backwards compatibility for object-style callers
 */
export const instructorApi = {
  getPublicInstructors: fetchPublicInstructors,
  getPublicInstructorById: fetchPublicInstructorById,
  getAdminInstructors: fetchAdminInstructors,
  getAdminInstructorById: fetchAdminInstructorById,
  createAdminInstructor: createAdminInstructor,
  updateAdminInstructor: updateAdminInstructor,
  deactivateAdminInstructor: deactivateAdminInstructor,
  activateAdminInstructor: activateAdminInstructor,
  uploadPhoto: uploadInstructorPhoto,
  provisionInstructor: provisionAdminInstructor,
  updateStatus: updateInstructorAccountStatus,
  getCourseInstructors: fetchCourseInstructors,
  assignCourseInstructor: assignInstructorToCourse,
  reassignPrimaryInstructor,
  removeCourseInstructor: removeInstructorFromCourse,
  assignBatchInstructor: assignInstructorToBatch,
};

export default instructorApi;
