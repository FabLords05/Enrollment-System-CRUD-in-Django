/**
 * StudentDashboardPage.tsx  ─  BACKEND CONNECTED
 * Drop into: frontend/src/pages/student/StudentDashboardPage.tsx
 */

import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axiosSetup';
import { AuthContext } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';

interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  program_enrolled: string;
  year_level: string;
  enrollment_status: string;
  section?: number | null;
}

interface Section {
  id: number;
  name: string;
}

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
  days?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  instructor?: number | null;
}

interface StudentDashboardSubject {
  id: number;
  code: string;
  title: string;
  units: number;
  instId: number | null;
  days: string;
}

interface Instructor {
  id: number;
  name?: string;
  nm?: string;
}

export default function StudentDashboardPage() {
  const { user } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(true);

  // States to hold our fetched data
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [sectionName, setSectionName] = useState('Unassigned');
  const [mySubjects, setMySubjects] = useState<StudentDashboardSubject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Calculated Stats States
  const [totalUnits, setTotalUnits] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [activeDaysCount, setActiveDaysCount] = useState(0);

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch all required tables concurrently
      const [studentsRes, sectionsRes, offeringsRes, subjectsRes, instRes] = await Promise.all([
        api.get<StudentProfile[]>('students/'),
        api.get<Section[]>('sections/'),
        api.get<Offering[]>('offerings/'),
        api.get<SubjectMaster[]>('subjects/'),
        api.get<Instructor[]>('instructors/')
      ]);

      setInstructors(instRes.data);

      // 2. Identify the logged-in student
      const myData = studentsRes.data.find(s => s.email?.toLowerCase() === user?.email?.toLowerCase());
      if (!myData) {
        setLoading(false);
        return;
      }
      setProfile(myData);

      // 3. Resolve Section Name
      if (myData.section) {
        const sec = sectionsRes.data.find(s => s.id === myData.section);
        if (sec) setSectionName(sec.name);
      }

      // 4. Resolve Offerings linked to the student's section
      const sectionOfferings = offeringsRes.data.filter(off => off.section === myData.section);
      const enrolledSubjects = sectionOfferings.map(off => {
        const subj = subjectsRes.data.find(s => s.id === off.subject);
        return {
          id: off.id,
          code: off.subject_code || subj?.code || `SUBJ-${off.subject}`,
          title: off.subject_title || subj?.title || subj?.name || 'Untitled Subject',
          units: off.subject_units ?? subj?.units ?? 0,
          instId: off.instructor ?? null,
          days: off.days || ''
        };
      });
      setMySubjects(enrolledSubjects);

      const units = enrolledSubjects.reduce((sum, sub) => sum + sub.units, 0);
      setTotalUnits(units);

      // 5. Calculate Financial Balance
      if (myData.enrollment_status === 'ASSESSED') {
        const tuition = units * 400;
        const fixedFees = 1500 + 1200 + 350 + 500 + 500; // Misc, Lab, NSTP, Fund, Reg
        setOutstandingBalance(tuition + fixedFees);
      } else {
        setOutstandingBalance(0);
      }

      // 6. Calculate Unique Days active in schedule
      const activeDays = new Set<string>();
      enrolledSubjects.forEach(s => {
        const d = (s.days || '').toUpperCase();
        if (d.includes('M')) activeDays.add('Mon');
        if (d.includes('TUE') || (d.includes('T') && !d.includes('TH'))) activeDays.add('Tue');
        if (d.includes('W')) activeDays.add('Wed');
        if (d.includes('TH')) activeDays.add('Thu');
        if (d.includes('F')) activeDays.add('Fri');
        if (d.includes('SAT')) activeDays.add('Sat');
      });
      setActiveDaysCount(activeDays.size);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Loading your academic dashboard...</div>;
  }

  if (!profile) {
    return <div className="p-10 text-center text-red-400 font-medium">Error: Student profile not found.</div>;
  }

  // Formatting helpers
  const fmtBalance = `₱${outstandingBalance.toLocaleString()}`;
  const getInstructorName = (id: number | null) => instructors.find(i => i.id === id)?.name || instructors.find(i => i.id === id)?.nm || 'TBA';
  const firstName = profile.first_name || 'Student';
  
  // Status Pill color logic
  const statusColors: Record<string, string> = {
    'ENROLLED': 'text-emerald-600 bg-emerald-50',
    'PAID': 'text-blue-600 bg-blue-50',
    'ASSESSED': 'text-purple-600 bg-purple-50',
    'ADVISING': 'text-yellow-600 bg-yellow-50'
  };
  const statusColor = statusColors[profile.enrollment_status] || 'text-gray-600 bg-gray-50';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ustpDarkBlue to-ustpBlue rounded-xl p-6 text-white flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">Welcome back</div>
          <h2 className="text-xl font-extrabold">Good day, {firstName} 🎓</h2>
          <p className="text-sm text-white/60 mt-1">SY 2025–2026 | 1st Semester | {sectionName}</p>
        </div>
        <div className="hidden sm:block text-6xl opacity-20">🏛️</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Enrolled Subjects"
          value={mySubjects.length.toString()}
          icon="book"
          sub={`${totalUnits} units this semester`}
          iconColor="text-ustpBlue"
          iconBg="bg-blue-50"
          trend="neutral"
          trendLabel="Current load"
        />
        <StatCard
          label={outstandingBalance > 0 ? "Pending Payments" : "Account Balance"}
          value={fmtBalance}
          icon="doc"
          sub={outstandingBalance > 0 ? "Due: July 30, 2025" : "All settled"}
          iconColor={outstandingBalance > 0 ? "text-red-600" : "text-green-600"}
          iconBg={outstandingBalance > 0 ? "bg-red-50" : "bg-green-50"}
          trend={outstandingBalance > 0 ? "down" : "up"}
          trendLabel={outstandingBalance > 0 ? "Balance remaining" : "Cleared"}
        />
        <StatCard
          label="Schedule Days"
          value={activeDaysCount.toString()}
          icon="cal"
          sub="Days with classes"
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Enrollment Status"
          value={profile.enrollment_status}
          icon="check"
          sub="Current Stage"
          iconColor={statusColor.split(' ')[0]}
          iconBg={statusColor.split(' ')[1]}
        />
      </div>

      {/* Recent Subjects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-ustpDarkBlue">Currently Enrolled Subjects</h3>
          <span className="text-[11px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">{mySubjects.length} subjects</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Subject Name</th>
                <th className="px-5 py-3">Units</th>
                <th className="px-5 py-3">Instructor</th>
              </tr>
            </thead>
            <tbody>
              {mySubjects.slice(0, 4).map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-[12px] text-ustpBlue font-bold">{s.code}</td>
                  <td className="px-5 py-3 text-gray-700">{s.title}</td>
                  <td className="px-5 py-3 text-gray-500">{s.units}</td>
                  <td className="px-5 py-3 text-gray-500">{getInstructorName(s.instId)}</td>
                </tr>
              ))}
              {mySubjects.length === 0 && (
                <tr className="border-t border-gray-100 text-[12px] text-gray-400">
                  <td colSpan={4} className="px-5 py-6 text-center italic">No subjects assigned yet. Waiting for Registrar.</td>
                </tr>
              )}
              {mySubjects.length > 4 && (
                <tr className="border-t border-gray-100 text-[12px] text-gray-400">
                  <td colSpan={4} className="px-5 py-3 italic">+ {mySubjects.length - 4} more subjects (View in Subjects tab)</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Announcement Banner */}
      {profile.enrollment_status === 'ASSESSED' && (
        <div className="bg-ustpGold/10 border border-ustpGold/30 rounded-xl p-4 flex items-start gap-3">
          <div className="text-ustpGold text-lg mt-0.5">📢</div>
          <div>
            <div className="text-[13px] font-bold text-ustpDarkBlue">Enrollment Notice</div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              Please settle your outstanding balance of {fmtBalance} before July 30 to avoid late fees.
              Visit the Cashier's Office with your Student ID to process the payment.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}