from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# 1. Import the SimpleJWT serializer and view
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


# 2. Import ALL your viewsets (Old and New)
from enrollment.views import (
    EnrollmentRecordViewSet, 
    EnrolledClassViewSet,
    SectionViewSet, 
    InstructorViewSet, 
    SubjectViewSet, 
    StudentProfileViewSet, 
    ChangeRequestViewSet
)
# Add these imports at the top
from academics.views import TermViewSet, CourseViewSet
from scheduling.views import RoomViewSet, TimeSlotViewSet

# 3. Your custom serializer to inject the 'role'
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role 
        return token

# 4. Your custom view that uses the new serializer
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# 5. Register ALL endpoints to the router
router = DefaultRouter()
# Original endpoints
router.register(r'enrollments', EnrollmentRecordViewSet, basename='enrollment')
router.register(r'enrolled-classes', EnrolledClassViewSet, basename='enrolled-class')
# New Phase 7 Admin Panel endpoints
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'students', StudentProfileViewSet, basename='student')
router.register(r'requests', ChangeRequestViewSet, basename='request')
# Add these below your existing router.register lines
router.register(r'terms', TermViewSet, basename='term')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'timeslots', TimeSlotViewSet, basename='timeslot')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 6. Point the login route to your Custom view!
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/', include(router.urls)),
]