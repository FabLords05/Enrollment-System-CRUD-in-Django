from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Sum
from django.contrib.auth import get_user_model

User = get_user_model()

class Student(models.Model):   
    first_name = models.ManyToManyField(User, related_name='students') # Link to User model for authentication.
    last_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    age = models.IntegerField()

    @property
    def total_units(self):
        # Calculate total enrolled units.
        total = self.enrollment_set.aggregate(total=Sum('section__course__units'))['total']
        return total if total is not None else 0

    def __str__(self):
        return f"{self.last_name}, {self.first_name}"

class Teacher(models.Model):
    teacher_name = models.CharField(max_length=255)
    email = models.EmailField() # Using EmailField is better than varchar, trust me.

    def __str__(self):
        return self.teacher_name

class Course(models.Model):
    course_name = models.CharField(max_length=255)
    units = models.IntegerField()
    # Relationship: Each course is taught by one teacher. (FK)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.course_name

class Section(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    max_capacity = models.PositiveIntegerField(default=30) # Section capacity control.

    def __str__(self):
        return f"{self.course.name} - {self.name}"

    @property
    def is_full(self):
        return self.enrollment_set.count() >= self.max_capacity

class Enrollment(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    date_enrolled = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate enrollment in the exact same section.
        unique_together = ('student', 'section')

    def clean(self):
        # Prevent duplicate enrollment in the same course across different sections.
        if Enrollment.objects.filter(student=self.student, section__course=self.section.course).exclude(pk=self.pk).exists():
            raise ValidationError("This idiot... I mean, student is already enrolled in this course!")

        # Enforce max students per section
        if self.section.is_full:
            raise ValidationError("This section is full! Can't you count?!")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)