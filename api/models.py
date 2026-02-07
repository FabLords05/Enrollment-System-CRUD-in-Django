from django.db import models

class Student(models.Model):
    # The ERD says student_id is PK. Django adds an 'id' automatically, 
    # but we can use your explicit ID if you want. 
    # However, standard Django usually uses 'id' as PK and keeps 'student_id' as a unique field.
    # I'll stick to standard Django PK for safety, but add your fields.
    
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    age = models.IntegerField()

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
    # Relationship: Each course is taught by one teacher (FK)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.course_name

class Enrollment(models.Model):
    # Relationship: Connects Student and Course
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_date = models.DateTimeField(auto_now_add=True) # "timestamp" in your drawing

    def __str__(self):
        return f"{self.student} enrolled in {self.course}"