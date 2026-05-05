import React, { useState, useEffect } from 'react';
import {
  Student, getStudents, getStudentById, createStudent, updateStudent, deleteStudent,
  CreateStudentRequest, UpdateStudentRequest,
} from '../api';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateStudentRequest>({ first_name: '', last_name: '', email: '', age: 0 });

  const fetchStudents = async () => {
    setLoading(true); setError(null);
    try { setStudents(await getStudents()); }
    catch (err: any) { setError(err.message || 'Failed to fetch students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'age' ? parseInt(value) || 0 : value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent(formData);
      setFormData({ first_name: '', last_name: '', email: '', age: 0 });
      setIsFormVisible(false);
      fetchStudents();
    } catch (err: any) { setError(err.message || 'Failed to create student'); }
  };

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
    } catch (err: any) { setError(err.message || 'Failed to update student'); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try { await deleteStudent(id); fetchStudents(); }
      catch (err: any) { setError(err.message || 'Failed to delete student'); }
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const student = await getStudentById(id);
      setSelectedStudent(student);
      setFormData({ first_name: student.first_name, last_name: student.last_name, email: student.email, age: student.age });
      setIsFormVisible(true);
    } catch (err: any) { setError(err.message || 'Failed to fetch student details'); }
  };

  const handleCancel = () => {
    setSelectedStudent(null);
    setFormData({ first_name: '', last_name: '', email: '', age: 0 });
    setIsFormVisible(false);
  };

  return (
    <>
      <div className="gold-strip" />
      <div className="ustp-page-header">
        <div>
          <h2 className="ustp-page-title">Students</h2>
          <p className="ustp-page-subtitle">Manage enrolled student records</p>
        </div>
        <button
          className={isFormVisible ? 'btn-ghost' : 'btn-gold'}
          onClick={() => { setIsFormVisible(!isFormVisible); if (isFormVisible) handleCancel(); }}
        >
          {isFormVisible ? '✕ Close Form' : '+ Add Student'}
        </button>
      </div>

      {error && (
        <div className="ustp-alert ustp-alert-error">
          <span>⚠</span>
          <div><strong>Error</strong> — {error}</div>
        </div>
      )}

      {isFormVisible && (
        <div className="ustp-form-section" style={{ margin: '0 28px 20px' }}>
          <div className="ustp-form-title">{selectedStudent ? 'Edit Student Record' : 'New Student Record'}</div>
          <form onSubmit={selectedStudent ? handleUpdate : handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required placeholder="Juan" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-input" type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required placeholder="Dela Cruz" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="juan@ustp.edu.ph" />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input className="form-input" type="number" name="age" value={formData.age} onChange={handleInputChange} required min="1" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{selectedStudent ? '✓ Update' : '+ Create'}</button>
              <button type="button" className="btn-ghost" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="ustp-spinner"><div className="spinner-ring" /></div>
      ) : (
        <div className="ustp-table-wrap">
          <table className="ustp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td><span className="id-badge">#{student.id}</span></td>
                  <td>{student.first_name}</td>
                  <td style={{ fontWeight: 500 }}>{student.last_name}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{student.email}</td>
                  <td>{student.age}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table-edit" onClick={() => handleEdit(student.id)}>Edit</button>
                      <button className="btn-table-delete" onClick={() => handleDelete(student.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="ustp-empty">
              <div className="ustp-empty-icon">👤</div>
              <div className="ustp-empty-text">No students found. Add one to get started.</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentList;