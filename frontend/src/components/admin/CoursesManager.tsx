import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

interface Course {
    id: number | null;
    code: string;
    name: string;
    units: number;
}

export default function CoursesManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState<Course>({ id: null, code: '', name: '', units: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('courses/');
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setForm({ id: null, code: '', name: '', units: 3 });
        setModalOpen(true);
    };

    const openEdit = (course: Course) => {
        setForm({ ...course });
        setModalOpen(true);
    };

    const saveCourse = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            alert('Course code and name are required.');
            return;
        }

        const payload = {
            code: form.code.trim(),
            name: form.name.trim(),
            units: 0,
            prerequisites: [],
        };

        try {
            if (form.id) {
                await api.patch(`courses/${form.id}/`, payload);
            } else {
                await api.post('courses/', payload);
            }
            setModalOpen(false);
            fetchCourses();
        } catch (error) {
            console.error('Error saving course', error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Backend Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to save the course.');
            }
        }
    };

    const deleteCourse = async (id: number) => {
        try {
            await api.delete(`courses/${id}/`);
            setConfirmDeleteId(null);
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course', error);
        }
    };

    const filteredCourses = courses.filter((course) =>
        `${course.code} ${course.name}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl">
            {confirmDeleteId !== null && (
                <Modal
                    title="Confirm Delete"
                    onClose={() => setConfirmDeleteId(null)}
                    footer={
                        <>
                            <button
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                onClick={() => deleteCourse(confirmDeleteId)}
                            >
                                Delete Course
                            </button>
                        </>
                    }
                >
                    <p className="text-gray-600 text-sm">This will permanently remove the selected course from the catalog.</p>
                </Modal>
            )}

            {modalOpen && (
                <Modal
                    maxWidth="max-w-[700px]"
                    title={form.id ? 'Edit Course' : 'Add Course'}
                    onClose={() => setModalOpen(false)}
                    footer={
                        <>
                            <button
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                onClick={saveCourse}
                            >
                                Save Course
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">PROGRAM CODE</label>
                            <input
                                className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 bg-white"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="BSIT"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">PROGRAM FULL NAME</label>
                            <input
                                className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 bg-white"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Bachelor of Science in Information Technology"
                            />
                        </div>
                    </div>
                </Modal>
            )}

            <div className="flex flex-col gap-4 mb-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-widest text-gray-500">Degree Programs Manager</div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Programs & Degrees</h1>
                    <p className="text-sm text-gray-500 max-w-2xl">Manage overarching degree tracks like BSIT and BSTCM. This view does not expose individual course units or prerequisites.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-xs">
                        <span className="absolute left-3 top-3 text-gray-400"><Icon name="search" size={14} /></span>
                        <input
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                        onClick={openNew}
                    >
                        <Icon name="plus" size={14} />
                        Add Course
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 bg-white shadow-sm">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 font-semibold text-ustpDarkBlue uppercase tracking-wide">Program Code</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wide">Description / Degree Title</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 uppercase tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Loading courses...</td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">No programs found.</td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id ?? `${course.code}-${course.name}`} className="border-b border-gray-100 hover:bg-blue-50/10 transition">
                                        <td className="px-6 py-4 font-semibold text-ustpDarkBlue">{course.code}</td>
                                        <td className="px-6 py-4 text-gray-600">{course.name}</td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                                onClick={() => openEdit(course)}
                                            >
                                                <Icon name="edit" size={14} />
                                                Edit
                                            </button>
                                            {course.id !== null && (
                                                <button
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                                                    onClick={() => setConfirmDeleteId(course.id)}
                                                >
                                                    <Icon name="trash" size={14} />
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
