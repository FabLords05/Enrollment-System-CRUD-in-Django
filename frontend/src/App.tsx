import React, { useState } from 'react';
import './App.css';
import StudentList from './component/StudentList';
import TeacherList from './component/TeacherList';
import CourseList from './component/CourseList';
import SectionList from './component/SectionList';
import EnrollmentList from './component/EnrollmentList';
import EnrollmentSummary from './component/EnrollmentSummary';
import BulkEnrollmentForm from './component/BulkEnrollmentForm';

type Section = 'students' | 'teachers' | 'courses' | 'sections' | 'enrollments' | 'summary' | 'bulk-enroll';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('students');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold">Enrollment Management System</h1>
          <p className="text-blue-100 mt-2">Manage Students, Teachers, Courses & Enrollments</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveSection('students')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'students'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Students
              </span>
            </button>

            <button
              onClick={() => setActiveSection('teachers')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'teachers'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM2 15a4 4 0 008 0v2H2v-2z" />
                </svg>
                Teachers
              </span>
            </button>

            <button
              onClick={() => setActiveSection('courses')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'courses'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.414l4 4v10.172A2 2 0 0114 16H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6z" />
                </svg>
                Courses
              </span>
            </button>

            <button
              onClick={() => setActiveSection('sections')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'sections'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Sections
              </span>
            </button>

            <button
              onClick={() => setActiveSection('enrollments')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'enrollments'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Enrollments
              </span>
            </button>

            <button
              onClick={() => setActiveSection('summary')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'summary'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Summary
              </span>
            </button>

            <button
              onClick={() => setActiveSection('bulk-enroll')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-all duration-200 border-b-4 ${
                activeSection === 'bulk-enroll'
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12 6a1 1 0 110-2 1 1 0 010 2zM9 9a1 1 0 100-2 1 1 0 000 2zM7 13a1 1 0 110-2 1 1 0 010 2zM13 11a1 1 0 100-2 1 1 0 000 2zM15 15a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Bulk Enroll
              </span>
            </button>
          </nav>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow-md">
          {renderSection()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2026 Enrollment Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
