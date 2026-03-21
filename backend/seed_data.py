import os
import sys
import django
import random
from pathlib import Path

# Ensure the project root is on path so backend package imports resolve
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Student, Teacher, Course, Section

def run():
    Teacher.objects.all().delete()
    Student.objects.all().delete()
    Course.objects.all().delete()
    Section.objects.all().delete()

    teachers_data = [
        {"teacher_name":"Alice Morgan","email":"alice.morgan@example.com"},
        {"teacher_name":"Brian Cole","email":"brian.cole@example.com"},
    ]
    teachers = []
    for t in teachers_data:
        teachers.append(Teacher.objects.create(**t))

    courses_data = [
        {"course_name":"Mathematics","units":3,"teacher":teachers[0]},
        {"course_name":"Physics","units":4,"teacher":teachers[0]},
        {"course_name":"Chemistry","units":3,"teacher":teachers[1]},
        {"course_name":"Biology","units":3,"teacher":teachers[1]},
        {"course_name":"Literature","units":2,"teacher":teachers[0]},
    ]
    courses = []
    for c in courses_data:
        courses.append(Course.objects.create(**c))

    sections_data = []
    sec_idx = 1
    for course in courses:
        for sec_name in ['A', 'B']:
            sections_data.append({
                "course": course,
                "name": f"{course.course_name[:3].upper()}-{sec_name}",
                "max_capacity": 10,
            })
            sec_idx += 1

    sections = []
    for sc in sections_data:
        sections.append(Section.objects.create(**sc))

    first_names = ["Liam","Noah","William","James","Oliver","Benjamin","Elijah","Lucas","Mason","Logan","Ethan","Aiden","Jacob","Michael","Daniel","Henry","Jackson","Sebastian","Avery","Matthew","Samuel","David","Joseph","Carter","Owen","Wyatt","John","Jack","Luke","Jayden"]
    last_names = ["Smith","Johnson","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker"]

    for i in range(30):
        Student.objects.create(
            first_name=first_names[i],
            last_name=last_names[i],
            email=f"{first_names[i].lower()}.{last_names[i].lower()}@example.com",
            age=random.randint(18, 26),
        )

    print(f"Seed complete: {len(teachers)} teachers, {len(courses)} courses, {len(sections)} sections, {Student.objects.count()} students.")

if __name__ == "__main__":
    run()