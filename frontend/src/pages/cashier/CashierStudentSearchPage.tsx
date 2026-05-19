/**
 * CashierStudentSearchPage.tsx  ─  OFFICIAL LEDGER CONNECTED
 * Drop into: frontend/src/pages/cashier/CashierStudentSearchPage.tsx
 */

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosSetup';
import Icon from '../../components/ui/Icon';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  program_enrolled: string;
  year_level: string;
  enrollment_status: string;
  section: number | null;
}

interface Assessment {
  id: number;
  student_id: number;
  balance_due: string;
}

export default function CashierStudentSearchPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ENROLLED' | 'ASSESSED' | 'ADVISING'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchData();
  }, []);

  const fetchSearchData = async () => {
    try {
      // 🟢 Fetch students and the official database financial ledgers
      const [studentsRes, assessmentsRes] = await Promise.all([
        api.get<Student[]>('students/'),
        api.get<Assessment[]>('assessments/') 
      ]);
      setStudents(studentsRes.data);
      setAssessments(assessmentsRes.data);
    } catch (error) {
      console.error("Error running cashier search fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const results = students.filter(s => {
    const fullName = `${s.first_name || ''} ${s.last_name || ''} ${s.email || ''}`.toLowerCase();
    const matchesQuery = fullName.includes(query.toLowerCase()) || s.id.toString() === query;
    const matchesFilter = filter === 'all' || s.enrollment_status === filter;
    return matchesQuery && matchesFilter;
  });

  const fmt = (n: number) => n === 0 ? '—' : '₱' + n.toLocaleString();

  if (loading) return <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Warming up official ledger search...</div>;

  return (
    <div className="space-y-5">

      {/* Search Console Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-[15px] font-bold text-ustpDarkBlue mb-3">Student Master Financial Search</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Icon name="search" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by student name, email, or profile ID number..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ustpBlue/30 text-gray-700"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'ASSESSED', 'ENROLLED', 'ADVISING'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors uppercase whitespace-nowrap ${
                  filter === f
                    ? 'bg-ustpDarkBlue text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Show All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table Ecosystem */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-[12px] text-gray-400 font-medium">
          {results.length} result{results.length !== 1 && 's'} found matching current profile filters
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">DB ID</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Program & Year</th>
                <th className="px-5 py-3 text-right">Outstanding Balance</th>
                <th className="px-5 py-3 text-center">Lifecycle Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(s => {
                // 🟢 UPDATED: Pull the verified balance directly from the database ledger
                const assessment = assessments.find(a => a.student_id === s.id);
                const balance = assessment ? Number(assessment.balance_due) : 0;
                
                return (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-[12px] text-ustpBlue font-bold">#{s.id}</td>
                    <td className="px-5 py-3 text-gray-700 font-semibold">{s.last_name || 'N/A'}, {s.first_name || 'N/A'}</td>
                    <td className="px-5 py-3 text-gray-500 text-[13px]">{s.program_enrolled || 'Unset'} (Year {s.year_level || '1'})</td>
                    <td className={`px-5 py-3 text-right font-mono font-bold ${balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {assessment ? fmt(balance) : 'No Assessment'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide ${
                        s.enrollment_status === 'ENROLLED' ? 'bg-emerald-50 text-emerald-600' :
                        s.enrollment_status === 'ASSESSED' ? 'bg-purple-50 text-purple-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>{s.enrollment_status}</span>
                    </td>
                  </tr>
                );
              })}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-300 italic text-sm">
                    No active student profiles found matching those console search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}