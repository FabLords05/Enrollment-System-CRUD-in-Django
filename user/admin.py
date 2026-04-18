from django.contrib import admin
from api.models import Student, Course
from .models import User
from django.contrib.auth import get_user_model

User = get_user_model()

admin.site.register(User)
admin.site.register(Student)
admin.site.register(Course)
