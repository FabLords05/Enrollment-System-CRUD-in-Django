from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Term, Course, Instructor, Subject, ClassOffering
from .serializers import TermSerializer, CourseSerializer, InstructorSerializer, SubjectSerializer, ClassOfferingSerializer

class TermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class InstructorViewSet(viewsets.ModelViewSet):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticated]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class ClassOfferingViewSet(viewsets.ModelViewSet):
    queryset = ClassOffering.objects.all()
    serializer_class = ClassOfferingSerializer
    permission_classes = [IsAuthenticated]
