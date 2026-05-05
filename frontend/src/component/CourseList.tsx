import React, { useState, useEffect } from 'react';
import {
  Course, Teacher, getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  getTeachers, CreateCourseRequest, UpdateCourseRequest,
} from '../api';

export const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateCourseRequest>({ course_name: '', units: 0, teacher: 0 });

  const fetchCourses = async () => {
    setLoading(true); setError(null);
    try { setCourses(await getCourses()); }
    catch (err: any) { setError(err.message || 'Failed to fetch courses'); }
    finally { setLoading(false); }
  };

  const fetchTeachers = async () => {
    try { setTeachers(await getTeachers()); }
    catch (err: any) { setError(err.message || 'Failed to fetch teachers'); }
  };

  useEffect(() => { fetchCourses(); fetchTeachers(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'units' || name === 'teacher' ? parseInt(value) || 0 : value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      setFormData({ course_name: '', units: 0, teacher: 0 });
      setIsFormVisible(false);
      fetchCourses();
    } catch (err: any) { setError(err.message || 'Failed to create course'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await updateCourse(selectedCourse.id, {
        course_name: formData.course_name || selectedCourse.course_name,
        units: formData.units || selectedCourse.units,
        teacher: formData.teacher || selectedCourse.teacher,
      });
      setSelectedCourse(null);
      setFormData({ course_name: '', units: 0, teacher: 0 });
      setIsFormVisible(false);
      fetchCourses();
    } catch (err: any) { setError(err.message || 'Failed to update course'); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try { await deleteCourse(id); fetchCourses(); }
      catch (err: any) { setError(err.message || 'Failed to delete course'); }
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const course = await getCourseById(id);
      setSelectedCourse(course);
      setFormData({ course_name: course.course_name, units: course.units, teacher: course.teacher });
      setIsFormVisible(true);
    } catch (err: any) { setError(err.message || 'Failed to fetch course details'); }
  };

  const handleCancel = () => {
    setSelectedCourse(null);
    setFormData({ course_name: '', units: 0, teacher: 0 });
    setIsFormVisible(false);
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.teacher_name : 'Unknown';
  };

  return (
    <>
      <div className="gold-strip" />
      <div className="ustp-page-header">
        <div>
          <h2 className="ustp-page-title">Courses</h2>
          <p className="ustp-page-subtitle">Manage academic course offerings</p>
        </div>
        <button
          className={isFormVisible ? 'btn-ghost' : 'btn-gold'}
          onClick={() => { setIsFormVisible(!isFormVisible); if (isFormVisible) handleCancel(); }}
        >
          {isFormVisible ? '✕ Close Form' : '+ Add Course'}
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
          <div className="ustp-form-title">{selectedCourse ? 'Edit Course' : 'New Course'}</div>
          <form onSubmit={selectedCourse ? handleUpdate : handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Course Name *</label>
                <input className="form-input" type="text" name="course_name" value={formData.course_name} onChange={handleInputChange} required placeholder="e.g. Data Structures" />
              </div>
              <div className="form-group">
                <label className="form-label">Units *</label>
                <input className="form-input" type="number" name="units" value={formData.units} onChange={handleInputChange} required min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Teacher *</label>
                <select className="form-select" name="teacher" value={formData.teacher} onChange={handleInputChange} required>
                  <option value={0}>— Select teacher —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.teacher_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{selectedCourse ? '✓ Update' : '+ Create'}</button>
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
                <th>Course Name</th>
                <th>Units</th>
                <th>Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td><span className="id-badge">#{course.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{course.course_name}</td>
                  <td>
                    <span style={{ background: 'rgba(26,58,107,0.08)', color: 'var(--navy)', padding: '2px 10px', borderRadius: 4, fontSize: 13, fontWeight: 500 }}>
                      {course.units} units
                    </span>
                  </td>
                  <td style={{ color: 'var(--gray-600)' }}>{getTeacherName(course.teacher)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table-edit" onClick={() => handleEdit(course.id)}>Edit</button>
                      <button className="btn-table-delete" onClick={() => handleDelete(course.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length === 0 && (
            <div className="ustp-empty">
              <div className="ustp-empty-icon">📚</div>
              <div className="ustp-empty-text">No courses found. Add one to get started.</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CourseList;