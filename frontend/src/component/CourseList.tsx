import React, { useState, useEffect } from 'react';
import {
  Course,
  Teacher,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeachers,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '../api';

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateCourseRequest>({
    course_name: '',
    units: 0,
    teacher: 0,
  });

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all teachers for dropdown
  const fetchTeachers = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
    }
  };

  // Load courses and teachers on mount
  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'units' || name === 'teacher' ? parseInt(value) || 0 : value,
    });
  };

  // Handle create course
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      setFormData({ course_name: '', units: 0, teacher: 0 });
      setIsFormVisible(false);
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    }
  };

  // Handle update course
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const updateData: UpdateCourseRequest = {
        course_name: formData.course_name || selectedCourse.course_name,
        units: formData.units || selectedCourse.units,
        teacher: formData.teacher || selectedCourse.teacher,
      };
      await updateCourse(selectedCourse.id, updateData);
      setSelectedCourse(null);
      setFormData({ course_name: '', units: 0, teacher: 0 });
      setIsFormVisible(false);
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
    }
  };

  // Handle delete course
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        fetchCourses();
      } catch (err: any) {
        setError(err.message || 'Failed to delete course');
      }
    }
  };

  // Handle edit button
  const handleEdit = async (id: number) => {
    try {
      const course = await getCourseById(id);
      setSelectedCourse(course);
      setFormData({
        course_name: course.course_name,
        units: course.units,
        teacher: course.teacher,
      });
      setIsFormVisible(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course details');
    }
  };

  const handleCancel = () => {
    setSelectedCourse(null);
    setFormData({ course_name: '', units: 0, teacher: 0 });
    setIsFormVisible(false);
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.teacher_name : 'Unknown';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Courses</h2>
        <p className="text-gray-600">Manage course records</p>
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
          {isFormVisible ? 'Cancel' : 'Add Course'}
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{selectedCourse ? 'Edit Course' : 'Add New Course'}</h3>
          <form onSubmit={selectedCourse ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name *</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter course name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Units *</label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter units"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher *</label>
              <select
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value={0}>Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.teacher_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                {selectedCourse ? 'Update' : 'Create'}
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Units</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.course_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.units}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getTeacherName(course.teacher)}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No courses found. Add one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;
