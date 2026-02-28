import React, { useState, useEffect } from 'react';
import {
  Enrollment,
  Student,
  Course,
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getStudents,
  getCourses,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
} from '../api';

export const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateEnrollmentRequest>({
    student: 0,
    course: 0,
  });

  // Fetch all enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students for dropdown
  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    }
  };

  // Fetch all courses for dropdown
  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    }
  };

  // Load enrollments, students, and courses on mount
  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0,
    });
  };

  // Handle create enrollment
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEnrollment(formData);
      setFormData({ student: 0, course: 0 });
      setIsFormVisible(false);
      fetchEnrollments();
    } catch (err: any) {
      setError(err.message || 'Failed to create enrollment');
    }
  };

  // Handle update enrollment
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    try {
      const updateData: UpdateEnrollmentRequest = {
        student: formData.student || selectedEnrollment.student,
        course: formData.course || selectedEnrollment.course,
      };
      await updateEnrollment(selectedEnrollment.id, updateData);
      setSelectedEnrollment(null);
      setFormData({ student: 0, course: 0 });
      setIsFormVisible(false);
      fetchEnrollments();
    } catch (err: any) {
      setError(err.message || 'Failed to update enrollment');
    }
  };

  // Handle delete enrollment
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try {
        await deleteEnrollment(id);
        fetchEnrollments();
      } catch (err: any) {
        setError(err.message || 'Failed to delete enrollment');
      }
    }
  };

  // Handle edit button
  const handleEdit = async (id: number) => {
    try {
      const enrollment = await getEnrollmentById(id);
      setSelectedEnrollment(enrollment);
      setFormData({
        student: enrollment.student,
        course: enrollment.course,
      });
      setIsFormVisible(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollment details');
    }
  };

  const handleCancel = () => {
    setSelectedEnrollment(null);
    setFormData({ student: 0, course: 0 });
    setIsFormVisible(false);
  };

  // Get student name by ID
  const getStudentName = (studentId: number) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown';
  };

  // Get course name by ID
  const getCourseName = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.course_name : 'Unknown';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Enrollments</h2>
        <p className="text-gray-600">Manage student course enrollments</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center ${
            isFormVisible
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6.5L10.5 1.5z" />
            {isFormVisible ? <path d="M6 9h8v2H6V9z" /> : <path d="M10.5 7v3h3v2h-3v3h-2v-3h-3v-2h3V7h2z" />}
          </svg>
          {isFormVisible ? 'Cancel' : 'Add Enrollment'}
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{selectedEnrollment ? 'Edit Enrollment' : 'Add New Enrollment'}</h3>
          <form onSubmit={selectedEnrollment ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student *</label>
                <select
                  name="student"
                  value={formData.student}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value={0}>Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course *</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value={0}>Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                {selectedEnrollment ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Enrollment Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment, index) => (
                <tr key={enrollment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900">{enrollment.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getStudentName(enrollment.student)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getCourseName(enrollment.course)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(enrollment.enrollment_date)}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => handleEdit(enrollment.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(enrollment.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No enrollments found. Add one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollmentList;
