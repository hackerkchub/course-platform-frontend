import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface InstructorOverviewResponse {
  instructor: {
    id: number;
    name: string;
    designation?: string | null;
    photo_url?: string | null;
  };
  metrics: {
    assignedCoursesCount: number;
    assignedBatchesCount: number;
    totalStudentsCount: number;
    pendingDemosCount: number;
    upcomingSessionsCount: number;
    upcomingSessions: Array<{
      id: number;
      batch_id: number;
      session_number: number;
      session_date: string;
      start_time?: string | null;
      end_time?: string | null;
      title?: string | null;
      status: string;
      batch_name: string;
      course_name: string;
    }>;
    pendingDemos: Array<{
      id: number;
      student_name: string;
      student_email: string;
      student_phone: string;
      status: string;
      demo_date: string;
      demo_time: string;
      created_at: string;
      course_name: string;
    }>;
  };
}

export interface InstructorCourseItem {
  id: number;
  course_code: string;
  course_name: string;
  slug: string;
  course_level: string;
  mode: string;
  status: string;
  price: number | string;
  thumbnail_url?: string | null;
  is_primary: boolean;
  can_manage_curriculum: boolean;
  assigned_at: string;
  batch_count: number;
  enrolled_students_count: number;
}

export interface InstructorBatchItem {
  id: number;
  course_id: number;
  batch_name: string;
  start_date: string;
  end_date?: string | null;
  class_days?: string | null;
  class_timing?: string | null;
  total_seats: number;
  seats_available: number;
  status: string;
  batch_instructor_id?: number | null;
  course_name: string;
  course_code: string;
  is_course_primary: boolean;
  total_sessions: number;
  conducted_sessions: number;
  enrolled_count: number;
}

export interface InstructorStudentItem {
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone?: string | null;
  enrollment_id: number;
  course_id: number;
  enrollment_status: string;
  enrolled_at: string;
  course_name: string;
  course_code: string;
  completed_lessons_count: number;
  attended_sessions_count: number;
}

export interface InstructorDemoItem {
  id: number;
  course_id: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
  preferred_mode?: string | null;
  demo_date: string;
  demo_time: string;
  notes?: string | null;
  created_at: string;
  course_name: string;
  course_code: string;
}

export interface InstructorSessionItem {
  id: number;
  batch_id: number;
  session_number: number;
  session_date: string;
  start_time?: string | null;
  end_time?: string | null;
  title?: string | null;
  status: 'scheduled' | 'conducted' | 'cancelled';
  batch_name: string;
  course_name: string;
  attendance_marked_count: number;
}

export interface SessionAttendanceSheet {
  session: {
    id: number;
    batch_id: number;
    session_number: number;
    session_date: string;
    title?: string | null;
    batch_name: string;
    course_id: number;
    course_name: string;
  };
  students: Array<{
    student_id: number;
    student_name: string;
    student_email: string;
    attendance_id?: number | null;
    attendance_status?: 'present' | 'absent' | 'late' | 'excused' | null;
    notes?: string | null;
  }>;
}

export interface InstructorMaterialItem {
  id: number;
  course_id: number;
  title: string;
  material_type: string;
  file_path: string;
  file_url: string;
  file_type?: string | null;
  file_size_bytes: number;
  course_name: string;
  course_code: string;
  created_at: string;
}

export async function fetchInstructorOverview(): Promise<InstructorOverviewResponse> {
  const res = await apiClient.get<{ success: boolean; data: InstructorOverviewResponse }>(
    API_ENDPOINTS.instructorPortal.overview
  );
  return res.data.data;
}

export async function fetchInstructorCourses(): Promise<InstructorCourseItem[]> {
  const res = await apiClient.get<{ success: boolean; data: InstructorCourseItem[] }>(
    API_ENDPOINTS.instructorPortal.courses
  );
  return res.data.data;
}

export async function fetchInstructorCourseDetails(courseId: number): Promise<any> {
  const res = await apiClient.get(API_ENDPOINTS.instructorPortal.courseDetails(courseId));
  return res.data.data;
}

export async function fetchInstructorBatches(): Promise<InstructorBatchItem[]> {
  const res = await apiClient.get<{ success: boolean; data: InstructorBatchItem[] }>(
    API_ENDPOINTS.instructorPortal.batches
  );
  return res.data.data;
}

export async function fetchInstructorStudents(params: {
  course_id?: number;
  batch_id?: number;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ students: InstructorStudentItem[]; total: number }> {
  const res = await apiClient.get(API_ENDPOINTS.instructorPortal.students, { params });
  return res.data;
}

export async function fetchInstructorDemos(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ demos: InstructorDemoItem[]; total: number }> {
  const res = await apiClient.get(API_ENDPOINTS.instructorPortal.demos, { params });
  return res.data;
}

export async function updateInstructorDemoStatus(demoId: number, data: { status: string; notes?: string }): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.instructorPortal.updateDemo(demoId), data);
  return res.data;
}

export async function fetchInstructorSessions(params: {
  batch_id?: number;
  date_from?: string;
  date_to?: string;
} = {}): Promise<InstructorSessionItem[]> {
  const res = await apiClient.get<{ success: boolean; data: InstructorSessionItem[] }>(
    API_ENDPOINTS.instructorPortal.sessions,
    { params }
  );
  return res.data.data;
}

export async function createInstructorSession(data: {
  batch_id: number;
  session_number: number;
  session_date: string;
  start_time?: string | null;
  end_time?: string | null;
  title?: string | null;
  status?: string;
}): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructorPortal.createSession, data);
  return res.data;
}

export async function updateInstructorSession(sessionId: number, data: Partial<{
  session_date: string;
  start_time: string;
  end_time: string;
  title: string;
  status: string;
}>): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.instructorPortal.updateSession(sessionId), data);
  return res.data;
}

export async function fetchSessionAttendance(sessionId: number): Promise<SessionAttendanceSheet> {
  const res = await apiClient.get<{ success: boolean; data: SessionAttendanceSheet }>(
    API_ENDPOINTS.instructorPortal.sessionAttendance(sessionId)
  );
  return res.data.data;
}

export async function saveSessionAttendance(sessionId: number, records: Array<{
  student_id: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string | null;
}>): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructorPortal.saveAttendance(sessionId), { records });
  return res.data;
}

export async function fetchInstructorMaterials(params: { course_id?: number } = {}): Promise<InstructorMaterialItem[]> {
  const res = await apiClient.get<{ success: boolean; data: InstructorMaterialItem[] }>(
    API_ENDPOINTS.instructorPortal.materials,
    { params }
  );
  return res.data.data;
}

export async function createInstructorMaterial(data: {
  course_id: number;
  title: string;
  material_type?: string;
  file_path: string;
  file_type?: string;
  file_size_bytes?: number;
}): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructorPortal.createMaterial, data);
  return res.data;
}

export async function deleteInstructorMaterial(materialId: number): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.instructorPortal.deleteMaterial(materialId));
  return res.data;
}

export async function createInstructorModule(courseId: number, data: { title: string; description?: string; display_order?: number }): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructorPortal.createModule(courseId), data);
  return res.data;
}

export async function updateInstructorModule(moduleId: number, data: any): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.instructorPortal.updateModule(moduleId), data);
  return res.data;
}

export async function deleteInstructorModule(moduleId: number): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.instructorPortal.deleteModule(moduleId));
  return res.data;
}

export async function createInstructorLesson(moduleId: number, data: any): Promise<any> {
  const res = await apiClient.post(API_ENDPOINTS.instructorPortal.createLesson(moduleId), data);
  return res.data;
}

export async function updateInstructorLesson(lessonId: number, data: any): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.instructorPortal.updateLesson(lessonId), data);
  return res.data;
}

export async function deleteInstructorLesson(lessonId: number): Promise<any> {
  const res = await apiClient.delete(API_ENDPOINTS.instructorPortal.deleteLesson(lessonId));
  return res.data;
}

export async function fetchInstructorProfile(): Promise<any> {
  const res = await apiClient.get(API_ENDPOINTS.instructorPortal.profile);
  return res.data.data;
}

export async function updateInstructorProfile(data: {
  designation?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  photo_url?: string | null;
  social_links?: Record<string, string> | null;
}): Promise<any> {
  const res = await apiClient.patch(API_ENDPOINTS.instructorPortal.updateProfile, data);
  return res.data.data;
}
