from rest_framework import serializers
from .models import Term, Course, Instructor, Subject, ClassOffering

class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    prerequisites = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    nm = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'code', 'name', 'units', 'nm']

    def get_nm(self, obj):
        return f"{obj.code} - {obj.name}"


class ClassOfferingSerializer(serializers.ModelSerializer):
    subject_title = serializers.CharField(source='subject.nm', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_units = serializers.IntegerField(source='subject.units', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.nm', read_only=True)

    class Meta:
        model = ClassOffering
        fields = [
            'id',
            'subject',
            'subject_title',
            'subject_code',
            'subject_units',
            'section',
            'section_name',
            'instructor',
            'instructor_name',
            'days',
            'start_time',
            'end_time',
            'room',
        ]
