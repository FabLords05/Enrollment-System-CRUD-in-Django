import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../api/axiosSetup';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

interface Subject {
    id: number;
    code: string;
    name: string;
    units: number;
}

interface SubjectForm {
    id: number | null;
    code: string;
    name: string;
    units: number;
}

export default function SubjectsManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState<SubjectForm>({
        id: null,
        code: '',
        name: '',
        units: 3,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('subjects/');
            setSubjects(response.data);
        } catch (err) {
            console.error('Failed to fetch subject catalog', err);
        }
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            alert('Subject Code and Subject Title are required fields.');
            return;
        }

        const payload = {
            code: form.code.trim(),
            name: form.name.trim(),
            units: form.units,
        };

        try {
            if (form.id !== null) {
                try {
                    await api.patch(`subjects/${form.id}/`, payload);
                } catch (patchError) {
                    if (axios.isAxiosError(patchError) && patchError.response?.status === 405) {
                        await api.put(`subjects/${form.id}/`, payload);
                    } else {
                        throw patchError;
                    }
                }
            } else {
                await api.post('subjects/', payload);
            }
            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving subject catalog', error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Backend Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to save the subject.');
            }
        }
    };

    const openNew = () => {
        setForm({ id: null, code: '', name: '', units: 3 });
        setModalOpen(true);
    };

    const openEdit = (subject: Subject) => {
        setForm({ id: subject.id, code: subject.code, name: subject.name, units: subject.units });
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`subjects/${id}/`);
            setConfirmDeleteId(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete subject catalog item', error);
            alert('Unable to delete this subject.');
        }
    };

    return (
        <>
            {confirmDeleteId !== null && (
                <Modal
                    title="Confirm Delete"
                    onClose={() => setConfirmDeleteId(null)}
                    footer={
                        <>
                            <button
                                className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
                                onClick={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
                            >
                                Delete Subject
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-gray-600">Are you sure you want to delete this subject from the master catalog? This cannot be undone.</p>
                </Modal>
            )}

            {modalOpen && (
                <Modal
                    title={form.id ? 'Edit Subject' : 'Add Subject'}
                    onClose={() => setModalOpen(false)}
                    footer={
                        <>
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-ustpBlue text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
                                onClick={handleSave}
                            >
                                Save Subject
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">SUBJECT CODE</label>
                            <input
                                type="text"
                                className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-ustpBlue"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="IT 322"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">SUBJECT TITLE / NAME</label>
                            <input
                                type="text"
                                className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-ustpBlue"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Advanced Web Development"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">UNITS LOAD</label>
                            <input
                                type="number"
                                min={0}
                                className="w-full border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-ustpBlue"
                                value={form.units}
                                onChange={(e) => setForm({ ...form, units: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Master Subject Catalog</h2>
                    <p className="text-sm text-gray-500">Manage the subject master list used by the scheduling engine.</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-ustpBlue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    onClick={openNew}
                >
                    <Icon name="plus" size={14} /> Add Subject
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                                <th className="p-4">Subject Code</th>
                                <th className="p-4">Subject Title</th>
                                <th className="p-4 text-center">Units</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-400 text-sm">
                                        No master subjects found. Click "Add Subject" to create one.
                                    </td>
                                </tr>
                            ) : (
                                subjects.map((subject) => (
                                    <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800">{subject.code}</td>
                                        <td className="p-4 text-gray-700">{subject.name}</td>
                                        <td className="p-4 text-center text-gray-700">{subject.units}</td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                type="button"
                                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
                                                onClick={() => openEdit(subject)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="px-3 py-2 border border-red-100 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-600 hover:text-white transition"
                                                onClick={() => setConfirmDeleteId(subject.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}