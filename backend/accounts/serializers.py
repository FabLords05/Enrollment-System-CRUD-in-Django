from rest_framework import serializers
from .models import BaseUser, StudentProfile, RegistrarProfile, CashierProfile
from academics.models import Course

class StudentProfileSerializer(serializers.ModelSerializer):
    # Accept program as a foreign key ID, return read-only program details
    program_enrolled = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), allow_null=True, required=False)
    program_code = serializers.SerializerMethodField(read_only=True)
    program_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ['student_id', 'program_enrolled', 'program_code', 'program_name', 'year_level', 'enrollment_status']

    def get_program_code(self, obj):
        prog = getattr(obj, 'program_enrolled', None)
        if prog is None:
            return None
        # If FK resolved to a Course instance
        if hasattr(prog, 'code'):
            return prog.code
        # If legacy string value still present in DB
        if isinstance(prog, str):
            return prog
        return None

    def get_program_name(self, obj):
        prog = getattr(obj, 'program_enrolled', None)
        if prog is None:
            return None
        if hasattr(prog, 'name'):
            return prog.name
        if isinstance(prog, str):
            return prog
        return None

class UserSerializer(serializers.ModelSerializer):
    # These nested serializers allow the API to return profile data alongside the user's email
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = BaseUser
        fields = ['id', 'email', 'role', 'first_name', 'last_name', 'student_profile']