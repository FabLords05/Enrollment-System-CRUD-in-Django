/**
 * StudentSubjectsPage.tsx  ─  BACKEND LOCKED
 * Drop into: frontend/src/pages/student/StudentSubjectsPage.tsx
 */

import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axiosSetup';
import { AuthContext } from '../../context/AuthContext';

interface SubjectMaster {
  id: number;
  code: string;
  title?: string;
  name?: string;
  units?: number;
}

interface Offering {
  id: number;
  subject: number;
  subject_title?: string;
  subject_code?: string;
  subject_units?: number;
  section: number;
  days: string;
  start_time: string; // e.g. "08:30:00"
  end_time: string;
  room?: string;
  instructor?: number | null;
  instructor_name?: string;
}

interface Instructor {
  id: number;
  name?: string;
  nm?: string;
}

export default function StudentSubjectsPage() {
  const { user } = useContext(AuthContext) || {};
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [subjects, setSubjects] = useState<SubjectMaster[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch students, offerings, subjects (master catalog), instructors concurrently
      const [studentsRes, offersRes, subjRes, instRes] = await Promise.all([
        api.get('students/'),
        api.get<Offering[]>('offerings/'),
        api.get<SubjectMaster[]>('subjects/'),
        api.get<Instructor[]>('instructors/')
      ]);

      setOfferings(offersRes.data);
      setSubjects(subjRes.data);
      setInstructors(instRes.data || []);

      const myData = studentsRes.data.find((s: any) => s.email?.toLowerCase() === user?.email?.toLowerCase());
      if (myData && myData.section) {
        const sectionLoad = offersRes.data.filter(o => o.section === myData.section);
        setOfferings(sectionLoad);
      } else {
        setOfferings([]);
      }
    } catch (err) {
      console.error('Failed to fetch student subject load:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfferings = offerings.filter(o => {
    const subj = subjects.find(s => s.id === o.subject);
    const code = o.subject_code || subj?.code || '';
    const title = o.subject_title || subj?.title || subj?.name || '';
    return `${code} ${title}`.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnits = (offerings || []).reduce((a, o) => a + (o.subject_units ?? (subjects.find(s => s.id === o.subject)?.units ?? 0)), 0);

  if (loading) {
    return <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Loading assigned subjects...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-ustpDarkBlue">My Enrolled Subjects</h3>
          <p className="text-[12px] text-gray-400">SY 2025–2026 · 1st Semester · {totalUnits} total units loaded</p>
        </div>
        <input
          type="text"
          placeholder="Search within my load…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-ustpBlue/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOfferings.map((o) => {
          const subj = subjects.find(s => s.id === o.subject);
          const code = o.subject_code || subj?.code || `SUBJ-${o.subject}`;
          const title = o.subject_title || subj?.title || subj?.name || 'Untitled Subject';
          const units = o.subject_units ?? subj?.units ?? 0;
          const instructorName = o.instructor_name || instructors.find(i => i.id === o.instructor)?.name || instructors.find(i => i.id === o.instructor)?.nm || 'TBA';
          const days = o.days || 'TBA';
          const st = o.start_time?.replace(/:00$/, '') ?? 'TBA';
          const et = o.end_time?.replace(/:00$/, '') ?? 'TBA';

          return (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-mono text-[12px] font-bold text-ustpBlue bg-blue-50 px-2 py-0.5 rounded inline-block">{code}</div>
                  <div className="text-[14px] font-bold text-gray-800 mt-1 leading-tight">{title}</div>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">Enrolled</span>
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[12px] text-gray-500">
                <span>👤 {instructorName}</span>
                <span>📚 {units} units</span>
                <span>📅 {days}</span>
                <span>🕐 {st} – {et}</span>
                <span>🏫 {o.room || 'TBA'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOfferings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 italic text-sm">
          No class records found. You might be unassigned to a section block by the Registrar.
        </div>
      )}
    </div>
  );
}