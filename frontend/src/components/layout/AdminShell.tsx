import React from 'react';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';
import RequestsManager from '../admin/RequestsManager';

interface AdminShellProps {
  onLogout: () => void;
  children: React.ReactNode; 
  activePage: string;
  setActivePage: (page: string) => void;
  pendingRequestsCount?: number;
}

export function AdminShell({ 
  onLogout, 
  children, 
  activePage, 
  setActivePage, 
  pendingRequestsCount = 0 
}: AdminShellProps) {
  
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'students', label: 'Students', icon: 'users' },
    { id: 'sections', label: 'Sections', icon: 'grid' },
    { id: 'subjects', label: 'Subjects', icon: 'book' },
    { id: 'instructors', label: 'Instructors', icon: 'users' },
    { id: 'schedules', label: 'Schedules', icon: 'cal' },
    { id: 'requests', label: 'Change Requests', icon: 'doc', badge: pendingRequestsCount },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      <div className="w-[236px] bg-ustpDarkBlue text-white flex flex-col fixed inset-y-0 left-0 z-50">
        
        <div className="pt-4 px-5 pb-3 border-b border-white/10">
          <div className="bg-ustpGold text-ustpDarkBlue font-bold text-[10px] px-2 py-0.5 rounded inline-block mb-1 tracking-wide">
            EduTrack Portal
          </div>
          <div className="text-sm font-bold text-white leading-tight">Admin Portal</div>
          <div className="text-[10px] text-white/45 mt-0.5">Enrollment Management System</div>
        </div>

        <div className="flex-1 overflow-y-auto py-2.5">
          <div className="px-4 py-2 text-[9px] font-semibold text-white/30 tracking-wider uppercase">
            Management
          </div>
          {nav.map(n => (
            <div 
              key={n.id} 
              className={`flex items-center gap-2.5 py-2.5 px-4 cursor-pointer text-[13px] transition-all border-l-[3px] relative ${
                activePage === n.id 
                  ? 'bg-ustpGold/15 text-ustpGold border-ustpGold' 
                  : 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
              }`}
              onClick={() => setActivePage(n.id)}
            >
              <Icon name={n.icon} size={15} />
              <span>{n.label}</span>
              {n.badge && n.badge > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ustpGold" />
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/10 flex items-center gap-2.5">
          <Avatar init="A" size={30} gold />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">Administrator</div>
            <div className="text-[10px] text-white/40">Full Access</div>
          </div>
          <button 
            onClick={onLogout}
            className="text-white/45 hover:text-ustpGold p-1 rounded transition-colors"
          >
            <Icon name="logout" size={14} />
          </button>
        </div>
      </div>

      <div className="ml-[236px] flex-1 flex flex-col min-w-0">
        
        <div className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="text-[17px] font-extrabold text-ustpDarkBlue">
            {nav.find(n => n.id === activePage)?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
              SY 2025–2026
            </span>
            <Avatar init="A" size={30} gold />
          </div>
        </div>

        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
      
    </div>
  );
}