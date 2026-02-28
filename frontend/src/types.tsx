// ============= Student Types =============
export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
}

export interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  email: string;
  age: number;
}

export interface UpdateStudentRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  age?: number;
}

// ============= Teacher Types =============
export interface Teacher {
  id: number;
  teacher_name: string;
  email: string;
}

export interface CreateTeacherRequest {
  teacher_name: string;
  email: string;
}

export interface UpdateTeacherRequest {
  teacher_name?: string;
  email?: string;
}

// ============= Course Types =============
export interface Course {
  id: number;
  course_name: string;
  units: number;
  teacher: number; // FK to Teacher ID
}

export interface CreateCourseRequest {
  course_name: string;
  units: number;
  teacher: number;
}

export interface UpdateCourseRequest {
  course_name?: string;
  units?: number;
  teacher?: number;
}

// ============= Enrollment Types =============
export interface Enrollment {
  id: number;
  student: number; // FK to Student ID
  course: number; // FK to Course ID
  enrollment_date: string;
}

export interface CreateEnrollmentRequest {
  student: number;
  course: number;
}

export interface UpdateEnrollmentRequest {
  student?: number;
  course?: number;
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============= Component Props Types =============
export interface ListComponentProps {
  onRefresh?: () => void;
}

export interface FormComponentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}