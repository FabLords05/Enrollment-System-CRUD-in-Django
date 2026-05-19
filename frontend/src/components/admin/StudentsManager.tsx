import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';

interface Student {
    id: number | null;
    email: string;
    first_name: string; 
    last_name: string;
    middle_initial?: string;
    suffix?: string;
    birth_date?: string;
    address?: string;
    phone?: string;
    section?: number | null;
    program_enrolled?: number | null;
    enrollment_status: 'ADVISING' | 'ASSESSED' | 'PAID' | 'ENROLLED'; 
}

interface Section {
    id: number;
    name: string; 
}

interface ClassOffering {
    id: number;
    subject: number;
    subject_title: string;
    subject_code: string;
    subject_units: number;
    section: number;
    section_name: string;
    instructor: number | null;
    instructor_name?: string;
    days: string;
    start_time: string;
    end_time: string;
    room: string;
}

export default function StudentsManager() {
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [courses, setCourses] = useState<{id:number; code:string; name:string;}[]>([]);
    const [offerings, setOfferings] = useState<ClassOffering[]>([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const [form, setForm] = useState<Partial<Student>>({});
    const [password, setPassword] = useState(''); 

    useEffect(() => {
        fetchStudents();
        fetchSections();
        fetchOfferings();
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('students/');
            setStudents(response.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const fetchSections = async () => {
        try {
            const response = await api.get('sections/');
            setSections(response.data);
        } catch (err) {
            console.error("Failed to fetch sections", err);
        }
    };

    const fetchOfferings = async () => {
        try {
            const response = await api.get('offerings/');
            setOfferings(response.data);
        } catch (err) {
            console.error("Failed to fetch offerings", err);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('courses/');
            setCourses(response.data);
        } catch (err) {
            console.error('Failed to fetch courses', err);
        }
    };

    const openNew = () => {
        setForm({ id: null, email: '', first_name: '', last_name: '', enrollment_status: 'ADVISING', program_enrolled: null });
        setPassword('');
        setModalOpen(true);
    };

    const openEdit = (student: Student) => {
        setForm({ ...student });
        setModalOpen(true);
    };

    const saveStudent = async () => {
        if (!form.first_name || !form.last_name || !form.email) {
            alert("First Name, Last Name, and Email are required fields.");
            return; 
        }

        try {
            if (form.id) {
                await api.patch(`students/${form.id}/`, form);
            } else {
                await api.post('students/', { ...form, password: password || 'student123' });
            }
            
            setModalOpen(false);
            fetchStudents();

        } catch (error) {
            console.error("Error saving student", error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Backend Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("An error occurred while saving the student.");
            }
        }
    };

    const deleteStudent = async (id: number) => {
        try {
            await api.delete(`students/${id}/`);
            setConfirmDeleteId(null);
            fetchStudents();
        } catch (err) {
            console.error("Error deleting student", err);
        }
    };

    const filteredStudents = students.filter(s => 
        `${s.first_name || ''} ${s.last_name || ''} ${s.email || ''}`.toLowerCase().includes(search.toLowerCase())
    );

    const assignedOfferings = form.section 
        ? offerings.filter(off => off.section === form.section)
        : [];
    const totalUnits = assignedOfferings.reduce((sum, off) => sum + (off.subject_units || 0), 0);

    return (
        <>
            {confirmDeleteId && (
                <Modal title="Confirm Deletion" onClose={() => setConfirmDeleteId(null)} footer={
                    <>
                        <button className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-gray-50 transition" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md font-medium text-sm hover:bg-red-700 transition" onClick={() => deleteStudent(confirmDeleteId)}>Delete</button>
                    </>
                }>
                    <p className="text-gray-600 text-sm">Permanently delete this student record? This action cannot be reversed.</p>
                </Modal>
            )}

            {modalOpen && (
                <Modal 
                    maxWidth="max-w-[1000px]"  // 🟢 ADD THIS LINE HERE!
                    title={form.id ? 'Student Academic Record' : 'Register New Student'} 
                    onClose={() => setModalOpen(false)} 
                    footer={
                        <>
                            <button className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-gray-50 transition" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition" onClick={saveStudent}>Save Changes</button>
                        </>
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-[900px]">
                        
                        {/* LEFT COLUMN: Editing Form */}
                        <div className="space-y-4">
                            <h3 className="text-[13px] font-extrabold text-gray-400 uppercase tracking-wider border-b pb-2">Profile & Status</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">FIRST NAME</label>
                                    <input className="w-full border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-blue-500" value={form.first_name || ''} onChange={e => setForm({...form, first_name: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">LAST NAME</label>
                                    <input className="w-full border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-blue-500" value={form.last_name || ''} onChange={e => setForm({...form, last_name: e.target.value})}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">EMAIL ADDRESS</label>
                                <input className="w-full border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-blue-500" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}/>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">ENROLLMENT STATUS</label>
                                <select 
                                    className="w-full border border-gray-200 p-2 rounded-md bg-white text-sm outline-none focus:border-blue-500 font-bold" 
                                    value={form.enrollment_status || 'ADVISING'} 
                                    onChange={e => setForm({...form, enrollment_status: e.target.value as any})}
                                >
                                    <option value="ADVISING">Advising (Pending)</option>
                                    <option value="ASSESSED">Assessed</option>
                                    <option value="PAID">Paid</option>
                                    <option value="ENROLLED">Officially Enrolled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">PROGRAM</label>
                                <select
                                    className="w-full border border-gray-200 p-2 rounded-md bg-white text-sm outline-none focus:border-blue-500"
                                    value={form.program_enrolled || ''}
                                    onChange={e => setForm({...form, program_enrolled: e.target.value ? Number(e.target.value) : null})}
                                >
                                    <option value="">Unassigned</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1 text-blue-600">ASSIGNED BLOCK SECTION</label>
                                <select 
                                    className="w-full border-2 border-blue-100 p-2 rounded-md bg-blue-50/50 text-sm outline-none focus:border-blue-500 font-bold text-blue-800" 
                                    value={form.section || ''} 
                                    onChange={e => setForm({...form, section: e.target.value ? Number(e.target.value) : null})}
                                >
                                    <option value="">Unassigned</option>
                                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                                </select>
                            </div>
                            {!form.id && (
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">TEMPORARY PASSWORD</label>
                                    <input className="w-full border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-blue-500" type="password" placeholder="Defaults to 'student123'" value={password} onChange={e => setPassword(e.target.value)}/>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Live Subjects Preview */}
                        <div>
                            <h3 className="text-[13px] font-extrabold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Block Curriculum</h3>
                            {form.section ? (
                                assignedOfferings.length > 0 ? (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                        <table className="w-full text-left text-[12px]">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="p-3 font-bold text-gray-600">Subject</th>
                                                    <th className="p-3 font-bold text-gray-600">Schedule</th>
                                                    <th className="p-3 font-bold text-gray-600 text-center">Units</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignedOfferings.map(off => (
                                                    <tr key={off.id} className="border-b border-gray-50 last:border-0">
                                                        <td className="p-3 font-semibold text-gray-800">{off.subject_title || off.subject_code}</td>
                                                        <td className="p-3 text-gray-500">{off.days} {off.start_time} - {off.end_time}</td>
                                                        <td className="p-3 text-center font-bold text-blue-600">{off.subject_units}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase">Total Term Load</span>
                                            <span className="text-sm font-black text-blue-700">{totalUnits} Units</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-xs font-semibold text-gray-400">
                                        No subjects scheduled for this block.
                                    </div>
                                )
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-blue-100 rounded-xl bg-blue-50/30 text-center p-6">
                                    <Icon name="grid" size={24} className="text-blue-300 mb-2"/>
                                    <p className="text-xs font-semibold text-blue-600">No Section Assigned</p>
                                    <p className="text-[11px] text-blue-400 mt-1">Select a Block Section on the left to instantly preview the student's curriculum.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            <div className="flex gap-4 mb-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <span className="absolute left-3 top-2.5 text-gray-400"><Icon name="search" size={14}/></span>
                    <input className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white outline-none text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm" onClick={openNew}>
                    <Icon name="plus" size={14}/> Add Student
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="overflow-y-auto overflow-x-hidden max-h-[65vh]">
                    <table className="w-full text-left border-collapse table-auto">
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                            <tr className="text-gray-500 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200">
                                <th className="p-4">Student</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Section</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(s => {
                                const currentSec = sections.find(x => x.id === s.section);
                                const program = courses.find(c => c.id === s.program_enrolled);
                                const initials = `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}` || '?';
                                
                                return (
                                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition" onClick={() => openEdit(s)}>
                                        <td className="p-4 flex items-center gap-3">
                                            <Avatar init={initials} size={36}/>
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-800 text-sm truncate">{s.last_name || 'N/A'}, {s.first_name || 'N/A'}</div>
                                                <div className="text-[11px] text-gray-400 font-medium">ID: {s.id}{program ? ` · ${program.code}` : ''}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium break-all">{s.email}</td>
                                        <td className="p-4">
                                            {currentSec ? <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-bold border border-blue-100 whitespace-normal">{currentSec.name}</span> : <span className="text-gray-400 text-xs font-semibold italic">Unassigned</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide ${
                                                s.enrollment_status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-700' : 
                                                s.enrollment_status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                s.enrollment_status === 'ASSESSED' ? 'bg-purple-100 text-purple-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {s.enrollment_status || 'ADVISING'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-500 shadow-sm transition" onClick={(e) => { e.stopPropagation(); openEdit(s); }}><Icon name="edit" size={14}/></button>
                                            <button className="p-2 border border-red-100 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white shadow-sm transition" onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id!); }}><Icon name="trash" size={14}/></button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-400 font-medium text-sm">
                                        No students found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}