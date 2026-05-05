import React, { useState, useEffect } from 'react';
import {
  Student, Section, Course, Enrollment,
  getStudents, getSections, getCourses, getEnrollments, bulkEnrollStudent,
} from '../api';

const BulkEnrollmentForm: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number>(-1);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [unitLimit, setUnitLimit] = useState<number>(21);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, sec, c, e] = await Promise.all([getStudents(), getSections(), getCourses(), getEnrollments()]);
        setStudents(s); setSections(sec); setCourses(c); setEnrollments(e);
        setLoading(false);
      } catch (err: any) { setError(err.message || 'Failed to load data'); setLoading(false); }
    };
    fetchData();
  }, []);

  const getCourseById = (id: number) => courses.find(c => c.id === id);
  const getSectionDetails = (section: Section) => {
    const course = getCourseById(section.course);
    return { name: `${course?.course_name || 'Unknown'} — ${section.name}`, units: course?.units || 0 };
  };

  const getTotalSelectedUnits = () =>
    selectedSections.reduce((total, sid) => {
      const sec = sections.find(s => s.id === sid);
      return total + (sec ? (getCourseById(sec.course)?.units || 0) : 0);
    }, 0);

  const getStudentCurrentUnits = () => {
    if (selectedStudent === -1) return 0;
    return enrollments.filter(e => e.student === selectedStudent).reduce((total, e) => {
      const sec = sections.find(s => s.id === e.section);
      return total + (sec ? (getCourseById(sec.course)?.units || 0) : 0);
    }, 0);
  };

  const getProjectedUnits = () => getStudentCurrentUnits() + getTotalSelectedUnits();

  const handleSectionToggle = (sectionId: number) => {
    const isSelected = selectedSections.includes(sectionId);
    const newSelected = isSelected ? selectedSections.filter(id => id !== sectionId) : [...selectedSections, sectionId];
    const newProjected = getStudentCurrentUnits() + newSelected.reduce((total, sid) => {
      const sec = sections.find(s => s.id === sid);
      return total + (sec ? (getCourseById(sec.course)?.units || 0) : 0);
    }, 0);
    if (newProjected > unitLimit) {
      setMessageType('warning');
      setStatusMessage(`Cannot exceed unit limit! Adding this would bring total to ${newProjected} units (max: ${unitLimit}).`);
      return;
    }
    setMessageType(''); setStatusMessage('');
    setSelectedSections(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent === -1 || selectedSections.length === 0) {
      setMessageType('error'); setStatusMessage('Please select a student and at least one section.'); return;
    }
    if (getProjectedUnits() > unitLimit) {
      setMessageType('error'); setStatusMessage(`Total units (${getProjectedUnits()}) exceeds the limit of ${unitLimit}.`); return;
    }
    try {
      const result = await bulkEnrollStudent(selectedStudent, selectedSections);
      if (result.failed_enrollments?.length > 0) {
        const errorDetails = result.failed_enrollments.map((err: any) => {
          const sec = sections.find(s => s.id === err.section);
          const course = sec ? getCourseById(sec.course) : null;
          const sectionName = course ? `${course.course_name} — ${sec?.name}` : `Section ${err.section}`;
          const errorMsg = Array.isArray(err.error) ? err.error.join('; ') : typeof err.error === 'object' ? String(Object.values(err.error)[0]) : String(err.error);
          return `${sectionName}: ${errorMsg}`;
        }).join('\n');
        setMessageType('warning');
        setStatusMessage(`Enrolled: ${result.successfully_enrolled?.length || 0} course(s)\nFailed: ${result.failed_enrollments.length} course(s)\n\n${errorDetails}`);
      } else {
        setMessageType('success');
        setStatusMessage('Student has been enrolled in all selected courses.');
        setSelectedSections([]);
        setSelectedStudent(-1);
        const updated = await getEnrollments();
        setEnrollments(updated);
      }
    } catch (err: any) {
      setMessageType('error');
      setStatusMessage(err.response?.data?.error || err.message || 'An error occurred while enrolling.');
    }
  };

  if (loading) return <div className="ustp-spinner"><div className="spinner-ring" /></div>;
  if (error) return <div className="ustp-alert ustp-alert-error" style={{ margin: 28 }}><span>⚠</span> {error}</div>;

  const currentUnits = getStudentCurrentUnits();
  const selectedUnits = getTotalSelectedUnits();
  const projectedUnits = getProjectedUnits();
  const isOverLimit = projectedUnits > unitLimit;

  return (
    <>
      <div className="gold-strip" />
      <div className="ustp-page-header">
        <div>
          <h2 className="ustp-page-title">Bulk Enrollment</h2>
          <p className="ustp-page-subtitle">Enroll a student in multiple courses at once</p>
        </div>
      </div>

      <div style={{ padding: '0 28px 28px' }}>
        <form onSubmit={handleSubmit}>
          {/* Student Selection */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select
                className="form-select"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(Number(e.target.value));
                  setStatusMessage(''); setMessageType('');
                }}
                required
              >
                <option value={-1}>— Choose a student —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} (ID: {s.id})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Limit */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Unit Limit</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={unitLimit}
                onChange={(e) => setUnitLimit(Math.max(1, Number(e.target.value)))}
                style={{ maxWidth: 180 }}
              />
            </div>
          </div>

          {/* Unit Tracker */}
          {selectedStudent !== -1 && (
            <div className="unit-tracker" style={{ marginBottom: 20 }}>
              <div className="unit-cell">
                <div className="unit-label">Current Units</div>
                <div className="unit-value">{currentUnits}</div>
              </div>
              <div className="unit-cell">
                <div className="unit-label">Selected Units</div>
                <div className="unit-value">{selectedUnits}</div>
              </div>
              <div className="unit-cell">
                <div className="unit-label">Total / Limit</div>
                <div className={`unit-value ${isOverLimit ? 'over' : ''}`}>{projectedUnits} / {unitLimit}</div>
              </div>
            </div>
          )}

          {/* Section checkboxes */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>Select Sections to Enroll In</label>
            <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 12, background: 'var(--gray-50)' }}>
              {sections.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No sections available.</p>
              ) : sections.map(section => {
                const details = getSectionDetails(section);
                const isSelected = selectedSections.includes(section.id);
                return (
                  <label
                    key={section.id}
                    className={`section-checkbox-item ${isSelected ? 'selected' : ''} ${section.is_full ? 'full' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSectionToggle(section.id)}
                      disabled={section.is_full}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="section-course-name">{details.name}</div>
                      <div className="section-units">{details.units} units{section.is_full ? ' · FULL' : ''}</div>
                    </div>
                    {isSelected && <span style={{ color: 'var(--navy)', fontWeight: 600, fontSize: 13 }}>✓</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              type="submit"
              className="btn-gold"
              disabled={selectedStudent === -1 || selectedSections.length === 0 || isOverLimit}
              style={{ opacity: (selectedStudent === -1 || selectedSections.length === 0 || isOverLimit) ? 0.5 : 1 }}
            >
              ⚡ Enroll in Selected Sections
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { setSelectedSections([]); setStatusMessage(''); setMessageType(''); }}
            >
              Clear Selection
            </button>
          </div>

          {/* Status */}
          {statusMessage && (
            <div className={`ustp-alert ustp-alert-${messageType || 'info'}`} style={{ whiteSpace: 'pre-line' }}>
              <span>{messageType === 'success' ? '✓' : messageType === 'warning' ? '⚠' : '✕'}</span>
              <div>{statusMessage}</div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default BulkEnrollmentForm;