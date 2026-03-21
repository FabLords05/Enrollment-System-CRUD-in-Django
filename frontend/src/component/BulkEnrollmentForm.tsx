import React, { useState, useEffect } from 'react';
import {
  Student,
  Section,
  Course,
  Enrollment,
  getStudents,
  getSections,
  getCourses,
  getEnrollments,
  bulkEnrollStudent,
} from '../api';

const BulkEnrollmentForm: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<number>(-1);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [unitLimit, setUnitLimit] = useState<number>(21);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, sectionsData, coursesData, enrollmentsData] = await Promise.all([
          getStudents(),
          getSections(),
          getCourses(),
          getEnrollments(),
        ]);
        setStudents(studentsData);
        setSections(sectionsData);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get course by ID
  const getCourseById = (courseId: number): Course | undefined => {
    return courses.find(c => c.id === courseId);
  };

  // Get section with course details
  const getSectionDetails = (section: Section) => {
    const course = getCourseById(section.course);
    return {
      name: `${course?.course_name || 'Unknown'} - ${section.name}`,
      units: course?.units || 0,
    };
  };

  // Calculate total units for selected sections
  const getTotalSelectedUnits = (): number => {
    return selectedSections.reduce((total, sectionId) => {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        const course = getCourseById(section.course);
        return total + (course?.units || 0);
      }
      return total;
    }, 0);
  };

  // Get current student's enrolled units
  const getStudentCurrentUnits = (): number => {
    if (selectedStudent === -1) return 0;
    const studentEnrollments = enrollments.filter(e => e.student === selectedStudent);
    return studentEnrollments.reduce((total, enrollment) => {
      const section = sections.find(s => s.id === enrollment.section);
      if (section) {
        const course = getCourseById(section.course);
        return total + (course?.units || 0);
      }
      return total;
    }, 0);
  };

  // Get projected total units
  const getProjectedUnits = (): number => {
    return getStudentCurrentUnits() + getTotalSelectedUnits();
  };

  // Handle section toggle with validation
  const handleSectionToggle = (sectionId: number) => {
    const isSelected = selectedSections.includes(sectionId);
    let newSelected: number[];

    if (isSelected) {
      newSelected = selectedSections.filter(id => id !== sectionId);
    } else {
      newSelected = [...selectedSections, sectionId];
    }

    // Check if the new selection would exceed the unit limit
    const newProjectedUnits = getStudentCurrentUnits() + newSelected.reduce((total, sid) => {
      const section = sections.find(s => s.id === sid);
      if (section) {
        const course = getCourseById(section.course);
        return total + (course?.units || 0);
      }
      return total;
    }, 0);

    if (newProjectedUnits > unitLimit) {
      setMessageType('warning');
      setStatusMessage(`Cannot exceed unit limit! Current: ${getStudentCurrentUnits()} + Selected: ${getTotalSelectedUnits()} = ${newProjectedUnits} units (Maximum: ${unitLimit})`);
      return;
    }

    setMessageType('');
    setStatusMessage('');
    setSelectedSections(newSelected);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudent === -1 || selectedSections.length === 0) {
      setMessageType('error');
      setStatusMessage('Please select a student and at least one section.');
      return;
    }

    if (getProjectedUnits() > unitLimit) {
      setMessageType('error');
      setStatusMessage(`Total units (${getProjectedUnits()}) exceeds the limit of ${unitLimit}. Please remove some courses.`);
      return;
    }

    try {
      const result = await bulkEnrollStudent(selectedStudent, selectedSections);
      
      if (result.failed_enrollments && result.failed_enrollments.length > 0) {
        // Format error messages for readability
        let errorDetails = result.failed_enrollments
          .map((err: any) => {
            const section = sections.find(s => s.id === err.section);
            const course = section ? getCourseById(section.course) : null;
            const sectionName = course ? `${course.course_name} - ${section?.name}` : `Section ${err.section}`;
            
            // Parse error message for user-friendly display
            let errorMsg = '';
            if (Array.isArray(err.error)) {
              errorMsg = err.error.join('; ');
            } else if (typeof err.error === 'object' && err.error !== null) {
              const firstError = Object.values(err.error)[0];
              if (Array.isArray(firstError)) {
                errorMsg = firstError.join('; ');
              } else {
                errorMsg = String(firstError);
              }
            } else {
              errorMsg = String(err.error);
            }
            
            return `${sectionName}: ${errorMsg}`;
          })
          .join('\n');
        
        setMessageType('warning');
        setStatusMessage(
          `Enrollment completed with issues:\n\nSuccessfully enrolled: ${result.successfully_enrolled?.length || 0} course(s)\nFailed: ${result.failed_enrollments.length} course(s)\n\nFailure details:\n${errorDetails}`
        );
      } else {
        setMessageType('success');
        setStatusMessage('Success! Student has been enrolled in all selected courses.');
        setSelectedSections([]);
        setSelectedStudent(-1);
        // Refresh enrollments
        const updatedEnrollments = await getEnrollments();
        setEnrollments(updatedEnrollments);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'An error occurred while enrolling the student.';
      setMessageType('error');
      setStatusMessage(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow-md">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  const currentUnits = getStudentCurrentUnits();
  const selectedUnits = getTotalSelectedUnits();
  const projectedUnits = getProjectedUnits();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Student Enrollment</h2>
        <p className="text-sm text-gray-600 mt-1">Enroll a student in multiple courses up to the unit limit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(Number(e.target.value));
              setStatusMessage('');
              setMessageType('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={-1}>-- Choose a student --</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.first_name} {student.last_name} (ID: {student.id})
              </option>
            ))}
          </select>
        </div>

        {/* Unit Limit Editor */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Unit Limit (Editable)
          </label>
          <input
            type="number"
            min="1"
            value={unitLimit}
            onChange={(e) => setUnitLimit(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-600">Default is 21 units, adjust as needed</p>
        </div>

        {/* Unit Information */}
        {selectedStudent !== -1 && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Current Enrolled Units:</span>
              <span className="font-semibold text-blue-700">{currentUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Selected Units:</span>
              <span className="font-semibold text-blue-700">{selectedUnits}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Projected Total:</span>
              <span className={`font-bold text-lg ${projectedUnits > unitLimit ? 'text-red-700' : 'text-green-700'}`}>
                {projectedUnits} / {unitLimit}
              </span>
            </div>
          </div>
        )}

        {/* Section Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Sections to Enroll In
          </label>
          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {sections.length === 0 ? (
              <p className="text-gray-500 text-sm">No sections available</p>
            ) : (
              sections.map(section => {
                const details = getSectionDetails(section);
                const isSelected = selectedSections.includes(section.id);
                return (
                  <label
                    key={section.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-100 border-blue-400'
                        : section.is_full
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    } ${section.is_full ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSectionToggle(section.id)}
                      disabled={section.is_full}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{details.name}</div>
                      <div className="text-sm text-gray-600">
                        {details.units} units {section.is_full && '(FULL)'}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedStudent === -1 || selectedSections.length === 0 || getProjectedUnits() > unitLimit}
          >
            Enroll in Selected Sections
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedSections([]);
              setStatusMessage('');
              setMessageType('');
            }}
            className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Clear Selection
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-lg whitespace-pre-line font-medium ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : messageType === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : messageType === 'warning'
                ? 'bg-amber-50 border border-amber-200 text-amber-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default BulkEnrollmentForm;