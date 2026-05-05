import React, { useState, useEffect } from 'react';
import {
  Section, Course, Enrollment, Student,
  getSections, getSectionById, createSection, updateSection, deleteSection,
  getCourses, getEnrollments, getStudents,
  CreateSectionRequest, UpdateSectionRequest,
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
  const [formData, setFormData] = useState<CreateSectionRequest>({ course: 0, name: '', max_capacity: 30 });

  const fetchSections = async () => {
    setLoading(true); setError(null);
    try { setSections(await getSections()); }
    catch (err: any) { setError(err.message || 'Failed to fetch sections'); }
    finally { setLoading(false); }
  };
  const fetchCourses = async () => { try { setCourses(await getCourses()); } catch {} };
  const fetchStudents = async () => { try { setStudents(await getStudents()); } catch {} };

  useEffect(() => { fetchSections(); fetchCourses(); fetchStudents(); }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'max_capacity' || name === 'course' ? parseInt(value) || 0 : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSection) { await updateSection(selectedSection.id, formData); }
      else { await createSection(formData); }
      await fetchSections();
      setIsFormVisible(false);
      setSelectedSection(null);
      setFormData({ course: 0, name: '', max_capacity: 30 });
    } catch (err: any) { setError(err.message || 'Failed to save section'); }
  };

  const handleEdit = (section: Section) => {
    setSelectedSection(section);
    setFormData({ course: section.course, name: section.name, max_capacity: section.max_capacity });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try { await deleteSection(id); await fetchSections(); }
      catch (err: any) { setError(err.message || 'Failed to delete section'); }
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setSelectedSection(null);
    setFormData({ course: 0, name: '', max_capacity: 30 });
  };

  const getCourseName = (courseId: number) => courses.find(c => c.id === courseId)?.course_name || 'Unknown Course';
  const getStudentName = (studentId: number) => {
    const s = students.find(s => s.id === studentId);
    return s ? `${s.first_name} ${s.last_name}` : 'Unknown Student';
  };

  const showSectionEnrollments = async (section: Section) => {
    try {
      const enrollments = await getEnrollments();
      setSectionEnrollments(enrollments.filter(e => e.section === section.id));
      setSelectedSectionForView(section);
      setIsSectionModalVisible(true);
    } catch (err: any) { setError(err.message || 'Failed to fetch enrollments'); }
  };

  return (
    <>
      <div className="gold-strip" />
      <div className="ustp-page-header">
        <div>
          <h2 className="ustp-page-title">Sections</h2>
          <p className="ustp-page-subtitle">Manage class sections and capacity</p>
        </div>
        <button
          className={isFormVisible ? 'btn-ghost' : 'btn-gold'}
          onClick={() => { setIsFormVisible(!isFormVisible); if (isFormVisible) handleCancel(); }}
        >
          {isFormVisible ? '✕ Close Form' : '+ Add Section'}
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
          <div className="ustp-form-title">{selectedSection ? 'Edit Section' : 'New Section'}</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Course *</label>
                <select className="form-select" name="course" value={formData.course} onChange={handleInputChange} required>
                  <option value={0}>— Select course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Section Name *</label>
                <input className="form-input" type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. A, B, 1A" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Capacity *</label>
                <input className="form-input" type="number" name="max_capacity" value={formData.max_capacity} onChange={handleInputChange} min="1" required />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{selectedSection ? '✓ Update' : '+ Create'}</button>
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
                <th>Course</th>
                <th>Section</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(section => (
                <tr key={section.id}>
                  <td style={{ fontWeight: 500 }}>{getCourseName(section.course)}</td>
                  <td>{section.name}</td>
                  <td>{section.max_capacity}</td>
                  <td>
                    <span className={`badge ${section.is_full ? 'badge-full' : 'badge-available'}`}>
                      {section.is_full ? '● Full' : '● Available'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table-view" onClick={() => showSectionEnrollments(section)}>View Enrolled</button>
                      <button className="btn-table-edit" onClick={() => handleEdit(section)}>Edit</button>
                      <button className="btn-table-delete" onClick={() => handleDelete(section.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sections.length === 0 && (
            <div className="ustp-empty">
              <div className="ustp-empty-icon">🏫</div>
              <div className="ustp-empty-text">No sections found. Create one to get started.</div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isSectionModalVisible && selectedSectionForView && (
        <div className="ustp-modal-overlay" onClick={() => setIsSectionModalVisible(false)}>
          <div className="ustp-modal" onClick={e => e.stopPropagation()}>
            <div className="ustp-modal-header">
              <span className="ustp-modal-title">Enrolled — {selectedSectionForView.name}</span>
              <button className="modal-close-btn" onClick={() => setIsSectionModalVisible(false)}>×</button>
            </div>
            <div className="ustp-modal-body">
              {sectionEnrollments.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px 0' }}>No students currently enrolled in this section.</p>
              ) : (
                sectionEnrollments.map(enroll => (
                  <div key={enroll.id} className="enrolled-item">
                    <div className="enrolled-name">{getStudentName(enroll.student)}</div>
                    <div className="enrolled-date">Enrolled: {new Date(enroll.date_enrolled).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SectionList;