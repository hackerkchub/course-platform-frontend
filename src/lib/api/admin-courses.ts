import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  AdminCourseItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  CourseStatus,
  ModuleItem,
  CreateModulePayload,
  CreateLessonPayload,
  LessonItem,
  ReorderCurriculumPayload,
  BatchItem,
  CreateBatchPayload,
  UpdateBatchPayload,
  CourseSeoData,
  CoursePricingData,
  CourseFaqItem,
  CourseBenefitsData,
  CourseTestimonialItem,
  CoursePointItem,
  CourseMaterialItem,
  CreateMaterialPayload,
  InstallmentPlanItem,
  CreateInstallmentPayload,
  CourseOfferItem,
  CreateOfferPayload,
} from '@/types/admin-course';
import type { ApiResponse } from '@/types/api';

export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  subcategory_id?: number;
  status?: string;
  course_level?: string;
  mode?: string;
}

export interface CoursesListResult {
  courses: AdminCourseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminCoursesApi = {
  // Course Lifecycle
  async getCourses(params: CourseListParams = {}): Promise<CoursesListResult> {
    const res = await apiClient.get<ApiResponse<AdminCourseItem[]> & {
      pagination?: { page: number; limit: number; total: number; totalPages?: number };
    }>(API_ENDPOINTS.courses.adminList, { params });

    const data = res.data;
    const courses = Array.isArray(data.data) ? data.data : [];
    const total = data.pagination?.total ?? courses.length;
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 10);
    const totalPages = data.pagination?.totalPages || Math.max(1, Math.ceil(total / limit));

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getCourseById(id: number): Promise<AdminCourseItem> {
    const res = await apiClient.get<ApiResponse<AdminCourseItem>>(
      API_ENDPOINTS.courses.adminById(id)
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to load course details');
    }
    return res.data.data;
  },

  async createCourse(payload: CreateCoursePayload): Promise<AdminCourseItem> {
    const res = await apiClient.post<ApiResponse<AdminCourseItem>>(
      API_ENDPOINTS.courses.adminCreate,
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create course');
    }
    return res.data.data;
  },

  async updateCourse(id: number, payload: UpdateCoursePayload): Promise<AdminCourseItem> {
    const res = await apiClient.patch<ApiResponse<AdminCourseItem>>(
      API_ENDPOINTS.courses.adminUpdate(id),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update course');
    }
    return res.data.data;
  },

  async updateStatus(id: number, status: CourseStatus): Promise<AdminCourseItem> {
    const res = await apiClient.patch<ApiResponse<AdminCourseItem>>(
      API_ENDPOINTS.courses.adminStatus(id),
      { status }
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update course status');
    }
    return res.data.data;
  },

  async duplicateCourse(id: number): Promise<AdminCourseItem> {
    const res = await apiClient.post<ApiResponse<AdminCourseItem>>(
      API_ENDPOINTS.courses.adminDuplicate(id)
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to duplicate course');
    }
    return res.data.data;
  },

  async deleteCourse(id: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.courses.adminDelete(id)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete course');
    }
  },

  // Curriculum Builder
  async getCurriculum(courseId: number): Promise<ModuleItem[]> {
    const res = await apiClient.get<ApiResponse<ModuleItem[]>>(
      API_ENDPOINTS.curriculum.adminByCourseId(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async createModule(courseId: number, payload: CreateModulePayload): Promise<ModuleItem> {
    const res = await apiClient.post<ApiResponse<ModuleItem>>(
      API_ENDPOINTS.curriculum.adminCreateModule(courseId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create module');
    }
    return res.data.data;
  },

  async updateModule(moduleId: number, payload: Partial<CreateModulePayload>): Promise<ModuleItem> {
    const res = await apiClient.patch<ApiResponse<ModuleItem>>(
      API_ENDPOINTS.curriculum.adminUpdateModule(moduleId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update module');
    }
    return res.data.data;
  },

  async deleteModule(moduleId: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.curriculum.adminDeleteModule(moduleId)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete module');
    }
  },

  async createLesson(moduleId: number, payload: CreateLessonPayload): Promise<LessonItem> {
    const res = await apiClient.post<ApiResponse<LessonItem>>(
      API_ENDPOINTS.curriculum.adminCreateLesson(moduleId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create lesson');
    }
    return res.data.data;
  },

  async updateLesson(lessonId: number, payload: Partial<CreateLessonPayload>): Promise<LessonItem> {
    const res = await apiClient.patch<ApiResponse<LessonItem>>(
      API_ENDPOINTS.curriculum.adminUpdateLesson(lessonId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update lesson');
    }
    return res.data.data;
  },

  async deleteLesson(lessonId: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.curriculum.adminDeleteLesson(lessonId)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete lesson');
    }
  },

  async reorderCurriculum(courseId: number, payload: ReorderCurriculumPayload): Promise<void> {
    const res = await apiClient.patch<ApiResponse<null>>(
      API_ENDPOINTS.curriculum.adminReorder(courseId),
      payload
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to reorder curriculum');
    }
  },

  // Batch Management
  async getBatches(courseId: number): Promise<BatchItem[]> {
    const res = await apiClient.get<ApiResponse<BatchItem[]>>(
      API_ENDPOINTS.batches.adminByCourseId(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async createBatch(courseId: number, payload: CreateBatchPayload): Promise<BatchItem> {
    const res = await apiClient.post<ApiResponse<BatchItem>>(
      API_ENDPOINTS.batches.adminCreate(courseId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create batch');
    }
    return res.data.data;
  },

  async updateBatch(batchId: number, payload: UpdateBatchPayload): Promise<BatchItem> {
    const res = await apiClient.patch<ApiResponse<BatchItem>>(
      API_ENDPOINTS.batches.adminUpdate(batchId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update batch');
    }
    return res.data.data;
  },

  async deleteBatch(batchId: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.batches.adminDelete(batchId)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete batch');
    }
  },

  // Course Enhancements
  async getSeo(courseId: number): Promise<CourseSeoData> {
    const res = await apiClient.get<ApiResponse<CourseSeoData>>(
      API_ENDPOINTS.enhancements.seo(courseId)
    );
    return res.data?.data || {};
  },

  async updateSeo(courseId: number, payload: CourseSeoData): Promise<CourseSeoData> {
    const res = await apiClient.put<ApiResponse<CourseSeoData>>(
      API_ENDPOINTS.enhancements.seo(courseId),
      payload
    );
    return res.data.data;
  },

  async getPricing(courseId: number): Promise<CoursePricingData> {
    const res = await apiClient.get<ApiResponse<CoursePricingData>>(
      API_ENDPOINTS.enhancements.pricing(courseId)
    );
    return res.data?.data || { price: 0 };
  },

  async updatePricing(courseId: number, payload: CoursePricingData): Promise<CoursePricingData> {
    const res = await apiClient.put<ApiResponse<CoursePricingData>>(
      API_ENDPOINTS.enhancements.pricing(courseId),
      payload
    );
    return res.data.data;
  },

  async getFaqs(courseId: number): Promise<CourseFaqItem[]> {
    const res = await apiClient.get<ApiResponse<CourseFaqItem[]>>(
      API_ENDPOINTS.enhancements.faqs(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async updateFaqs(courseId: number, faqs: CourseFaqItem[]): Promise<CourseFaqItem[]> {
    const res = await apiClient.put<ApiResponse<CourseFaqItem[]>>(
      API_ENDPOINTS.enhancements.faqs(courseId),
      { faqs }
    );
    return res.data.data;
  },

  async getBenefits(courseId: number): Promise<CourseBenefitsData> {
    const res = await apiClient.get<ApiResponse<CourseBenefitsData>>(
      API_ENDPOINTS.enhancements.benefits(courseId)
    );
    return res.data?.data || {
      certificate_enabled: false,
      career_support_enabled: false,
      mock_interviews: false,
      resume_support: false,
      placement_assistance: false,
      internship_support: false,
      project_count: 0,
      lifetime_access: false,
      access_duration_days: 0,
    };
  },

  async updateBenefits(courseId: number, payload: Partial<CourseBenefitsData>): Promise<CourseBenefitsData> {
    const res = await apiClient.put<ApiResponse<CourseBenefitsData>>(
      API_ENDPOINTS.enhancements.benefits(courseId),
      payload
    );
    return res.data.data;
  },

  // Testimonials
  async getTestimonials(courseId: number): Promise<CourseTestimonialItem[]> {
    const res = await apiClient.get<ApiResponse<CourseTestimonialItem[]>>(
      API_ENDPOINTS.enhancements.testimonials(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async updateTestimonials(courseId: number, testimonials: CourseTestimonialItem[]): Promise<CourseTestimonialItem[]> {
    const res = await apiClient.put<ApiResponse<CourseTestimonialItem[]>>(
      API_ENDPOINTS.enhancements.testimonials(courseId),
      { testimonials }
    );
    return res.data.data;
  },

  // Points (Learn, Tool, Prerequisite, Required Skill)
  async getPoints(courseId: number): Promise<CoursePointItem[]> {
    const res = await apiClient.get<ApiResponse<CoursePointItem[]>>(
      API_ENDPOINTS.enhancements.points(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async updatePoints(courseId: number, points: CoursePointItem[]): Promise<CoursePointItem[]> {
    const res = await apiClient.put<ApiResponse<CoursePointItem[]>>(
      API_ENDPOINTS.enhancements.points(courseId),
      { points }
    );
    return res.data.data;
  },

  // Course Materials
  async getMaterials(courseId: number): Promise<CourseMaterialItem[]> {
    const res = await apiClient.get<ApiResponse<CourseMaterialItem[]>>(
      API_ENDPOINTS.materials.adminByCourseId(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async addMaterial(courseId: number, payload: CreateMaterialPayload): Promise<CourseMaterialItem> {
    const res = await apiClient.post<ApiResponse<CourseMaterialItem>>(
      API_ENDPOINTS.materials.adminCreate(courseId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to add material');
    }
    return res.data.data;
  },

  async updateMaterial(materialId: number, payload: Partial<CreateMaterialPayload>): Promise<CourseMaterialItem> {
    const res = await apiClient.patch<ApiResponse<CourseMaterialItem>>(
      API_ENDPOINTS.materials.adminUpdate(materialId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update material');
    }
    return res.data.data;
  },

  async deleteMaterial(materialId: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.materials.adminDelete(materialId)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete material');
    }
  },

  // Installment Plans
  async getInstallments(courseId: number): Promise<InstallmentPlanItem[]> {
    const res = await apiClient.get<ApiResponse<InstallmentPlanItem[]>>(
      API_ENDPOINTS.enhancements.installments(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async createInstallment(courseId: number, payload: CreateInstallmentPayload): Promise<InstallmentPlanItem> {
    const res = await apiClient.post<ApiResponse<InstallmentPlanItem>>(
      API_ENDPOINTS.enhancements.installments(courseId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create installment plan');
    }
    return res.data.data;
  },

  async updateInstallment(courseId: number, planId: number, payload: Partial<CreateInstallmentPayload>): Promise<InstallmentPlanItem> {
    const res = await apiClient.patch<ApiResponse<InstallmentPlanItem>>(
      API_ENDPOINTS.enhancements.installmentById(courseId, planId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update installment plan');
    }
    return res.data.data;
  },

  async deleteInstallment(courseId: number, planId: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.enhancements.installmentById(courseId, planId)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete installment plan');
    }
  },

  // Promotional Offers
  async getOffers(courseId: number): Promise<CourseOfferItem[]> {
    const res = await apiClient.get<ApiResponse<CourseOfferItem[]>>(
      API_ENDPOINTS.enhancements.offers(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  async createOffer(courseId: number, payload: CreateOfferPayload): Promise<CourseOfferItem> {
    const res = await apiClient.post<ApiResponse<CourseOfferItem>>(
      API_ENDPOINTS.enhancements.offers(courseId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to create promotional offer');
    }
    return res.data.data;
  },

  async updateOffer(courseId: number, offerId: number, payload: Partial<CreateOfferPayload>): Promise<CourseOfferItem> {
    const res = await apiClient.patch<ApiResponse<CourseOfferItem>>(
      API_ENDPOINTS.enhancements.offerById(courseId, offerId),
      payload
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update promotional offer');
    }
    return res.data.data;
  },

  async deleteOffer(courseId: number, offerId: number): Promise<void> {
    const res = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.enhancements.offerById(courseId, offerId)
    );
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete promotional offer');
    }
  },
};
