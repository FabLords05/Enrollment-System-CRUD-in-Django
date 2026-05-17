import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';

// 1. Updated Interface to match Django EXACTLY
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
    enrollment_status: 'ADVISING' | 'ASSESSED' | 'PAID' | 'ENROLLED'; 
}

interface Section {
    id: number;
    name: string; // Updated from 'nm' to match your new Django models
}

export default function StudentsManager() {
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Form State
    const [form, setForm] = useState<Partial<Student>>({});
    const [password, setPassword] = useState(''); 

    useEffect(() => {
        fetchStudents();
        fetchSections();
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

    const openNew = () => {
        // 2. Initialize with the correct Django status
        setForm({ id: null, email: '', first_name: '', last_name: '', enrollment_status: 'ADVISING' });
        setPassword('');
        setModalOpen(true);
    };

    const openEdit = (student: Student) => {
        setForm(student);
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
                console.error("Django says:", error.response.data);
                alert(`Backend Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("An error occurred while saving the student. Please check the console for details.");
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

    return (
        <>
            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <Modal title="Confirm Deletion" onClose={() => setConfirmDeleteId(null)} footer={
                    <>
                        <button className="px-4 py-2 border rounded-md" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md" onClick={() => deleteStudent(confirmDeleteId)}>Delete</button>
                    </>
                }>
                    <p className="text-gray-600">Permanently delete this student record? This action cannot be reversed.</p>
                </Modal>
            )}

            {/* Main Form Modal */}
            {modalOpen && (
                <Modal title={form.id ? 'Edit Student' : 'Add New Student'} onClose={() => setModalOpen(false)} footer={
                    <>
                        <button className="px-4 py-2 border rounded-md" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button className="px-4 py-2 bg-ustp-blue text-white rounded-md" onClick={saveStudent}>Save</button>
                    </>
                }>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">FIRST NAME</label>
                            <input className="w-full border p-2 rounded-md" value={form.first_name || ''} onChange={e => setForm({...form, first_name: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">LAST NAME</label>
                            <input className="w-full border p-2 rounded-md" value={form.last_name || ''} onChange={e => setForm({...form, last_name: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">M.I.</label>
                            <input className="w-full border p-2 rounded-md" maxLength={1} value={form.middle_initial || ''} onChange={e => setForm({...form, middle_initial: e.target.value})}/>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">EMAIL ADDRESS</label>
                        <input className="w-full border p-2 rounded-md" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">ASSIGNED SECTION</label>
                            <select className="w-full border p-2 rounded-md bg-white" value={form.section || ''} onChange={e => setForm({...form, section: e.target.value ? Number(e.target.value) : null})}>
                                <option value="">None</option>
                                {/* Updated sec.nm to sec.name */}
                                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">ENROLLMENT STATUS</label>
                            {/* 3. Dropdown mapped directly to Django's 4 stages */}
                            <select 
                                className="w-full border p-2 rounded-md bg-white" 
                                value={form.enrollment_status || 'ADVISING'} 
                                onChange={e => setForm({...form, enrollment_status: e.target.value as any})}
                            >
                                <option value="ADVISING">Advising (Pending)</option>
                                <option value="ASSESSED">Assessed</option>
                                <option value="PAID">Paid</option>
                                <option value="ENROLLED">Officially Enrolled</option>
                            </select>
                        </div>
                    </div>
                    {!form.id && (
                        <div className="mb-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">PASSWORD</label>
                            <input className="w-full border p-2 rounded-md" type="password" placeholder="Default Account Password" value={password} onChange={e => setPassword(e.target.value)}/>
                        </div>
                    )}
                </Modal>
            )}

            {/* Layout Wrapper Elements */}
            <div className="flex gap-4 mb-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <span className="absolute left-3 top-3 text-gray-400"><Icon name="search" size={14}/></span>
                    <input className="w-full pl-9 pr-4 py-2 border rounded-md bg-white outline-none" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <button className="flex items-center gap-2 bg-ustp-blue text-white px-4 py-2 rounded-md font-medium" onClick={openNew}>
                    <Icon name="plus" size={14}/> Add Student
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-g200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-g50 text-gray-500 text-xs font-bold border-b border-g200">
                            <th className="p-4">STUDENT</th>
                            <th className="p-4">CONTACT</th>
                            <th className="p-4">SECTION</th>
                            <th className="p-4">STATUS</th>
                            <th className="p-4 text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(s => {
                            const currentSec = sections.find(x => x.id === s.section);
                            const initials = `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}` || '?';
                            
                            return (
                                <tr key={s.id} className="border-b border-g100 hover:bg-g50 transition">
                                    <td className="p-4 flex items-center gap-3">
                                        <Avatar init={initials} size={32}/>
                                        <div>
                                            <div className="font-semibold text-gray-800">{s.last_name || 'N/A'}, {s.first_name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">ID: {s.id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{s.email}</td>
                                    <td className="p-4">
                                        {/* Updated currentSec.nm to currentSec.name */}
                                        {currentSec ? <span className="px-2 py-1 bg-ustp-blue-light text-ustp-blue rounded text-xs font-bold">{currentSec.name}</span> : <span className="text-gray-400 text-xs">Unassigned</span>}
                                    </td>
                                    <td className="p-4">
                                        {/* 4. Table UI updated to reflect the 4 new stages */}
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            s.enrollment_status === 'ENROLLED' ? 'bg-green-100 text-green-700' : 
                                            s.enrollment_status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                            s.enrollment_status === 'ASSESSED' ? 'bg-purple-100 text-purple-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {s.enrollment_status || 'ADVISING'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button className="p-1 border rounded hover:bg-g100 text-gray-600" onClick={() => openEdit(s)}><Icon name="edit" size={14}/></button>
                                        <button className="p-1 border rounded hover:bg-red-50 text-red-600 border-red-200" onClick={() => setConfirmDeleteId(s.id!)}><Icon name="trash" size={14}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}