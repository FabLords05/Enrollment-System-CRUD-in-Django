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

type Section = 'students' | 'teachers' | 'courses' | 'sections' | 'enrollments' | 'summary' | 'bulk-enroll';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('students');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

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
    localStorage.removeItem('refresh_token'); // Good practice to remove both
    setToken(null);
    setIsAuthenticated(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'students':
        return <StudentList />;
      case 'teachers':
        return <TeacherList />;
      case 'courses':
        return <CourseList />;
      case 'sections':
        return <SectionList />;
      case 'enrollments':
        return <EnrollmentList />;
      case 'summary':
        return <EnrollmentSummary />;
      case 'bulk-enroll':
        return <BulkEnrollmentForm />;
      default:
        return <StudentList />;
    }
  };

  // --- YOUR EXISTING DASHBOARD UI ---
  const dashboardContent = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Enrollment Management System</h1>
              <p className="text-blue-100 mt-2">Manage Students, Teachers, Courses & Enrollments</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <nav className="flex flex-wrap">
            <button onClick={() => setActiveSection('students')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'students' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Students</button>
            <button onClick={() => setActiveSection('teachers')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'teachers' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Teachers</button>
            <button onClick={() => setActiveSection('courses')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'courses' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Courses</button>
            <button onClick={() => setActiveSection('sections')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'sections' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Sections</button>
            <button onClick={() => setActiveSection('enrollments')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'enrollments' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Enrollments</button>
            <button onClick={() => setActiveSection('summary')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'summary' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Summary</button>
            <button onClick={() => setActiveSection('bulk-enroll')} className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${activeSection === 'bulk-enroll' ? 'bg-blue-50 text-blue-600 border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Bulk Enroll</button>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {renderSection()}
        </div>
      </div>

      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2026 Enrollment Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // --- THE ROUTER ---
  return (
    <Router>
      <Routes>
        {/* Email Activation Route */}
        <Route path="/activate/:uid/:token" element={<Activate />} />
        
        {/* Registration Route */}
        <Route path="/register" element={<Register />} />
        
        {/* Login Route */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : dashboardContent} 
        />
        
        {/* Main Home Route (Redirects to Login if not authenticated) */}
        <Route 
          path="/" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : dashboardContent} 
        />
      </Routes>
    </Router>
  );
}

export default App;