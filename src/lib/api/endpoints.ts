/**
 * Centralized registry of all 128 verified backend API endpoints
 * Base URL is relative (/api/...) for same-origin proxy or rewrites
 */
export const API_ENDPOINTS = {
  // 1. Health & Root (3)
  root: '/api',
  health: '/api/health',
  healthDb: '/api/health/db',

  // 2. Authentication (6)
  auth: {
    google: '/api/auth/google',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    logoutAll: '/api/auth/logout-all',
    me: '/api/auth/me',
  },

  // 3. Categories (8)
  categories: {
    list: '/api/categories',
    bySlug: (slug: string) => `/api/categories/${slug}`,
    adminList: '/api/admin/categories',
    adminCreate: '/api/admin/categories',
    adminById: (id: number) => `/api/admin/categories/${id}`,
    adminUpdate: (id: number) => `/api/admin/categories/${id}`,
    adminDelete: (id: number) => `/api/admin/categories/${id}`,
    adminReorder: '/api/admin/categories/reorder',
  },

  // 4. Subcategories (8)
  subcategories: {
    byCategorySlug: (catSlug: string) => `/api/categories/${catSlug}/subcategories`,
    detail: (catSlug: string, subSlug: string) => `/api/categories/${catSlug}/subcategories/${subSlug}`,
    adminList: '/api/admin/subcategories',
    adminCreate: '/api/admin/subcategories',
    adminById: (id: number) => `/api/admin/subcategories/${id}`,
    adminUpdate: (id: number) => `/api/admin/subcategories/${id}`,
    adminDelete: (id: number) => `/api/admin/subcategories/${id}`,
    adminReorder: '/api/admin/subcategories/reorder',
  },

  // 5. Instructors (8)
  instructors: {
    list: '/api/instructors',
    byId: (id: number) => `/api/instructors/${id}`,
    adminList: '/api/admin/instructors',
    adminCreate: '/api/admin/instructors',
    adminById: (id: number) => `/api/admin/instructors/${id}`,
    adminUpdate: (id: number) => `/api/admin/instructors/${id}`,
    adminDelete: (id: number) => `/api/admin/instructors/${id}`,
    adminUpload: '/api/admin/uploads',
    adminProvision: '/api/admin/instructors/provision',
    adminStatus: (id: number) => `/api/admin/instructors/${id}/status`,
    adminCourseInstructors: (courseId: number) => `/api/admin/instructors/courses/${courseId}`,
    adminAssignCourse: (courseId: number) => `/api/admin/instructors/courses/${courseId}`,
    adminReassignPrimary: (courseId: number) => `/api/admin/instructors/courses/${courseId}/primary`,
    adminUpdateCourseInstructor: (courseId: number, instructorId: number) => `/api/admin/instructors/courses/${courseId}/${instructorId}`,
    adminRemoveCourseInstructor: (courseId: number, instructorId: number) => `/api/admin/instructors/courses/${courseId}/${instructorId}`,
    adminAssignBatch: (batchId: number) => `/api/admin/instructors/batches/${batchId}`,
  },

  // 5b. Staff & Counsellor Management (5)
  counsellors: {
    adminList: '/api/admin/users/counsellors',
    adminProvision: '/api/admin/users/counsellors',
    adminById: (id: number) => `/api/admin/users/counsellors/${id}`,
    adminStatus: (id: number) => `/api/admin/users/counsellors/${id}/status`,
    adminPromote: '/api/admin/users/counsellors/promote',
  },

  // 6. Courses & Catalog (10)
  courses: {
    list: '/api/courses',
    bySlug: (slug: string) => `/api/courses/${slug}`,
    search: '/api/search',
    adminList: '/api/admin/courses',
    adminCreate: '/api/admin/courses',
    adminById: (id: number) => `/api/admin/courses/${id}`,
    adminUpdate: (id: number) => `/api/admin/courses/${id}`,
    adminDelete: (id: number) => `/api/admin/courses/${id}`,
    adminDuplicate: (id: number) => `/api/admin/courses/${id}/duplicate`,
    adminStatus: (id: number) => `/api/admin/courses/${id}/status`,
  },

  // 7. Curriculum (8)
  curriculum: {
    adminByCourseId: (id: number) => `/api/admin/courses/${id}/curriculum`,
    adminReorder: (id: number) => `/api/admin/courses/${id}/curriculum/reorder`,
    adminCreateModule: (id: number) => `/api/admin/courses/${id}/modules`,
    adminUpdateModule: (moduleId: number) => `/api/admin/modules/${moduleId}`,
    adminDeleteModule: (moduleId: number) => `/api/admin/modules/${moduleId}`,
    adminCreateLesson: (moduleId: number) => `/api/admin/modules/${moduleId}/lessons`,
    adminUpdateLesson: (lessonId: number) => `/api/admin/lessons/${lessonId}`,
    adminDeleteLesson: (lessonId: number) => `/api/admin/lessons/${lessonId}`,
  },

  // 8. Batches (5)
  batches: {
    byCourseId: (id: number) => `/api/courses/${id}/batches`,
    adminByCourseId: (id: number) => `/api/admin/courses/${id}/batches`,
    adminCreate: (id: number) => `/api/admin/courses/${id}/batches`,
    adminUpdate: (batchId: number) => `/api/admin/batches/${batchId}`,
    adminDelete: (batchId: number) => `/api/admin/batches/${batchId}`,
  },

  // 9. Course Enhancements (22)
  enhancements: {
    seo: (id: number) => `/api/admin/courses/${id}/seo`,
    pricing: (id: number) => `/api/admin/courses/${id}/pricing`,
    installments: (id: number) => `/api/admin/courses/${id}/installments`,
    installmentById: (id: number, planId: number) => `/api/admin/courses/${id}/installments/${planId}`,
    offers: (id: number) => `/api/admin/courses/${id}/offers`,
    offerById: (id: number, offerId: number) => `/api/admin/courses/${id}/offers/${offerId}`,
    faqs: (id: number) => `/api/admin/courses/${id}/faqs`,
    testimonials: (id: number) => `/api/admin/courses/${id}/testimonials`,
    benefits: (id: number) => `/api/admin/courses/${id}/benefits`,
    enrollmentSettings: (id: number) => `/api/admin/courses/${id}/enrollment-settings`,
    points: (id: number) => `/api/admin/courses/${id}/points`,
  },

  // 10. Uploads (2)
  uploads: {
    adminUpload: '/api/admin/uploads',
    adminDelete: '/api/admin/uploads',
  },

  // 11. Materials (6)
  materials: {
    byCourseId: (id: number) => `/api/courses/${id}/materials`,
    download: (id: number, materialId: number) => `/api/courses/${id}/materials/${materialId}/download`,
    adminByCourseId: (id: number) => `/api/admin/courses/${id}/materials`,
    adminCreate: (id: number) => `/api/admin/courses/${id}/materials`,
    adminUpdate: (materialId: number) => `/api/admin/materials/${materialId}`,
    adminDelete: (materialId: number) => `/api/admin/materials/${materialId}`,
  },

  // 12. Demo Classes & Leads (15)
  demo: {
    settings: (id: number) => `/api/courses/${id}/demo-settings`,
    request: (id: number) => `/api/courses/${id}/demo-requests`,
    myRequests: '/api/me/demo-requests',
    myCancel: (id: number) => `/api/me/demo-requests/${id}/cancel`,
    adminSettings: (id: number) => `/api/admin/courses/${id}/demo-settings`,
    adminCourseRequests: (id: number) => `/api/admin/courses/${id}/demo-requests`,
    adminRequests: '/api/admin/demo-requests',
    adminExport: '/api/admin/demo-requests/export',
    adminRequestById: (id: number) => `/api/admin/demo-requests/${id}`,
    adminUpdateRequest: (id: number) => `/api/admin/demo-requests/${id}`,
    adminDeleteRequest: (id: number) => `/api/admin/demo-requests/${id}`,
    adminAddNote: (id: number) => `/api/admin/demo-requests/${id}/notes`,
    adminConvert: (id: number) => `/api/admin/demo-requests/${id}/convert`,
    adminBulk: '/api/admin/demo-requests/bulk',
  },

  // 13. Eligibility (6)
  eligibility: {
    byCourseId: (id: number) => `/api/courses/${id}/eligibility`,
    check: (id: number) => `/api/courses/${id}/eligibility-checks`,
    myResult: (id: number) => `/api/me/courses/${id}/eligibility-result`,
    adminRules: (id: number) => `/api/admin/courses/${id}/eligibility-rules`,
    adminChecks: (id: number) => `/api/admin/courses/${id}/eligibility-checks`,
  },

  // 14. Enrollments & Progress (7)
  enrollments: {
    enrollFree: (id: number) => `/api/courses/${id}/enroll`,
    myList: '/api/me/enrollments',
    myCurriculum: (id: number) => `/api/me/courses/${id}/curriculum`,
    myProgress: (lessonId: number) => `/api/me/lessons/${lessonId}/progress`,
    adminList: '/api/admin/enrollments',
    adminGrant: '/api/admin/enrollments',
    adminUpdate: (id: number) => `/api/admin/enrollments/${id}`,
  },

  // 15. Wishlist (3)
  wishlist: {
    add: (id: number) => `/api/courses/${id}/wishlist`,
    remove: (id: number) => `/api/courses/${id}/wishlist`,
    myList: '/api/me/wishlist',
  },

  // 16. Reviews (6)
  reviews: {
    byCourseId: (id: number) => `/api/courses/${id}/reviews`,
    create: (id: number) => `/api/courses/${id}/reviews`,
    myUpdate: (id: number) => `/api/me/reviews/${id}`,
    myDelete: (id: number) => `/api/me/reviews/${id}`,
    adminList: '/api/admin/reviews',
    adminModerate: (id: number) => `/api/admin/reviews/${id}/moderate`,
  },

  // 17. Telemetry & Analytics (6)
  analytics: {
    view: (id: number) => `/api/courses/${id}/views`,
    share: (id: number) => `/api/courses/${id}/share`,
    enquiryClick: (id: number) => `/api/courses/${id}/enquiry-click`,
    adminCourseAnalytics: (id: number) => `/api/admin/courses/${id}/analytics`,
    adminTopCourses: '/api/admin/analytics/courses',
    adminDashboard: '/api/admin/dashboard',
  },

  // 18. Instructor Portal (21)
  instructorPortal: {
    overview: '/api/instructor/overview',
    courses: '/api/instructor/courses',
    courseDetails: (courseId: number) => `/api/instructor/courses/${courseId}`,
    createModule: (courseId: number) => `/api/instructor/courses/${courseId}/modules`,
    updateModule: (moduleId: number) => `/api/instructor/modules/${moduleId}`,
    deleteModule: (moduleId: number) => `/api/instructor/modules/${moduleId}`,
    createLesson: (moduleId: number) => `/api/instructor/modules/${moduleId}/lessons`,
    updateLesson: (lessonId: number) => `/api/instructor/lessons/${lessonId}`,
    deleteLesson: (lessonId: number) => `/api/instructor/lessons/${lessonId}`,
    batches: '/api/instructor/batches',
    students: '/api/instructor/students',
    demos: '/api/instructor/demos',
    updateDemo: (demoId: number) => `/api/instructor/demos/${demoId}`,
    sessions: '/api/instructor/sessions',
    createSession: '/api/instructor/sessions',
    updateSession: (sessionId: number) => `/api/instructor/sessions/${sessionId}`,
    sessionAttendance: (sessionId: number) => `/api/instructor/sessions/${sessionId}/attendance`,
    saveAttendance: (sessionId: number) => `/api/instructor/sessions/${sessionId}/attendance`,
    materials: '/api/instructor/materials',
    createMaterial: '/api/instructor/materials',
    deleteMaterial: (materialId: number) => `/api/instructor/materials/${materialId}`,
    profile: '/api/instructor/profile',
    updateProfile: '/api/instructor/profile',
  },

  // 19. Contact Queries (5)
  contact: {
    submit: '/api/contact',
    adminList: '/api/admin/contacts',
    adminById: (id: number) => `/api/admin/contacts/${id}`,
    adminStatus: (id: number) => `/api/admin/contacts/${id}/status`,
    adminAssign: (id: number) => `/api/admin/contacts/${id}/assign`,
  },

  // 20. Centralized Notifications & Consent (5)
  notifications: {
    whatsappConsent: '/api/notifications/whatsapp/consent',
    adminSettings: '/api/admin/notifications/settings',
    adminUpdateSetting: (eventType: string) => `/api/admin/notifications/settings/${eventType}`,
    adminLogs: '/api/admin/notifications/logs',
    adminRetry: (id: number) => `/api/admin/notifications/logs/${id}/retry`,
  },

  // 21. WhatsApp Desk & Number Management (8)
  whatsapp: {
    adminList: '/api/admin/whatsapp',
    adminCreate: '/api/admin/whatsapp',
    adminById: (id: number) => `/api/admin/whatsapp/${id}`,
    adminUpdate: (id: number) => `/api/admin/whatsapp/${id}`,
    adminSetDefault: (id: number) => `/api/admin/whatsapp/${id}/set-default`,
    adminStatus: (id: number) => `/api/admin/whatsapp/${id}/status`,
    adminDelete: (id: number) => `/api/admin/whatsapp/${id}`,
    adminPreview: (id: number) => `/api/admin/whatsapp/${id}/preview`,
  },
} as const;
