import React, { useState, useEffect } from 'react';
import {
  Enrollment, Student, Course, Section,
  getEnrollments, getEnrollmentById, createEnrollment, updateEnrollment, deleteEnrollment,
  getStudents, getCourses, getSections,
  CreateEnrollmentRequest, UpdateEnrollmentRequest,
} from '../api';

const MAX_UNITS = 21;

export const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<{ student: number; course: number }>({ student: 0, course: 0 });

  const fetchEnrollments = async () => {
    setLoading(true); setError(null);
    try { setEnrollments(await getEnrollments()); }
    catch (err: any) { setError(err.message || 'Failed to fetch enrollments'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    fetchEnrollments();
    getStudents().then(setStudents).catch(() => {});
    getCourses().then(setCourses).catch(() => {});
    getSections().then(setSections).catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) || 0 });
  };

  const getStudentTotalUnits = (studentId: number) =>
    enrollments.filter(e => e.student === studentId).reduce((sum, e) => {
      const sec = sections.find(s => s.id === e.section);
      if (!sec) return sum;
      const course = courses.find(c => c.id === sec.course);
      return sum + (course?.units || 0);
    }, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const availableSections = sections.filter(s => s.course === formData.course && !s.is_full);
    if (availableSections.length === 0) { setError('No available sections for this course.'); return; }
    const selectedCourse = courses.find(c => c.id === formData.course);
    if (!selectedCourse) { setError('Please choose a valid course.'); return; }
    const projected = getStudentTotalUnits(formData.student) + selectedCourse.units;
    if (projected > MAX_UNITS) { setError(`Unit limit exceeded: ${projected} / ${MAX_UNITS}.`); return; }
    try {
      await createEnrollment({ student: formData.student, section: availableSections[0].id });
      setFormData({ student: 0, course: 0 });
      setIsFormVisible(false);
      fetchEnrollments();
      getSections().then(setSections);
      setError(null);
    } catch (err: any) { setError(err.message || 'Failed to create enrollment'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;
    const availableSections = sections.filter(s => s.course === formData.course && !s.is_full);
    if (availableSections.length === 0) { setError('No available sections for this course.'); return; }
    const selectedCourse = courses.find(c => c.id === formData.course);
    if (!selectedCourse) { setError('Please choose a valid course.'); return; }
    const studentId = formData.student || selectedEnrollment.student;
    const oldUnits = courses.find(c => c.id === sections.find(s => s.id === selectedEnrollment.section)?.course)?.units || 0;
    const projected = getStudentTotalUnits(studentId) - oldUnits + selectedCourse.units;
    if (projected > MAX_UNITS) { setError(`Unit limit exceeded: ${projected} / ${MAX_UNITS}.`); return; }
    try {
      await updateEnrollment(selectedEnrollment.id, { student: studentId, section: availableSections[0].id });
      setSelectedEnrollment(null);
      setFormData({ student: 0, course: 0 });
      setIsFormVisible(false);
      fetchEnrollments();
      getSections().then(setSections);
      setError(null);
    } catch (err: any) { setError(err.message || 'Failed to update enrollment'); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try { await deleteEnrollment(id); fetchEnrollments(); }
      catch (err: any) { setError(err.message || 'Failed to delete enrollment'); }
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const enrollment = await getEnrollmentById(id);
      const section = sections.find(s => s.id === enrollment.section);
      setSelectedEnrollment(enrollment);
      setFormData({ student: enrollment.student, course: section?.course || 0 });
      setIsFormVisible(true);
    } catch (err: any) { setError(err.message || 'Failed to fetch enrollment details'); }
  };

  const handleCancel = () => { setSelectedEnrollment(null); setFormData({ student: 0, course: 0 }); setIsFormVisible(false); };

  const getStudentName = (id: number) => { const s = students.find(s => s.id === id); return s ? `${s.first_name} ${s.last_name}` : 'Unknown'; };
  const getSectionName = (id: number) => {
    const sec = sections.find(s => s.id === id);
    if (sec) { const c = courses.find(c => c.id === sec.course); return `${c?.course_name || 'Unknown'} — ${sec.name}`; }
    return 'Unknown';
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  const infoBox = formData.course > 0 && formData.student > 0 ? (() => {
    const available = sections.filter(s => s.course === formData.course && !s.is_full);
    const course = courses.find(c => c.id === formData.course);
    const currentUnits = getStudentTotalUnits(formData.student);
    const projected = currentUnits + (course?.units || 0);
    return { available, course, currentUnits, projected };
  })() : null;

  return (
    <>
      <div className="gold-strip" />
      <div className="ustp-page-header">
        <div>
          <h2 className="ustp-page-title">Enrollments</h2>
          <p className="ustp-page-subtitle">Manage student course enrollments</p>
        </div>
        <button
          className={isFormVisible ? 'btn-ghost' : 'btn-gold'}
          onClick={() => { setIsFormVisible(!isFormVisible); if (isFormVisible) handleCancel(); }}
        >
          {isFormVisible ? '✕ Close Form' : '+ Add Enrollment'}
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
          <div className="ustp-form-title">{selectedEnrollment ? 'Edit Enrollment' : 'New Enrollment'}</div>
          <form onSubmit={selectedEnrollment ? handleUpdate : handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select className="form-select" name="student" value={formData.student} onChange={handleInputChange} required>
                  <option value={0}>— Select student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Course *</label>
                <select className="form-select" name="course" value={formData.course} onChange={handleInputChange} required>
                  <option value={0}>— Select course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
            </div>
            {infoBox && (
              <div className="enroll-info-box" style={{ marginBottom: 16 }}>
                <div className="enroll-info-row">
                  <span className="enroll-info-label">Section assignment:</span>
                  <span className="enroll-info-value">{infoBox.available.length > 0 ? `Section ${infoBox.available[0].name}` : '⚠ No available sections'}</span>
                </div>
                <div className="enroll-info-row">
                  <span className="enroll-info-label">Current units:</span>
                  <span className="enroll-info-value">{infoBox.currentUnits} / {MAX_UNITS}</span>
                </div>
                <div className="enroll-info-row">
                  <span className="enroll-info-label">After enrollment:</span>
                  <span className="enroll-info-value" style={{ color: infoBox.projected > MAX_UNITS ? 'var(--danger)' : 'var(--success)' }}>
                    {infoBox.projected} units
                  </span>
                </div>
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary">{selectedEnrollment ? '✓ Update' : '+ Create'}</button>
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
                <th>Student</th>
                <th>Section</th>
                <th>Date Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id}>
                  <td><span className="id-badge">#{e.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{getStudentName(e.student)}</td>
                  <td style={{ color: 'var(--gray-600)' }}>{getSectionName(e.section)}</td>
                  <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{formatDate(e.date_enrolled)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table-edit" onClick={() => handleEdit(e.id)}>Edit</button>
                      <button className="btn-table-delete" onClick={() => handleDelete(e.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {enrollments.length === 0 && (
            <div className="ustp-empty">
              <div className="ustp-empty-icon">📋</div>
              <div className="ustp-empty-text">No enrollments found. Add one to get started.</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EnrollmentList;