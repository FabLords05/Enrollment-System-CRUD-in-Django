import React, { useState, useEffect } from 'react';
import {
  Teacher,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
} from '../api';

export const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherRequest>({
    teacher_name: '',
    email: '',
  });

  // Fetch all teachers
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  // Load teachers on mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle create teacher
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeacher(formData);
      setFormData({ teacher_name: '', email: '' });
      setIsFormVisible(false);
      fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher');
    }
  };

  // Handle update teacher
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      const updateData: UpdateTeacherRequest = {
        teacher_name: formData.teacher_name || selectedTeacher.teacher_name,
        email: formData.email || selectedTeacher.email,
      };
      await updateTeacher(selectedTeacher.id, updateData);
      setSelectedTeacher(null);
      setFormData({ teacher_name: '', email: '' });
      setIsFormVisible(false);
      fetchTeachers();
    } catch (err: any) {
      setError(err.message || 'Failed to update teacher');
    }
  };

  // Handle delete teacher
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacher(id);
        fetchTeachers();
      } catch (err: any) {
        setError(err.message || 'Failed to delete teacher');
      }
    }
  };

  // Handle edit button
  const handleEdit = async (id: number) => {
    try {
      const teacher = await getTeacherById(id);
      setSelectedTeacher(teacher);
      setFormData({
        teacher_name: teacher.teacher_name,
        email: teacher.email,
      });
      setIsFormVisible(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teacher details');
    }
  };

  const handleCancel = () => {
    setSelectedTeacher(null);
    setFormData({ teacher_name: '', email: '' });
    setIsFormVisible(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Teachers</h2>
        <p className="text-gray-600">Manage teacher records</p>
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
          {isFormVisible ? 'Cancel' : 'Add Teacher'}
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <form onSubmit={selectedTeacher ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Name *</label>
                <input
                  type="text"
                  name="teacher_name"
                  value={formData.teacher_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter teacher name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                {selectedTeacher ? 'Update' : 'Create'}
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.teacher_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => handleEdit(teacher.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teachers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No teachers found. Add one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherList;
