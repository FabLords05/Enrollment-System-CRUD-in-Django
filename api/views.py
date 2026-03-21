from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import Student, Teacher, Course, Section, Enrollment
from .serializers import StudentSerializer, TeacherSerializer, CourseSerializer, EnrollmentSerializer, SectionSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    # (points) This is the bulk enrollment action I told you about!
    @action(detail=False, methods=['post'])
    def bulk_enroll(self, request):
        student_id = request.data.get('student')
        section_ids = request.data.get('sections', [])

        # Validate request payload
        if not student_id or not isinstance(section_ids, list) or len(section_ids) == 0:
            return Response(
                {"error": "A student ID and a list of section IDs are required, idiot!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrolled = []
        errors = []

        # Attempt to enroll the student in each section
        for section_id in section_ids:
            data = {'student': student_id, 'section': section_id}
            serializer = self.get_serializer(data=data)
            
            if serializer.is_valid():
                try:
                    # This triggers the model's save() method, which in turn calls clean()
                    serializer.save()
                    enrolled.append(serializer.data)
                except ValidationError as e:
                    # Catches full capacity or duplicate enrollment errors
                    errors.append({"section": section_id, "error": list(e.messages)})
            else:
                errors.append({"section": section_id, "error": serializer.errors})

        # Return a 207 Multi-Status if there were partial failures, otherwise 201 Created
        response_status = status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED
        
        return Response({
            "successfully_enrolled": enrolled,
            "failed_enrollments": errors
        }, status=response_status)