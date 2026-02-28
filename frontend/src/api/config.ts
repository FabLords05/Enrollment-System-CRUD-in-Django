// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  enrollments: `${API_BASE_URL}/enrollments/`,
  students: `${API_BASE_URL}/students/`,
  courses: `${API_BASE_URL}/courses/`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
