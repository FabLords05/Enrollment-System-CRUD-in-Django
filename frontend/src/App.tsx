import Profile from './component/Profile';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StudentList from './component/StudentList';
import TeacherList from './component/TeacherList';
import CourseList from './component/CourseList';
import SectionList from './component/SectionList';
import EnrollmentList from './component/EnrollmentList';
import EnrollmentSummary from './component/EnrollmentSummary';
import BulkEnrollmentForm from './component/BulkEnrollmentForm';
import Login from './component/Login';
import Register from './component/Register';
import Activate from './component/Activate';

type Section = 'students' | 'teachers' | 'courses' | 'sections' | 'enrollments' | 'summary' | 'bulk-enroll' | 'profile';

const NAV_ITEMS: { key: Section; label: string; icon: string }[] = [
  { key: 'students', label: 'Students', icon: '👤' },
  { key: 'teachers', label: 'Teachers', icon: '🎓' },
  { key: 'courses', label: 'Courses', icon: '📚' },
  { key: 'sections', label: 'Sections', icon: '🏫' },
  { key: 'enrollments', label: 'Enrollments', icon: '📋' },
  { key: 'summary', label: 'Summary', icon: '📊' },
  { key: 'bulk-enroll', label: 'Bulk Enroll', icon: '⚡' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

function App() {
  const [activeSection, setActiveSection] = useState<Section>('students');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'students': return <StudentList />;
      case 'teachers': return <TeacherList />;
      case 'courses': return <CourseList />;
      case 'sections': return <SectionList />;
      case 'enrollments': return <EnrollmentList />;
      case 'summary': return <EnrollmentSummary />;
      case 'bulk-enroll': return <BulkEnrollmentForm />;
      case 'profile': return <Profile />;
      default: return <StudentList />;
    }
  };

  const activeLabel = NAV_ITEMS.find(n => n.key === activeSection)?.label || '';

  const dashboardContent = (
    <div className="ustp-app">
      {/* Sidebar */}
      <aside className={`ustp-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="ustp-logo-mark">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#F5C518" stroke="#1a3a6b" strokeWidth="2"/>
              <circle cx="20" cy="20" r="6" fill="#1a3a6b"/>
              <circle cx="20" cy="8" r="3" fill="#1a3a6b"/>
              <circle cx="20" cy="32" r="3" fill="#1a3a6b"/>
              <circle cx="8" cy="20" r="3" fill="#1a3a6b"/>
              <circle cx="32" cy="20" r="3" fill="#1a3a6b"/>
              <line x1="20" y1="8" x2="20" y2="32" stroke="#1a3a6b" strokeWidth="1.5"/>
              <line x1="8" y1="20" x2="32" y2="20" stroke="#1a3a6b" strokeWidth="1.5"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div className="sidebar-brand">
              <span className="brand-ustp">USTP</span>
              <span className="brand-sub">Enrollment System</span>
            </div>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
              {activeSection === item.key && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ustp-main">
        {/* Top bar */}
        <header className="ustp-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span className="breadcrumb-root">USTP</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">{activeLabel}</span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">
              <span className="badge-dot" />
              <span>Academic Year 2025–2026</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="ustp-content">
          <div className="content-card">
            {renderSection()}
          </div>
        </main>

        <footer className="ustp-footer">
          <p>© 2026 University of Science and Technology of Southern Philippines · Cagayan de Oro Campus</p>
        </footer>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/activate/:uid/:token" element={<Activate />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : dashboardContent} />
        <Route path="/" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : dashboardContent} />
      </Routes>
    </Router>
  );
}

export default App;