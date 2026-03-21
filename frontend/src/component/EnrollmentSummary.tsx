import React, { useState, useEffect } from 'react';
import {
  Enrollment,
  Student,
  Course,
  Section,
  getEnrollments,
  getStudents,
  getCourses,
  getSections,
} from '../api';

export const EnrollmentSummary: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollmentsData, studentsData, coursesData, sectionsData] = await Promise.all([
        getEnrollments(),
        getStudents(),
        getCourses(),
        getSections(),
      ]);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setCourses(coursesData);
      setSections(sectionsData);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate summary statistics
  const totalEnrollments = enrollments.length;
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalSections = sections.length;

  // Calculate total enrolled units
  const totalEnrolledUnits = students.reduce((total, student) => {
    const studentEnrollments = enrollments.filter(e => e.student === student.id);
    const studentUnits = studentEnrollments.reduce((units, enrollment) => {
      const section = sections.find(s => s.id === enrollment.section);
      const course = courses.find(c => c.id === section?.course);
      return units + (course?.units || 0);
    }, 0);
    return total + studentUnits;
  }, 0);

  // Calculate section utilization
  const sectionUtilization = sections.map(section => {
    const enrollmentCount = enrollments.filter(e => e.section === section.id).length;
    const utilizationRate = section.max_capacity > 0 ? (enrollmentCount / section.max_capacity) * 100 : 0;
    return {
      ...section,
      enrolled: enrollmentCount,
      utilizationRate: Math.round(utilizationRate),
    };
  });

  // Get most popular courses
  const coursePopularity = courses.map(course => {
    const courseSections = sections.filter(s => s.course === course.id);
    const totalEnrollments = courseSections.reduce((total, section) => {
      return total + enrollments.filter(e => e.section === section.id).length;
    }, 0);
    return {
      ...course,
      totalEnrollments,
    };
  }).sort((a, b) => b.totalEnrollments - a.totalEnrollments);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Enrollment Summary</h2>
        <p className="text-gray-600 mt-2">Overview of enrollment statistics and system utilization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.414l4 4v10.172A2 2 0 0114 16H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Courses</p>
              <p className="text-2xl font-bold text-green-900">{totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Sections</p>
              <p className="text-2xl font-bold text-purple-900">{totalSections}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-orange-900">{totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Total Units */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Enrolled Units</h3>
          <div className="text-3xl font-bold text-indigo-600">{totalEnrolledUnits}</div>
          <p className="text-sm text-gray-600 mt-2">Total units enrolled across all students</p>
        </div>

        {/* Section Utilization */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Utilization</h3>
          <div className="space-y-3">
            {sectionUtilization.slice(0, 5).map(section => {
              const course = courses.find(c => c.id === section.course);
              return (
                <div key={section.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {course?.course_name} - {section.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {section.enrolled}/{section.max_capacity} students
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          section.utilizationRate >= 90 ? 'bg-red-500' :
                          section.utilizationRate >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(section.utilizationRate, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{section.utilizationRate}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Most Popular Courses */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Courses</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Enrollments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coursePopularity.slice(0, 10).map(course => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.course_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.totalEnrollments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSummary;