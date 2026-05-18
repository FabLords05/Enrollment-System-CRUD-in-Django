from django.db import models
from academics.models import Course, Term

class Section(models.Model):
    term = models.ForeignKey(Term, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    capacity = models.IntegerField(default=40)

    def __str__(self):
        return f"{self.course.code} - {self.name}"