import { useState, useEffect } from 'react';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';

// 1. Updated Interfaces to match Django Models
interface Section {
  id: number;
  name: string;
  capacity: number;
  term: number;
  course: number;
}

// Interfaces for relational data dropdowns
interface Term { id: number; name: string; }
interface Course { id: number; code: string; name: string; }
interface Subject { id: number; code: string; title?: string; name?: string; units?: number }
interface ClassOffering { id: number; subject: number; subject_title?: string; subject_code?: string; subject_units?: number; section: number; days: string; start_time: string; end_time: string; room?: string; instructor?: number | null; instructor_name?: string }
interface Student { id: number; first_name: string; last_name: string; email: string; section?: number | null; enrollment_status: string; }

export default function SectionsManager() {
  const [sections, setSections] = useState<Section[]>([]);
  // subjects catalog is not used directly here; section curriculum comes from offerings
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offerings, setOfferings] = useState<ClassOffering[]>([]);
  const [selectedSectionForSubjects, setSelectedSectionForSubjects] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [selectedSectionForRoster, setSelectedSectionForRoster] = useState<Section | null>(null);
  
  // States for the foreign key dropdowns
  const [terms, setTerms] = useState<Term[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); 
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  // 2. Updated formData to match Django exact column names
  const [formData, setFormData] = useState({ 
    name: '', 
    capacity: 40, 
    term: '' as number | '', 
    course: '' as number | '' 
  });

  useEffect(() => {
    fetchSections();
    fetchOfferings();
    fetchSubjects();
    fetchStudents();
    fetchDependencies();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('sections/');
      setSections(response.data);
    } catch (error) {
      console.error("Failed to fetch sections", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('subjects/');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };



  const fetchOfferings = async () => {
    try {
      const response = await api.get('offerings/');
      setOfferings(response.data);
    } catch (error) {
      console.error('Failed to fetch offerings', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('students/');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  // Fetch data for dropdowns (fails gracefully if endpoints aren't built yet)
  const fetchDependencies = async () => {
    try {
      api.get('terms/').then(res => setTerms(res.data)).catch(() => console.warn("Terms API not ready"));
      api.get('courses/').then(res => setCourses(res.data)).catch(() => console.warn("Courses API not ready"));
    } catch (error) {
      console.error("Dependency fetch error", error);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', capacity: 40, term: '', course: '' });
    setModalOpen(true);
  };

  const handleEdit = (sec: Section) => {
    setEditingId(sec.id);
    setFormData({ 
      name: sec.name, 
      capacity: sec.capacity, 
      term: sec.term, 
      course: sec.course
    });
    setModalOpen(true);
  };

  const toggleSectionExpansion = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSave = async () => {
    try {
      // Clean up empty strings to null for optional foreign keys before sending
      const payload = {
        ...formData
      };

      if (editingId) {
        await api.patch(`sections/${editingId}/`, payload);
      } else {
        await api.post('sections/', payload);
      }
      
      setModalOpen(false);
      setFormData({ name: '', capacity: 40, term: '', course: '' });
      setEditingId(null);
      fetchSections();

    } catch (error) {
      console.error("Error saving section", error);
      alert("Failed to save the section. Check console for 400 validation errors.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`sections/${id}/`);
      setConfirmDeleteId(null);
      fetchSections();
    } catch (error) {
      console.error("Error deleting section", error);
    }
  };

  // Helper function to find course name for the display cards
  const getCourseName = (courseId: number) => {
    const c = courses.find(x => x.id === courseId);
    return c ? `${c.code} - ${c.name}` : `Course ID: ${courseId}`;
  };

  return (
    <div>
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
          <Modal title="Confirm Deletion" onClose={() => setConfirmDeleteId(null)} footer={
              <>
                  <button className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  <button className="px-4 py-2 text-[13px] font-semibold bg-red-600 text-white rounded-lg transition-colors" onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
              </>
          }>
              <p className="text-gray-600 text-sm">Permanently delete this section? This action cannot be reversed.</p>
          </Modal>
      )}

      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
        <h2 className="text-2xl font-bold text-ustpDarkBlue">Section Management</h2>
        <button 
          onClick={handleOpenNew}
          className="bg-ustpBlue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-[13px] transition-colors flex items-center gap-2"
        >
          <Icon name="plus" size={14} />
          New Section
        </button>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500 text-sm">
            No sections found. Create one to get started.
          </div>
        ) : (
          sections.map(sec => {
            const sectionStudents = students.filter(stud => stud.section === sec.id);
            const enrolledCount = sectionStudents.length;
            const capacityPct = sec.capacity > 0 ? Math.round((enrolledCount / sec.capacity) * 100) : 0;
            const sectionOfferings = offerings.filter(o => o.section === sec.id);
            const totalUnits = sectionOfferings.reduce((sum, off) => sum + (off.subject_units || 0), 0);
            const isExpanded = expandedSections.includes(sec.id);

            return (
              <div key={sec.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
                <div className="h-1 bg-gradient-to-r from-ustpBlue to-ustpGold rounded-t-2xl -mx-5 -mt-5 mb-4" />
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-extrabold text-[15px] text-ustpDarkBlue">{sec.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{getCourseName(sec.course)}</div>
                  </div>
                  <span className="bg-blue-50 text-ustpBlue text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Term {sec.term}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-[15px] text-ustpBlue">{enrolledCount}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Students Enrolled</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-[15px] text-ustpBlue">{sec.capacity}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Total Slots</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                    <span>Capacity</span>
                    <span>{capacityPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        capacityPct > 85 ? 'bg-red-500' : capacityPct > 65 ? 'bg-ustpGold' : 'bg-ustpBlue'
                      }`} 
                      style={{ width: `${capacityPct}%` }} 
                    />
                  </div>
                </div>

                <div className="mb-4 rounded-2xl border border-gray-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="text-sm font-semibold text-ustpDarkBlue">Section Overview</div>
                      <div className="text-[11px] text-gray-500">{sectionOfferings.length} subject{sectionOfferings.length === 1 ? '' : 's'} · {totalUnits} unit{totalUnits === 1 ? '' : 's'} · {enrolledCount} / {sec.capacity} students</div>
                    </div>
                    <button 
                      onClick={() => toggleSectionExpansion(sec.id)}
                      className="text-[12px] font-semibold text-ustpBlue hover:text-blue-700"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 pt-2">
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-800">Curriculum</div>
                            <div className="text-[11px] text-gray-500">{sectionOfferings.length} subject{sectionOfferings.length === 1 ? '' : 's'} · {totalUnits} unit{totalUnits === 1 ? '' : 's'}</div>
                          </div>
                        </div>
                        {sectionOfferings.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">No subjects assigned to this section yet.</div>
                        ) : (
                          <div className="space-y-3">
                            {sectionOfferings.map(off => (
                              <div key={off.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="font-semibold text-gray-800">{off.subject_title || off.subject_code || `Subject ${off.subject}`}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">{off.days} · {off.start_time}–{off.end_time}</div>
                                  </div>
                                  <div className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                                    {off.subject_units || 0} unit{(off.subject_units || 0) === 1 ? '' : 's'}
                                  </div>
                                </div>
                                <div className="mt-3 text-[11px] text-gray-500">
                                  Room: <span className="font-semibold text-gray-700">{off.room || 'TBA'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setSelectedSectionForRoster(sec)}
                    className="flex-1 min-w-[140px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-ustpBlue py-2 rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="users" size={14} /> View Roster
                  </button>
                  <button
                    onClick={() => setSelectedSectionForSubjects(sec)}
                    className="flex-1 min-w-[140px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-ustpBlue py-2 rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="book" size={14} /> View Subjects
                  </button>
                  <button 
                    onClick={() => handleEdit(sec)} 
                    className="flex-1 min-w-[120px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-ustpBlue py-2 rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Icon name="edit" size={12} /> Edit
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(sec.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Roster Modal */}
      {selectedSectionForRoster && (
        <Modal
          maxWidth="max-w-[600px]"
          title={`Roster — ${selectedSectionForRoster.name}`}
          onClose={() => setSelectedSectionForRoster(null)}
          footer={
            <button
              onClick={() => setSelectedSectionForRoster(null)}
              className="px-4 py-2 bg-ustpBlue text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">{students.filter(stud => stud.section === selectedSectionForRoster.id).length} student{students.filter(stud => stud.section === selectedSectionForRoster.id).length === 1 ? '' : 's'} enrolled</div>
            <div className="rounded-2xl border border-gray-200 bg-white max-h-[60vh] overflow-y-auto p-3">
              {students.filter(stud => stud.section === selectedSectionForRoster.id).length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">No students enrolled in this block section.</div>
              ) : (
                <div className="space-y-3">
                  {students.filter(stud => stud.section === selectedSectionForRoster.id).map(student => {
                    const initials = `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase();
                    return (
                      <div key={student.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <Avatar init={initials} size={36} />
                          <div>
                            <div className="font-semibold text-gray-800">{student.first_name} {student.last_name}</div>
                            <div className="text-[11px] text-gray-500">{student.email}</div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                          student.enrollment_status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-700' :
                          student.enrollment_status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                          student.enrollment_status === 'ASSESSED' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {student.enrollment_status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Subjects / Schedule Modal */}
      {selectedSectionForSubjects && (
        <Modal
          maxWidth="max-w-[800px]"
          title={`Schedule — ${selectedSectionForSubjects.name}`}
          onClose={() => setSelectedSectionForSubjects(null)}
          footer={
            <div className="w-full flex items-center justify-between">
              <div className="text-sm text-gray-600">Total Units: <span className="font-semibold text-gray-800">{
                (() => {
                  const sectionOfferings = offerings.filter(o => o.section === selectedSectionForSubjects.id);
                  const total = sectionOfferings.reduce((sum, off) => sum + (off.subject_units ?? (subjects.find(s => s.id === off.subject)?.units ?? 0)), 0);
                  return total;
                })()
              }</span></div>
              <button
                onClick={() => setSelectedSectionForSubjects(null)}
                className="px-4 py-2 bg-ustpBlue text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Subjects assigned to {selectedSectionForSubjects.name}</div>
            <div className="rounded-2xl border border-gray-200 bg-white max-h-[60vh] overflow-y-auto p-3">
              {offerings.filter(o => o.section === selectedSectionForSubjects.id).length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">No offerings assigned to this section.</div>
              ) : (
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="text-[12px] text-gray-500 border-b">
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Days</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Room</th>
                      <th className="px-3 py-2">Instructor</th>
                      <th className="px-3 py-2 text-right">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerings.filter(o => o.section === selectedSectionForSubjects.id).map(off => {
                      const subj = subjects.find(s => s.id === off.subject);
                      const code = off.subject_code || subj?.code || `ID ${off.subject}`;
                      const title = off.subject_title || subj?.title || subj?.name || 'Untitled Subject';
                      const units = off.subject_units ?? subj?.units ?? 0;
                      const instructor = off.instructor_name || (off as any).instructor_name || 'TBA';
                      return (
                        <tr key={off.id} className="align-top border-b last:border-b-0">
                          <td className="px-3 py-3 text-sm text-gray-700">{code}</td>
                          <td className="px-3 py-3 text-sm text-gray-800">{title}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{off.days}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{off.start_time}–{off.end_time}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{off.room || 'TBA'}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{instructor}</td>
                          <td className="px-3 py-3 text-sm text-right text-gray-700 font-semibold">{units}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Creation/Edit Modal */}
      {modalOpen && (
        <Modal 
          title={editingId ? "Edit Section" : "Create New Section"} 
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-[13px] font-semibold bg-ustpBlue text-white hover:bg-blue-700 rounded-lg transition-colors">
                {editingId ? "Save Changes" : "Save Section"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Section Name</label>
              <input type="text" placeholder="e.g. BSIT-1A" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Course</label>
                <select value={formData.course} onChange={e => setFormData({...formData, course: parseInt(e.target.value) || ''})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10 bg-white">
                  <option value="">Select Course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Term</label>
                <select value={formData.term} onChange={e => setFormData({...formData, term: parseInt(e.target.value) || ''})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10 bg-white">
                  <option value="">Select Term...</option>
                  {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Capacity (Total Slots)</label>
                <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}