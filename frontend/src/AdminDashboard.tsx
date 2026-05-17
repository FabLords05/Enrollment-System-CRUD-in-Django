/**
 * AdminDashboard.tsx ─ EXECUTIVE SUMMARY LIVE CONNECTED
 * Drop into: frontend/src/AdminDashboard.tsx
 */

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { AdminShell } from './components/layout/AdminShell';
import api from './api/axiosSetup';
import StatCard from './components/ui/StatCard'; // Adjust path if your structure differs

// Import your created modular components
import StudentsManager from './components/admin/StudentsManager';
import SubjectsManager from './components/admin/SubjectsManager';
import InstructorsManager from './components/admin/InstructorsManager';
import RequestsManager from './components/admin/RequestsManager';
import SectionsManager from './components/admin/SectionsManager';
import SchedulesManager from './components/admin/SchedulesManager';

export default function AdminDashboard() {
    const { logout } = useContext(AuthContext) || {};
    const [activePage, setActivePage] = useState('dashboard');
    
    // Live Summary Counts State
    const [counts, setCounts] = useState({ students: 0, sections: 0, subjects: 0, instructors: 0 });
    const [loading, setLoading] = useState(true);

    // Re-fetch database metrics whenever the Admin navigates back to the main dashboard summary
    useEffect(() => {
        if (activePage === 'dashboard') {
            fetchSummaryCounts();
        }
    }, [activePage]);

    const fetchSummaryCounts = async () => {
        try {
            setLoading(true);
            const [stuRes, secRes, subRes, instRes] = await Promise.all([
                api.get('students/'),
                api.get('sections/'),
                api.get('subjects/'),
                api.get('instructors/')
            ]);
            
            setCounts({
                students: stuRes.data.length,
                sections: secRes.data.length,
                subjects: subRes.data.length,
                instructors: instRes.data.length
            });
        } catch (err) {
            console.error("Failed to load system metrics summary:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (logout) logout();
    };

    return (
        <AdminShell 
            activePage={activePage} 
            setActivePage={setActivePage} 
            onLogout={handleLogout}
            pendingRequestsCount={counts.students} // Dynamically show total database profiles
        >
            
            {/* ── LIVE SUMMARY DASHBOARD VIEW ── */}
            {activePage === 'dashboard' && (
                <div className="space-y-6 text-left">
                    
                    {/* Welcome Command Banner */}
                    <div className="bg-gradient-to-r from-gray-900 via-ustpDarkBlue to-blue-900 rounded-xl p-6 text-white flex items-center justify-between shadow-sm">
                        <div>
                            <div className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">Control Console</div>
                            <h2 className="text-xl font-extrabold">Welcome to the Admin Portal 🏛️</h2>
                            <p className="text-sm text-white/60 mt-1">University Domain Infrastructure Configuration Management</p>
                        </div>
                        <div className="hidden sm:block text-5xl opacity-20">🛡️</div>
                    </div>

                    {/* Dynamic Analytics Metrics Grid */}
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Aggregating system core registers...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard 
                                label="Total Students" 
                                value={counts.students.toString()} 
                                icon="users" 
                                sub="Registered records" 
                                iconColor="text-blue-600" 
                                iconBg="bg-blue-50" 
                            />
                            <StatCard 
                                label="Block Sections" 
                                value={counts.sections.toString()} 
                                icon="grid" 
                                sub="Active directories" 
                                iconColor="text-purple-600" 
                                iconBg="bg-purple-50" 
                            />
                            <StatCard 
                                label="Course Catalog" 
                                value={counts.subjects.toString()} 
                                icon="book" 
                                sub="Configured subjects" 
                                iconColor="text-orange-600" 
                                iconBg="bg-orange-50" 
                            />
                            <StatCard 
                                label="Faculty Members" 
                                value={counts.instructors.toString()} 
                                icon="user" 
                                sub="Assigned instructors" 
                                iconColor="text-emerald-600" 
                                iconBg="bg-emerald-50" 
                            />
                        </div>
                    )}

                    {/* Operational Action Gateways Shortlinks */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-ustpDarkBlue mb-4">Domain Management Quick Shortcuts</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <button onClick={() => setActivePage('students')} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left">
                                <div className="font-bold text-blue-700 text-sm">👥 Students Directory</div>
                                <div className="text-xs text-gray-400 mt-1">Manage admissions profiles and clearances.</div>
                            </button>
                            <button onClick={() => setActivePage('sections')} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-purple-50/50 hover:border-purple-200 transition-all text-left">
                                <div className="font-bold text-purple-700 text-sm">🗂️ Sections & Rooms</div>
                                <div className="text-xs text-gray-400 mt-1">Configure structural blocks and capacities.</div>
                            </button>
                            <button onClick={() => setActivePage('subjects')} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-orange-50/50 hover:border-orange-200 transition-all text-left">
                                <div className="font-bold text-orange-700 text-sm">📖 Subject Catalogs</div>
                                <div className="text-xs text-gray-400 mt-1">Adjust class unit credits and prerequisites.</div>
                            </button>
                        </div>
                    </div>

                </div>
            )}
            
            {/* Modular Components Router Gateways */}
            {activePage === 'students'    && <StudentsManager />}
            {activePage === 'sections'    && <SectionsManager />}
            {activePage === 'subjects'    && <SubjectsManager />}
            {activePage === 'instructors' && <InstructorsManager />}
            {activePage === 'schedules'   && <SchedulesManager />}
            {activePage === 'requests'    && <RequestsManager />}
            
        </AdminShell>
    );
}