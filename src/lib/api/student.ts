import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  StudentEnrollment,
  StudentEnrollmentsResponse,
  StudentCurriculumResponse,
  SaveProgressPayload,
  SaveProgressResponse,
  WishlistCourse,
  WishlistResponse,
  DemoRequest,
  DemoSettings,
  BookDemoPayload,
  EligibilityConfiguration,
  EligibilityResult,
  SubmitEligibilityResponse,
  CourseReview,
  CourseReviewsResponse,
  SubmitReviewPayload,
  CourseMaterial,
  SelfEnrollResponse,
} from '@/types/student';

/**
 * Normalizes backend paginated response or envelope
 */
function extractData<T>(response: { data?: { data?: T; success?: boolean; items?: T } }): T {
  const data = response?.data;
  if (data && typeof data === 'object' && 'data' in data && data.data !== undefined) {
    return data.data as T;
  }
  return data as unknown as T;
}

// ============================================================================
// 1. ENROLLMENTS & LEARNING PROGRESS
// ============================================================================

export async function fetchStudentEnrollments(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<StudentEnrollmentsResponse> {
  const res = await apiClient.get(API_ENDPOINTS.enrollments.myList, {
    params: {
      page: params.page || 1,
      limit: params.limit || 12,
      status: params.status && params.status !== 'all' ? params.status : undefined,
    },
  });

  const payload = res.data;
  const items: StudentEnrollment[] = payload?.data?.items || payload?.data || payload?.items || [];
  const pagination = payload?.pagination || payload?.data?.pagination || {};

  const total = Number(payload?.data?.total ?? pagination?.total ?? items.length);
  const page = Number(params.page || pagination?.page || 1);
  const limit = Number(params.limit || pagination?.limit || 12);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: Array.isArray(items) ? items : [],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function selfEnrollFreeCourse(
  courseId: number,
  batchId?: number | null
): Promise<SelfEnrollResponse> {
  const res = await apiClient.post(API_ENDPOINTS.enrollments.enrollFree(courseId), {
    batch_id: batchId || null,
  });
  return extractData<SelfEnrollResponse>(res);
}

export async function fetchStudentCurriculum(
  courseId: number
): Promise<StudentCurriculumResponse> {
  const res = await apiClient.get(API_ENDPOINTS.enrollments.myCurriculum(courseId));
  return extractData<StudentCurriculumResponse>(res);
}

export async function saveLessonProgress(
  lessonId: number,
  payload: SaveProgressPayload
): Promise<SaveProgressResponse> {
  const res = await apiClient.post(API_ENDPOINTS.enrollments.myProgress(lessonId), {
    completed: payload.completed !== undefined ? Boolean(payload.completed) : true,
    last_position_seconds: Math.max(0, Math.floor(payload.last_position_seconds || 0)),
  });
  return extractData<SaveProgressResponse>(res);
}

// ============================================================================
// 2. WISHLIST
// ============================================================================

export async function fetchStudentWishlist(params: {
  page?: number;
  limit?: number;
} = {}): Promise<WishlistResponse> {
  const res = await apiClient.get(API_ENDPOINTS.wishlist.myList, {
    params: {
      page: params.page || 1,
      limit: params.limit || 12,
    },
  });

  const payload = res.data;
  const courses: WishlistCourse[] =
    payload?.data?.courses || payload?.data?.items || payload?.data || [];
  const total = Number(payload?.data?.total ?? payload?.total ?? courses.length);
  const page = Number(params.page || payload?.data?.page || 1);
  const limit = Number(params.limit || payload?.data?.limit || 12);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    courses: Array.isArray(courses) ? courses : [],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function addCourseToWishlist(
  courseId: number
): Promise<{ course_id: number; wishlisted: boolean; already_wishlisted?: boolean }> {
  const res = await apiClient.post(API_ENDPOINTS.wishlist.add(courseId));
  return extractData(res);
}

export async function removeCourseFromWishlist(
  courseId: number
): Promise<{ course_id: number; wishlisted: boolean; removed?: boolean }> {
  const res = await apiClient.delete(API_ENDPOINTS.wishlist.remove(courseId));
  return extractData(res);
}

// ============================================================================
// 3. DEMO CLASSES
// ============================================================================

export async function fetchStudentDemoRequests(): Promise<DemoRequest[]> {
  const res = await apiClient.get(API_ENDPOINTS.demo.myRequests);
  const data = extractData<DemoRequest[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function cancelStudentDemoRequest(
  demoRequestId: number
): Promise<{ success: boolean; message?: string }> {
  const res = await apiClient.patch(API_ENDPOINTS.demo.myCancel(demoRequestId));
  return res.data;
}

export async function fetchCourseDemoSettings(
  courseId: number
): Promise<DemoSettings> {
  const res = await apiClient.get(API_ENDPOINTS.demo.settings(courseId));
  return extractData<DemoSettings>(res);
}

export async function bookCourseDemoRequest(
  courseId: number,
  payload: BookDemoPayload
): Promise<{ request_id: number; reference_no?: string }> {
  const res = await apiClient.post(API_ENDPOINTS.demo.request(courseId), payload);
  return extractData(res);
}

// ============================================================================
// 4. ELIGIBILITY
// ============================================================================

export async function fetchCourseEligibility(
  courseId: number
): Promise<EligibilityConfiguration> {
  const res = await apiClient.get(API_ENDPOINTS.eligibility.byCourseId(courseId));
  return extractData<EligibilityConfiguration>(res);
}

export async function submitStudentEligibilityCheck(
  courseId: number,
  answers: Record<string, unknown>
): Promise<SubmitEligibilityResponse> {
  const res = await apiClient.post(API_ENDPOINTS.eligibility.check(courseId), {
    answers,
  });
  return extractData<SubmitEligibilityResponse>(res);
}

export async function fetchStudentEligibilityResult(
  courseId: number
): Promise<EligibilityResult> {
  const res = await apiClient.get(API_ENDPOINTS.eligibility.myResult(courseId));
  return extractData<EligibilityResult>(res);
}

// ============================================================================
// 5. REVIEWS
// ============================================================================

export async function fetchCourseReviews(
  courseId: number,
  params: { page?: number; limit?: number; rating?: number } = {}
): Promise<CourseReviewsResponse> {
  const res = await apiClient.get(API_ENDPOINTS.reviews.byCourseId(courseId), {
    params,
  });
  const payload = res.data;
  const reviews: CourseReview[] = payload?.data?.reviews || payload?.data || [];
  const summary = payload?.data?.summary || { average_rating: 0, total_reviews: 0 };
  const pagination = payload?.data?.pagination || payload?.pagination;

  return {
    reviews: Array.isArray(reviews) ? reviews : [],
    summary,
    pagination,
  };
}

export async function submitCourseReview(
  courseId: number,
  payload: SubmitReviewPayload
): Promise<{ id: number; course_id: number; rating: number; moderation_status: string }> {
  const res = await apiClient.post(API_ENDPOINTS.reviews.create(courseId), payload);
  return extractData(res);
}

export async function updateStudentReview(
  reviewId: number,
  payload: Partial<SubmitReviewPayload>
): Promise<{ id: number; moderation_status: string }> {
  const res = await apiClient.patch(API_ENDPOINTS.reviews.myUpdate(reviewId), payload);
  return extractData(res);
}

export async function deleteStudentReview(
  reviewId: number
): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.delete(API_ENDPOINTS.reviews.myDelete(reviewId));
  return res.data;
}

// ============================================================================
// 6. COURSE MATERIALS & DOWNLOADS
// ============================================================================

export async function fetchCourseMaterials(
  courseId: number
): Promise<CourseMaterial[]> {
  const res = await apiClient.get(API_ENDPOINTS.materials.byCourseId(courseId));
  const data = extractData<CourseMaterial[]>(res);
  return Array.isArray(data) ? data : [];
}
