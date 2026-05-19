import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

type EntityId = number | string | { id: number } | null;

interface Section { id: number; name: string; }
interface Instructor { id: number; nm: string; }
interface SubjectCatalog { id: number; code: string; name: string; units: number; nm?: string; }
interface ClassOffering {
    id: number | null;
    subject: EntityId;
    section: EntityId;
    instructor: EntityId;
    subject_title?: string;
    subject_code?: string;
    section_name?: string;
    instructor_name?: string;
    days: string;
    start_time: string;
    end_time: string;
    room: string;
}

interface ClassOfferingForm {
    id: number | null;
    subject: number | string;
    section: number | string;
    instructor: number | string;
    days: string;
    start_time: string;
    end_time: string;
    room: string;
}

const TIME_OPTIONS = [
    '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
];

const DAYS_OPTIONS = [
    'MWF',
    'TTh',
    'MTh',
    'MW',
    'TThS',
    'WF',
    'Daily',
    'Once',
];

export default function SchedulesManager() {
    const [offerings, setOfferings] = useState<ClassOffering[]>([]);
    const [subjects, setSubjects] = useState<SubjectCatalog[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [filter, setFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState<ClassOfferingForm>({
        id: null,
        subject: '',
        section: '',
        instructor: '',
        days: '',
        start_time: '',
        end_time: '',
        room: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [offRes, subRes, secRes, instRes] = await Promise.all([
                api.get('offerings/'),
                api.get('subjects/'),
                api.get('sections/'),
                api.get('instructors/'),
            ]);
            setOfferings(offRes.data);
            setSubjects(subRes.data);
            setSections(secRes.data);
            setInstructors(instRes.data);
        } catch (error) {
            console.error('Failed to fetch offerings data', error);
        }
    };

    const parseEntityId = (value: EntityId): number | '' => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = Number(value);
            return Number.isInteger(parsed) ? parsed : '';
        }
        if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') return value.id;
        return '';
    };

    const formatTimeToDropdown = (time: string): string => {
        if (!time) return '';
        const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
        if (!match) return time;

        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = hours >= 12 ? 'PM' : 'AM';
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
    };

    const formatTimeForDisplay = (time: string): string => {
        if (!time) return '';
        const normalized = time.trim().replace(/^(\d{1,2}:\d{2}):(\d{2})$/, '$1');
        return formatTimeToDropdown(normalized);
    };

    const formatTimeToBackend = (time: string): string => {
        if (!time) return '';
        const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
        if (!match) return time;

        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();

        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    const openNew = () => {
        setForm({
            id: null,
            subject: '',
            section: '',
            instructor: '',
            days: '',
            start_time: '',
            end_time: '',
            room: '',
        });
        setModalOpen(true);
    };

    const openEdit = (offering: ClassOffering) => {
        setForm({
            id: offering.id,
            subject: parseEntityId(offering.subject) || '',
            section: parseEntityId(offering.section) || '',
            instructor: parseEntityId(offering.instructor) || '',
            days: offering.days,
            start_time: formatTimeToDropdown(offering.start_time),
            end_time: formatTimeToDropdown(offering.end_time),
            room: offering.room,
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.subject || !form.section) {
            alert('Subject and section are required.');
            return;
        }

        const payload = {
            subject: form.subject,
            section: form.section,
            instructor: form.instructor ? form.instructor : null,
            days: form.days,
            start_time: formatTimeToBackend(form.start_time),
            end_time: formatTimeToBackend(form.end_time),
            room: form.room,
        };

        try {
            if (form.id !== null) {
                await api.patch(`offerings/${form.id}/`, payload);
            } else {
                await api.post('offerings/', payload);
            }
            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving offering', error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Backend Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to save the offering.');
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`offerings/${id}/`);
            setConfirmDeleteId(null);
            fetchData();
        } catch (error) {
            console.error('Error deleting offering', error);
        }
    };

    const filtered = filter ? offerings.filter((o) => parseEntityId(o.section) === Number(filter)) : offerings;

    const getSubjectUnits = (subjectId: EntityId) => {
        const subject = subjects.find((item) => item.id === parseEntityId(subjectId));
        return subject ? subject.units : 0;
    };

    return (
        <div className="max-w-6xl">
            {confirmDeleteId && (
                <Modal
                    title="Confirm Deletion"
                    onClose={() => setConfirmDeleteId(null)}
                    footer={
                        <>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-50 transition" onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition" onClick={() => handleDelete(confirmDeleteId)}>
                                Delete Offering
                            </button>
                        </>
                    }
                >
                    <p className="text-gray-600 text-sm">Permanently delete this class offering? This action cannot be reversed.</p>
                </Modal>
            )}

            {modalOpen && (
                <Modal
                    maxWidth="max-w-[800px]"
                    title={form.id ? 'Edit Class Offering' : 'Add New Class Offering'}
                    onClose={() => setModalOpen(false)}
                    footer={
                        <>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition" onClick={() => setModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition" onClick={handleSave}>
                                Save Offering
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">SUBJECT</label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value ? Number(e.target.value) : '' })}
                                >
                                    <option value="">Select Subject...</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.code} - {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">UNITS</label>
                                <input
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-100"
                                    value={getSubjectUnits(form.subject)}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">BLOCK SECTION</label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                    value={form.section}
                                    onChange={(e) => setForm({ ...form, section: e.target.value ? Number(e.target.value) : '' })}
                                >
                                    <option value="">Select Section...</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">INSTRUCTOR</label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                    value={form.instructor}
                                    onChange={(e) => setForm({ ...form, instructor: e.target.value ? Number(e.target.value) : '' })}
                                >
                                    <option value="">TBA / Unassigned</option>
                                    {instructors.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.nm}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">DAYS</label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                    value={form.days}
                                    onChange={(e) => setForm({ ...form, days: e.target.value })}
                                >
                                    <option value="">Select Days...</option>
                                    {DAYS_OPTIONS.map((days) => (
                                        <option key={days} value={days}>
                                            {days}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">START TIME</label>
                                <select
                                    className="w-full border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                                    value={form.start_time}
                                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                >
                                    <option value="">Select Time</option>
                                    {TIME_OPTIONS.map((time) => (
                                        <option key={`st-${time}`} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">END TIME</label>
                                <select
                                    className="w-full border border-gray-200 p-2 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                                    value={form.end_time}
                                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                >
                                    <option value="">Select Time</option>
                                    {TIME_OPTIONS.map((time) => (
                                        <option key={`et-${time}`} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">ROOM</label>
                                <input
                                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                    placeholder="IT 201"
                                    value={form.room}
                                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            <div className="flex gap-4 mb-6 items-center justify-between">
                <div className="flex items-center gap-3">
                    <select
                        className="border-2 border-gray-200 p-2.5 rounded-lg bg-white text-sm outline-none w-64 focus:border-blue-500 font-semibold text-gray-700 shadow-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">All Academic Sections</option>
                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-md">
                        {filtered.length} Entries
                    </span>
                </div>
                <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm"
                    onClick={openNew}
                >
                    <Icon name="plus" size={14} /> Add Offering
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="overflow-y-auto overflow-x-hidden max-h-[65vh]">
                    <table className="w-full text-left border-collapse table-auto min-w-[880px]">
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                            <tr className="text-gray-500 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200">
                                <th className="p-4 py-3">Subject</th>
                                <th className="p-4 py-3">Section</th>
                                <th className="p-4 py-3">Days</th>
                                <th className="p-4 py-3">Start</th>
                                <th className="p-4 py-3">End</th>
                                <th className="p-4 py-3">Room</th>
                                <th className="p-4 py-3">Instructor</th>
                                <th className="p-4 py-3 text-center">Units</th>
                                <th className="p-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-10 text-center text-gray-400 text-sm font-medium">
                                        No class offerings available. Click "Add Offering" to create one.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((offering) => {
                                    const subjectId = parseEntityId(offering.subject);
                                    const sectionId = parseEntityId(offering.section);
                                    const instructorId = parseEntityId(offering.instructor);

                                    const subject = subjects.find((item) => item.id === subjectId);
                                    const section = sections.find((item) => item.id === sectionId);
                                    const instructor = instructors.find((item) => item.id === instructorId);

                                    const subjectLabel = offering.subject_title || (subject ? `${subject.code} - ${subject.name}` : 'TBA');
                                    const sectionLabel = offering.section_name || section?.name || 'TBA';
                                    const instructorLabel = offering.instructor_name || instructor?.nm || 'TBA';

                                    return (
                                        <tr
                                            key={offering.id ?? 'new'}
                                            className="border-b border-gray-100 hover:bg-gray-50/80 cursor-pointer transition text-sm"
                                            onClick={() => offering.id && openEdit(offering)}
                                        >
                                            <td className="p-4 font-bold text-gray-800">{subjectLabel}</td>
                                            <td className="p-4">
                                                {sectionLabel !== 'TBA' ? (
                                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">
                                                        {sectionLabel}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs font-semibold">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-semibold">
                                                    {offering.days || '—'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-blue-600 whitespace-nowrap">{formatTimeForDisplay(offering.start_time) || '—'}</td>
                                            <td className="p-4 text-gray-500 whitespace-nowrap">{formatTimeForDisplay(offering.end_time) || '—'}</td>
                                            <td className="p-4 text-gray-600 font-medium">{offering.room || '—'}</td>
                                            <td className="p-4 text-gray-700">{instructorLabel !== 'TBA' ? instructorLabel : <span className="text-gray-400 italic text-xs font-semibold">TBA</span>}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                                    {subject ? subject.units : '—'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                <button
                                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-500 shadow-sm transition"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        offering.id && openEdit(offering);
                                                    }}
                                                >
                                                    <Icon name="edit" size={14} />
                                                </button>
                                                {offering.id && (
                                                    <button
                                                        className="p-2 border border-red-100 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white shadow-sm transition"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmDeleteId(offering.id as number);
                                                        }}
                                                    >
                                                        <Icon name="trash" size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
