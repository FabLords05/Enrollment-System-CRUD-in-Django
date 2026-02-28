import axios from 'axios';
import { API_BASE_URL } from './api/config';

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============= Type Definitions =============

// ===== Student =====
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

// ===== Teacher =====
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

// ===== Course =====
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

// ===== Enrollment =====
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

// ============= Student API Methods =============

export const getStudents = async (): Promise<Student[]> => {
  const response = await axiosInstance.get<Student[]>('students/');
  return response.data;
};

export const getStudentById = async (id: number): Promise<Student> => {
  const response = await axiosInstance.get<Student>(`students/${id}/`);
  return response.data;
};

export const createStudent = async (data: CreateStudentRequest): Promise<Student> => {
  const response = await axiosInstance.post<Student>('students/', data);
  return response.data;
};

export const updateStudent = async (id: number, data: UpdateStudentRequest): Promise<Student> => {
  const response = await axiosInstance.patch<Student>(`students/${id}/`, data);
  return response.data;
};

export const deleteStudent = async (id: number): Promise<void> => {
  await axiosInstance.delete(`students/${id}/`);
};

// ============= Teacher API Methods =============

export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await axiosInstance.get<Teacher[]>('teachers/');
  return response.data;
};

export const getTeacherById = async (id: number): Promise<Teacher> => {
  const response = await axiosInstance.get<Teacher>(`teachers/${id}/`);
  return response.data;
};

export const createTeacher = async (data: CreateTeacherRequest): Promise<Teacher> => {
  const response = await axiosInstance.post<Teacher>('teachers/', data);
  return response.data;
};

export const updateTeacher = async (id: number, data: UpdateTeacherRequest): Promise<Teacher> => {
  const response = await axiosInstance.patch<Teacher>(`teachers/${id}/`, data);
  return response.data;
};

export const deleteTeacher = async (id: number): Promise<void> => {
  await axiosInstance.delete(`teachers/${id}/`);
};

// ============= Course API Methods =============

export const getCourses = async (): Promise<Course[]> => {
  const response = await axiosInstance.get<Course[]>('courses/');
  return response.data;
};

export const getCourseById = async (id: number): Promise<Course> => {
  const response = await axiosInstance.get<Course>(`courses/${id}/`);
  return response.data;
};

export const createCourse = async (data: CreateCourseRequest): Promise<Course> => {
  const response = await axiosInstance.post<Course>('courses/', data);
  return response.data;
};

export const updateCourse = async (id: number, data: UpdateCourseRequest): Promise<Course> => {
  const response = await axiosInstance.patch<Course>(`courses/${id}/`, data);
  return response.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await axiosInstance.delete(`courses/${id}/`);
};

// ============= Enrollment API Methods =============

export const getEnrollments = async (): Promise<Enrollment[]> => {
  const response = await axiosInstance.get<Enrollment[]>('enrollments/');
  return response.data;
};

export const getEnrollmentById = async (id: number): Promise<Enrollment> => {
  const response = await axiosInstance.get<Enrollment>(`enrollments/${id}/`);
  return response.data;
};

export const createEnrollment = async (data: CreateEnrollmentRequest): Promise<Enrollment> => {
  const response = await axiosInstance.post<Enrollment>('enrollments/', data);
  return response.data;
};

export const updateEnrollment = async (id: number, data: UpdateEnrollmentRequest): Promise<Enrollment> => {
  const response = await axiosInstance.patch<Enrollment>(`enrollments/${id}/`, data);
  return response.data;
};

export const deleteEnrollment = async (id: number): Promise<void> => {
  await axiosInstance.delete(`enrollments/${id}/`);
};

// ============= Error Handling =============

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
