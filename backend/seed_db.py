import os
import django

# 1. Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

# 2. Import the models
from accounts.models import BaseUser, StudentProfile
from academics.models import Term, Course
from scheduling.models import Room, TimeSlot, Section

def seed_database():
    print("🌱 Starting database seeding process...")

    # --- USERS & ROLES ---
    print("Creating core staff accounts...")
    admin, _ = BaseUser.objects.get_or_create(email="admin@gmail.com", defaults={"role": "ADMIN"})
    if _: admin.set_password("password123"); admin.is_staff=True; admin.is_superuser=True; admin.save()

    registrar, _ = BaseUser.objects.get_or_create(email="registrar@gmail.com", defaults={"role": "REGISTRAR"})
    if _: registrar.set_password("password123"); registrar.save()

    cashier, _ = BaseUser.objects.get_or_create(email="cashier@gmail.com", defaults={"role": "CASHIER"})
    if _: cashier.set_password("password123"); cashier.save()

    print("Creating student accounts...")
    for i in range(1, 6):
        student, created = BaseUser.objects.get_or_create(
            email=f"student{i}@school.edu", 
            defaults={"role": "STUDENT", "first_name": f"Student", "last_name": f"{i}"}
        )
        if created:
            student.set_password("password123")
            student.save()
            # The post_save signal automatically creates the StudentProfile, so we just update it:
            profile = student.student_profile
            profile.student_id = f"2026-000{i}"
            # Leave program unset for seeded students; set programs explicitly later if desired
            profile.program_enrolled = None
            profile.save()

    # --- ACADEMICS ---
    print("Creating academic terms and courses...")
    term_1, _ = Term.objects.get_or_create(name="AY 2026-2027, 1st Semester", defaults={"is_active": True})
    term_2, _ = Term.objects.get_or_create(name="AY 2026-2027, 2nd Semester", defaults={"is_active": False})

    course_cs101, _ = Course.objects.get_or_create(code="CS101", defaults={"name": "Introduction to Programming", "units": 3})
    course_math101, _ = Course.objects.get_or_create(code="MATH101", defaults={"name": "Calculus 1", "units": 3})
    course_eng101, _ = Course.objects.get_or_create(code="ENG101", defaults={"name": "English Composition", "units": 3})

    # --- SCHEDULING ---
    print("Creating rooms, time slots, and sections...")
    room_a, _ = Room.objects.get_or_create(name="Lab A")
    room_b, _ = Room.objects.get_or_create(name="Room 101")

    ts_morning, _ = TimeSlot.objects.get_or_create(day_of_week="MWF", start_time="08:00:00", end_time="09:00:00")
    ts_afternoon, _ = TimeSlot.objects.get_or_create(day_of_week="TTh", start_time="13:00:00", end_time="14:30:00")

    Section.objects.get_or_create(
        term=term_1, course=course_cs101, name="CS101-A",
        defaults={"capacity": 40, "room": room_a, "time_slot": ts_morning}
    )
    Section.objects.get_or_create(
        term=term_1, course=course_math101, name="MATH101-A",
        defaults={"capacity": 40, "room": room_b, "time_slot": ts_afternoon}
    )

    print("✅ Seeding complete! You can now log in with the generated accounts.")
    print("Admin: admin@gmail.com | Pass: password123")
    print("Student: student1@gmail.com | Pass: password123")

if __name__ == '__main__':
    seed_database()