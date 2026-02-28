import React, { useState, useEffect } from 'react';
import {
  Student,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  CreateStudentRequest,
  UpdateStudentRequest,
} from '../api';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateStudentRequest>({
    first_name: '',
    last_name: '',
    email: '',
    age: 0,
  });

  // Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Load students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value) || 0 : value,
    });
  };

  // Handle create student
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent(formData);
      setFormData({ first_name: '', last_name: '', email: '', age: 0 });
      setIsFormVisible(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to create student');
    }
  };

  // Handle update student
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const updateData: UpdateStudentRequest = {
        first_name: formData.first_name || selectedStudent.first_name,
        last_name: formData.last_name || selectedStudent.last_name,
        email: formData.email || selectedStudent.email,
        age: formData.age || selectedStudent.age,
      };
      await updateStudent(selectedStudent.id, updateData);
      setSelectedStudent(null);
      setFormData({ first_name: '', last_name: '', email: '', age: 0 });
      setIsFormVisible(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    }
  };

  // Handle delete student
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        fetchStudents();
      } catch (err: any) {
        setError(err.message || 'Failed to delete student');
      }
    }
  };

  // Handle edit button
  const handleEdit = async (id: number) => {
    try {
      const student = await getStudentById(id);
      setSelectedStudent(student);
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        age: student.age,
      });
      setIsFormVisible(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student details');
    }
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    setFormData({ first_name: '', last_name: '', email: '', age: 0 });
    setIsFormVisible(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Students</h2>
        <p className="text-gray-600">Manage student records</p>
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
          {isFormVisible ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3>
          <form onSubmit={selectedStudent ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter age"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                {selectedStudent ? 'Update' : 'Create'}
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">First Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Age</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.first_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.age}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => handleEdit(student.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No students found. Add one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList;
