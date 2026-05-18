from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

# Models and Serializers
# Import from the local enrollment app
from .models import EnrollmentRecord, EnrolledClass
from .models import PaymentTransaction
from .serializers import PaymentTransactionSerializer

# Import from your other apps!
from academics.models import Instructor, Subject
from scheduling.models import Section
from accounts.models import StudentProfile, ChangeRequest

from .serializers import (
    EnrollmentRecordSerializer, EnrolledClassSerializer, 
    SectionSerializer, InstructorSerializer, SubjectSerializer, 
    StudentProfileSerializer, ChangeRequestSerializer, PaymentTransactionSerializer
)


# Custom Permissions
from accounts.permissions import IsStudent, IsRegistrar, IsAdminUserRole, IsCashier

# --- YOUR EXISTING SECURED VIEWS ---

class EnrollmentRecordViewSet(viewsets.ModelViewSet):
    queryset = EnrollmentRecord.objects.all()
    serializer_class = EnrollmentRecordSerializer
    
    def get_permissions(self):
        permission_classes = [IsAuthenticated, IsAdminUserRole | IsStudent | IsRegistrar | IsCashier]  # Add IsCashier if you want them to see transactions too!
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.request.user.role == 'STUDENT':
            return self.queryset.filter(student__user=self.request.user)
        return self.queryset

class EnrolledClassViewSet(viewsets.ModelViewSet):
    queryset = EnrolledClass.objects.all()
    serializer_class = EnrolledClassSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsStudent | IsRegistrar | IsCashier]

# --- THE NEW PHASE 7 VIEWS (Add RBAC here too if you want!) ---

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    # Example: Only Admins and Registrars can mess with sections!
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsRegistrar | IsStudent | IsCashier]  # You can adjust this as needed

class InstructorViewSet(viewsets.ModelViewSet):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsRegistrar | IsStudent | IsCashier]  # Adjust as needed

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsRegistrar | IsStudent | IsCashier]  # Adjust as needed

    def get_queryset(self):
        user = self.request.user
        
        # 1. If the user is a STUDENT, strictly filter the subjects
        if user.role == 'STUDENT':
            # Check if they actually have a profile and a section assigned
            if hasattr(user, 'student_profile') and user.student_profile.section_id:
                # ONLY return catalog subjects that are offered to the student's section
                return Subject.objects.filter(offerings__section_id=user.student_profile.section_id).distinct()
            
            # If they don't have a section assigned yet, return an empty list
            return Subject.objects.none()
        
        # 2. If the user is an ADMIN or REGISTRAR, let them see everything
        return self.queryset
    
class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsRegistrar | IsStudent | IsCashier]  # Adjust as needed

class ChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = ChangeRequest.objects.all()
    serializer_class = ChangeRequestSerializer
    # Everyone needs access to requests (Students to make them, Admins to approve them)
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsStudent | IsRegistrar | IsCashier]

class PaymentTransactionViewSet(viewsets.ModelViewSet):
    queryset = PaymentTransaction.objects.all().order_by('-date_paid')
    serializer_class = PaymentTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole | IsCashier] # Add IsCashier to your permissions if you have it!