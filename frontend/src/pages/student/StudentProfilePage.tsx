/**
 * StudentProfilePage.tsx  ─  BACKEND CONNECTED
 * Drop into: frontend/src/pages/student/StudentProfilePage.tsx
 */

import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axiosSetup';
import { AuthContext } from '../../context/AuthContext';

interface StudentProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  student_id?: string;
  program_enrolled?: string | number | null;
  year_level?: string;
  enrollment_status: string;
  section?: number | null;
}

interface Section {
  id: number;
  name: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
}

export default function StudentProfilePage() {
  const { user } = useContext(AuthContext) || {};
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [sectionName, setSectionName] = useState('Unassigned');
  const [courses, setCourses] = useState<Course[]>([]);
  
  // State for the editable form fields
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  useEffect(() => {
    if (user?.email) {
      fetchMyProfile();
    }
  }, [user]);

  const fetchMyProfile = async () => {
    try {
      // 1. Fetch all students, sections, and courses
      const [studentsRes, sectionsRes, coursesRes] = await Promise.all([
        api.get<StudentProfile[]>('students/'),
        api.get<Section[]>('sections/'),
        api.get<Course[]>('courses/')
      ]);

      setCourses(coursesRes.data || []);

      // 2. Find the student matching the logged-in user's email
      const myData = studentsRes.data.find(s => s.email?.toLowerCase() === user?.email?.toLowerCase());
      
      if (myData) {
        setProfile(myData);
        setForm({
          first_name: myData.first_name || '',
          last_name: myData.last_name || '',
          phone: myData.phone || ''
        });

        // Map section ID to section Name
        if (myData.section) {
          const mySec = sectionsRes.data.find(sec => sec.id === myData.section);
          if (mySec) setSectionName(mySec.name);
        }
      }
    } catch (error) {
      console.error("Failed to load profile data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      // Send a PATCH request to update only the modified fields
      await api.patch(`students/${profile.id}/`, form);
      
      // Update local profile state to reflect changes and exit edit mode
      setProfile({ ...profile, ...form });
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("An error occurred while saving your changes.");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-400 font-medium animate-pulse">Loading profile data...</div>;
  }

  if (!profile) {
    return <div className="p-10 text-center text-red-400 font-medium">Error: Could not locate your student record.</div>;
  }

  const initial = profile.first_name ? profile.first_name[0].toUpperCase() : '?';
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || 'No Name Set';
  const course = courses.find(c => c.id === Number(profile.program_enrolled));
  const courseLabel = course ? `${course.code} — ${course.name}` : 'Unassigned';
  const studentIdValue = profile.student_id?.trim();
  const showPendingStudentId = !studentIdValue || /pending/i.test(studentIdValue);

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible relative">
        <div className="bg-gradient-to-r from-ustpDarkBlue to-ustpBlue h-24 relative" />
        <div className="px-6 pb-6 -mt-10 overflow-visible">
          <div className="relative z-20 w-20 h-20 rounded-full bg-ustpGold text-ustpDarkBlue flex items-center justify-center text-3xl font-extrabold border-4 border-white shadow-md uppercase">
            {initial}
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-extrabold text-ustpDarkBlue">{fullName}</h2>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-semibold">{sectionName}</span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                  profile.enrollment_status === 'ENROLLED' ? 'bg-green-100 text-green-700' : 
                  profile.enrollment_status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                  profile.enrollment_status === 'ASSESSED' ? 'bg-purple-100 text-purple-700' :
                  'bg-yellow-100 text-yellow-700'
              }`}>
                  {profile.enrollment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-ustpDarkBlue">Personal Information</h3>
          {editing ? (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditing(false);
                  setForm({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone || '' });
                }}
                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors bg-ustpDarkBlue text-white"
              >
                💾 Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Read-Only System Fields */}
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Student ID</label>
            {showPendingStudentId ? (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-md">
                <span>⏳</span>
                <span>Verification Pending</span>
              </div>
            ) : (
              <input type="text" value={studentIdValue ?? ''} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[13px] text-gray-700 cursor-not-allowed" />
            )}
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Email Address</label>
            <input type="text" value={profile.email} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[13px] text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Program / Course</label>
            <input type="text" value={courseLabel} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[13px] text-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Section</label>
            <input type="text" value={sectionName} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[13px] text-gray-700 cursor-not-allowed" />
          </div>

          {/* Editable Fields */}
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">First Name</label>
            <input 
              type="text" 
              value={editing ? form.first_name : profile.first_name} 
              onChange={e => setForm({...form, first_name: e.target.value})}
              disabled={!editing} 
              className={`w-full border rounded-lg px-3 py-2 text-[13px] text-gray-700 transition-colors ${editing ? 'border-ustpBlue/40 bg-white focus:outline-none focus:ring-2 focus:ring-ustpBlue/20' : 'border-gray-100 bg-gray-50 cursor-not-allowed'}`} 
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Last Name</label>
            <input 
              type="text" 
              value={editing ? form.last_name : profile.last_name} 
              onChange={e => setForm({...form, last_name: e.target.value})}
              disabled={!editing} 
              className={`w-full border rounded-lg px-3 py-2 text-[13px] text-gray-700 transition-colors ${editing ? 'border-ustpBlue/40 bg-white focus:outline-none focus:ring-2 focus:ring-ustpBlue/20' : 'border-gray-100 bg-gray-50 cursor-not-allowed'}`} 
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Contact Number</label>
            <input 
              type="text" 
              value={editing ? form.phone : (profile.phone || 'Not Set')} 
              onChange={e => setForm({...form, phone: e.target.value})}
              disabled={!editing} 
              className={`w-full border rounded-lg px-3 py-2 text-[13px] text-gray-700 transition-colors ${editing ? 'border-ustpBlue/40 bg-white focus:outline-none focus:ring-2 focus:ring-ustpBlue/20' : 'border-gray-100 bg-gray-50 cursor-not-allowed'}`} 
            />
          </div>
        </div>

        {editing && (
          <p className="text-[11px] text-gray-400 mt-4 italic">
            * Greyed fields are managed by the Registrar and cannot be changed here.
          </p>
        )}
      </div>
    </div>
  );
}