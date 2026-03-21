import React, { useState, useEffect } from 'react';
import {
  Section,
  Course,
  Enrollment,
  Student,
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getCourses,
  getEnrollments,
  getStudents,
  CreateSectionRequest,
  UpdateSectionRequest,
} from '../api';

export const SectionList: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sectionEnrollments, setSectionEnrollments] = useState<Enrollment[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSectionForView, setSelectedSectionForView] = useState<Section | null>(null);
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateSectionRequest>({
    course: 0,
    name: '',
    max_capacity: 30,
  });

  // Fetch all sections
  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSections();
      setSections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
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

  // Fetch all students for enrolled display
  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    }
  };

  // Load sections/courses/students on mount
  useEffect(() => {
    fetchSections();
    fetchCourses();
    fetchStudents();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'max_capacity' || name === 'course' ? parseInt(value) || 0 : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSection) {
        await updateSection(selectedSection.id, formData);
      } else {
        await createSection(formData);
      }
      await fetchSections();
      setIsFormVisible(false);
      setSelectedSection(null);
      setFormData({ course: 0, name: '', max_capacity: 30 });
    } catch (err: any) {
      setError(err.message || 'Failed to save section');
    }
  };

  // Handle edit
  const handleEdit = (section: Section) => {
    setSelectedSection(section);
    setFormData({
      course: section.course,
      name: section.name,
      max_capacity: section.max_capacity,
    });
    setIsFormVisible(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection(id);
        await fetchSections();
      } catch (err: any) {
        setError(err.message || 'Failed to delete section');
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedSection(null);
    setFormData({ course: 0, name: '', max_capacity: 30 });
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.course_name : 'Unknown Course';
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown Student';
  };

  const showSectionEnrollments = async (section: Section) => {
    try {
      const enrollments = await getEnrollments();
      setSectionEnrollments(enrollments.filter(e => e.section === section.id));
      setSelectedSectionForView(section);
      setIsSectionModalVisible(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
    }
  };

  const closeSectionModal = () => {
    setIsSectionModalVisible(false);
    setSelectedSectionForView(null);
    setSectionEnrollments([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sections</h2>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Section
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">
            {selectedSection ? 'Edit Section' : 'Add New Section'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {selectedSection ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading sections...</p>
        </div>
      )}

      {/* Sections List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map(section => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCourseName(section.course)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {section.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {section.max_capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        section.is_full
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {section.is_full ? 'Full' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => showSectionEnrollments(section)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Enrolled
                      </button>
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sections found. Create your first section to get started.
            </div>
          )}
        </div>
      )}

      {/* Section Enrolled Students Modal */}
      {isSectionModalVisible && selectedSectionForView && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Students in {selectedSectionForView.name}</h3>
              <button
                onClick={closeSectionModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {sectionEnrollments.length === 0 ? (
                <p className="text-gray-600">No students currently enrolled in this section.</p>
              ) : (
                <div className="space-y-2">
                  {sectionEnrollments.map(enroll => (
                    <div key={enroll.id} className="p-3 bg-gray-50 rounded border">
                      <p className="font-medium">{getStudentName(enroll.student)}</p>
                      <p className="text-sm text-gray-500">Enrolled: {new Date(enroll.date_enrolled).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionList;