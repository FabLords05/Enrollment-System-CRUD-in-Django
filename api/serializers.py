from rest_framework import serializers
from .models import Student, Teacher, Course, Section, Enrollment

class StudentSerializer(serializers.ModelSerializer):
    total_units = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    # (crosses arms) Read-only so you don't accidentally try to write to it!
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = Section
        fields = '__all__'