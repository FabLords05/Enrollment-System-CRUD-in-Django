from django.db import models

class Term(models.Model):
    name = models.CharField(max_length=100)  # e.g., "AY 2026-2027, 1st Semester"
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    units = models.IntegerField(default=3)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Instructor(models.Model):
    nm = models.CharField(max_length=100, verbose_name="Full Name")
    email = models.EmailField(unique=True)
    dept = models.CharField(max_length=50, blank=True, null=True, verbose_name="Department")
    spec = models.CharField(max_length=100, blank=True, null=True, verbose_name="Specialization")

    def __str__(self):
        return self.nm


class Subject(models.Model):
    code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    name = models.CharField(max_length=100, verbose_name="Subject Title")
    units = models.IntegerField(default=3)

    @property
    def nm(self):
        return f"{self.code} - {self.name}"

    def __str__(self):
        return self.nm


class ClassOffering(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='offerings')
    section = models.ForeignKey('scheduling.Section', on_delete=models.CASCADE, related_name='offerings')
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_offerings')
    days = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.subject} · {self.section.name} · {self.days} {self.start_time}-{self.end_time}"
