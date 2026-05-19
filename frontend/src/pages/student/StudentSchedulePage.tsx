/**
 * StudentSchedulePage.tsx  ─  BACKEND LOCKED
 * Drop into: frontend/src/pages/student/StudentSchedulePage.tsx
 */

import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axiosSetup';
import { AuthContext } from '../../context/AuthContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00'];

const GRID_START = 7;
const GRID_END   = 18;
const SLOT_H     = 56; 

const COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-teal-100 border-teal-300 text-teal-800',
];

interface SubjectResponse {
  id: number;
  code?: string;
  title?: string;
  name?: string;
  units?: number;
}

interface ScheduleEntry {
  code: string;
  name: string;
  days: string[];
  startHour: number;
  endHour: number;
  room: string;
  color: string;
}

function timeStrToDecimal(timeStr: string): number {
  if (!timeStr) return GRID_START;
  const t = timeStr.trim();
  // Handle formats like '08:30:00' or '08:30' or '8:30 AM'
  // If contains AM/PM
  if (/[APMapm]/.test(t)) {
    const parts = t.split(' ');
    const time = parts[0];
    const period = parts[1];
    let [hours, minutes] = time.split(':').map(Number);
    if (period?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours + (minutes / 60);
  }
  // 24-hour HH:MM(:SS)
  const [hoursStr, minutesStr] = t.split(':');
  const hours = parseInt(hoursStr || '0', 10);
  const minutes = parseInt((minutesStr || '0').slice(0,2), 10) || 0;
  return hours + (minutes / 60);
}

function parseDays(daysStr: string): string[] {
  if (!daysStr) return [];
  const d = daysStr.toUpperCase();
  if (d === 'MWF') return ['Mon', 'Wed', 'Fri'];
  if (d === 'TTH') return ['Tue', 'Thu'];
  const days: string[] = [];
  if (d.includes('M')) days.push('Mon');
  if (d.includes('TUE') || (d.includes('T') && !d.includes('TH') && !d.includes('SAT'))) days.push('Tue');
  if (d.includes('W')) days.push('Wed');
  if (d.includes('TH')) days.push('Thu');
  if (d.includes('F')) days.push('Fri');
  if (d.includes('SAT')) days.push('Sat');
  return days;
}

export default function StudentSchedulePage() {
  const { user } = useContext(AuthContext) || {};
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchSchedule();
    }
  }, [user]);

  const fetchSchedule = async () => {
    try {
      const [studentsRes, offeringsRes, subjectsRes] = await Promise.all([
        api.get('students/'),
        api.get('offerings/'),
        api.get<SubjectResponse[]>('subjects/')
      ]);

      const myData = studentsRes.data.find((s: any) => s.email?.toLowerCase() === user?.email?.toLowerCase());

      if (myData && myData.section) {
        const mySectionOfferings = offeringsRes.data.filter((off: any) => off.section === myData.section);

        const mappedSchedule = mySectionOfferings.map((off: any, index: number) => {
          const subj = subjectsRes.data.find((s: any) => s.id === off.subject);
          const code = off.subject_code || subj?.code || `SUBJ-${off.subject}`;
          const name = off.subject_title || subj?.title || subj?.name || 'Untitled Subject';

          return {
            code,
            name,
            days: parseDays(off.days),
            startHour: timeStrToDecimal(off.start_time),
            endHour: timeStrToDecimal(off.end_time),
            room: off.room || 'TBA',
            color: COLORS[index % COLORS.length]
          } as ScheduleEntry;
        });
        setSchedule(mappedSchedule);
      } else {
        setSchedule([]);
      }
    } catch (err) {
      console.error("Failed to map schedule grid matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Loading block schedule...</div>;
  }

  // Formatting helpers for rendering
  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr12 = Math.floor(h) > 12 ? Math.floor(h) - 12 : (Math.floor(h) === 0 ? 12 : Math.floor(h));
    return `${hr12}:${m === 0 ? '00' : (m < 10 ? '0' + m : m)} ${ampm}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-ustpDarkBlue">Weekly Schedule</h3>
          <p className="text-[12px] text-gray-400">SY 2025–2026 · 1st Semester</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {(['grid','list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                view === v ? 'bg-white text-ustpDarkBlue shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {v === 'grid' ? '⊞ Grid' : '☰ List'}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Room</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-[12px] font-bold text-ustpBlue">{s.code}</td>
                    <td className="px-5 py-3 text-gray-700">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.days.join(', ')}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {formatTime(s.startHour, (s.startHour % 1) * 60)} – {formatTime(s.endHour, (s.endHour % 1) * 60)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.room}</td>
                  </tr>
                ))}
                {schedule.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">No schedules mapped out for your account section.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '52px repeat(6, 1fr)' }}>
                <div className="py-2 text-[10px] text-gray-300 text-center">Time</div>
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-[11px] font-bold text-ustpDarkBlue text-center border-l border-gray-100">{d}</div>
                ))}
              </div>
              <div className="relative" style={{ height: (GRID_END - GRID_START) * SLOT_H }}>
                {TIMES.map((t, i) => (
                  <div key={t} className="absolute left-0 right-0 border-t border-gray-100 flex items-start" style={{ top: i * SLOT_H }}>
                    <span className="w-[52px] text-[10px] text-gray-300 pl-2 pt-0.5 shrink-0">{t}</span>
                  </div>
                ))}
                {DAYS.map((day, di) => (
                  <div key={day} className="absolute top-0 bottom-0 border-l border-gray-100" style={{ left: `calc(52px + ${di} * (100% - 52px) / 6)`, width: `calc((100% - 52px) / 6)` }} />
                ))}
                {schedule.map((s) =>
                  s.days.map(day => {
                    const di = DAYS.indexOf(day);
                    if (di < 0) return null;
                    const top    = (s.startHour - GRID_START) * SLOT_H;
                    const height = (s.endHour - s.startHour) * SLOT_H;
                    const colW   = `calc((100% - 52px) / 6)`;
                    const left   = `calc(52px + ${di} * ${colW})`;
                    return (
                      <div key={`${s.code}-${day}`} className={`absolute rounded-lg border text-[10px] font-bold px-1.5 py-1 overflow-hidden ${s.color}`} style={{ top, height: height - 2, left, width: colW, boxSizing: 'border-box' }}>
                        <div className="truncate">{s.code}</div>
                        <div className="font-normal opacity-70 truncate">{s.room}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}