import React, { useState, useEffect } from 'react';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

// 1. Updated Interfaces to match Django Models
interface Section {
  id: number;
  name: string;
  capacity: number;
  term: number;
  course: number;
  room: number | null;
  time_slot: number | null;
  enrolled?: number;
}

// Interfaces for relational data dropdowns
interface Term { id: number; name: string; }
interface Course { id: number; code: string; name: string; }
interface Room { id: number; name: string; }
interface TimeSlot { id: number; day_of_week: string; start_time: string; end_time: string; }

export default function SectionsManager() {
  const [sections, setSections] = useState<Section[]>([]);
  
  // States for the foreign key dropdowns
  const [terms, setTerms] = useState<Term[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); 
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  // 2. Updated formData to match Django exact column names
  const [formData, setFormData] = useState({ 
    name: '', 
    capacity: 40, 
    term: '' as number | '', 
    course: '' as number | '', 
    room: '' as number | '', 
    time_slot: '' as number | '' 
  });

  useEffect(() => {
    fetchSections();
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

  // Fetch data for dropdowns (fails gracefully if endpoints aren't built yet)
  const fetchDependencies = async () => {
    try {
      api.get('terms/').then(res => setTerms(res.data)).catch(() => console.warn("Terms API not ready"));
      api.get('courses/').then(res => setCourses(res.data)).catch(() => console.warn("Courses API not ready"));
      api.get('rooms/').then(res => setRooms(res.data)).catch(() => console.warn("Rooms API not ready"));
      api.get('timeslots/').then(res => setTimeSlots(res.data)).catch(() => console.warn("TimeSlots API not ready"));
    } catch (error) {
      console.error("Dependency fetch error", error);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', capacity: 40, term: '', course: '', room: '', time_slot: '' });
    setModalOpen(true);
  };

  const handleEdit = (sec: Section) => {
    setEditingId(sec.id);
    setFormData({ 
      name: sec.name, 
      capacity: sec.capacity, 
      term: sec.term, 
      course: sec.course, 
      room: sec.room || '', 
      time_slot: sec.time_slot || '' 
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      // Clean up empty strings to null for optional foreign keys before sending
      const payload = {
        ...formData,
        room: formData.room === '' ? null : formData.room,
        time_slot: formData.time_slot === '' ? null : formData.time_slot
      };

      if (editingId) {
        await api.patch(`sections/${editingId}/`, payload);
      } else {
        await api.post('sections/', payload);
      }
      
      setModalOpen(false);
      setFormData({ name: '', capacity: 40, term: '', course: '', room: '', time_slot: '' });
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
            const capacityPct = sec.capacity > 0 ? Math.round(((sec.enrolled || 0) / sec.capacity) * 100) : 0;
            
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

                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                    <div className="font-bold text-[15px] text-ustpBlue">{sec.enrolled || 0}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Enrolled</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
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

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(sec)} 
                    className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-ustpBlue py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
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
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Room (Optional)</label>
                <select value={formData.room} onChange={e => setFormData({...formData, room: parseInt(e.target.value) || ''})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10 bg-white">
                  <option value="">None / TBD</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Time Slot (Optional)</label>
                <select value={formData.time_slot} onChange={e => setFormData({...formData, time_slot: parseInt(e.target.value) || ''})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10 bg-white">
                  <option value="">None / TBD</option>
                  {timeSlots.map(ts => <option key={ts.id} value={ts.id}>{ts.day_of_week} {ts.start_time}-{ts.end_time}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Capacity (Total Slots)</label>
              <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full border-1.5 border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-ustpBlue focus:ring-4 focus:ring-blue-500/10" />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}