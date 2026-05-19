#!/usr/bin/env python
"""
ASSESSMENT GENERATION GUIDE
============================

This document explains:
1. How to run the backfill script for existing students
2. How automatic Assessment generation works for future students  
3. Troubleshooting and alternative approaches
"""

# ============================================================================
# PART 1: RUNNING THE BACKFILL SCRIPT
# ============================================================================

"""
The backfill script `backend/generate_assessments.py` retroactively creates
Assessment records for all existing students with status ASSESSED or ADVISING.

PREREQUISITES:
- Django project must be fully configured and migrations applied
- All StudentProfile records must have a section assigned
- ClassOffering records must exist for those sections

USAGE:
    cd backend
    python generate_assessments.py

EXAMPLE OUTPUT:
    ================================================================================
    ASSESSMENT BACKFILL SCRIPT
    ================================================================================
    
    Using existing term: AY 2026-2027, 1st Semester
    
    Found 5 student(s) to process...
    
    [1/5] Processing john@example.com...
      ✓ SUCCESS: Assessment created
         Units: 9 | Amount: $7150
    [2/5] Processing jane@example.com...
      ✓ SUCCESS: Assessment created
         Units: 12 | Amount: $8350
    [3/5] Processing mark@example.com...
      ⊘ SKIP: Assessment already exists
    ...
    
    ================================================================================
    BACKFILL SUMMARY
    ================================================================================
    Success:  3
    Skipped:  1
    Errors:   1
    Total:    5


# ============================================================================
# PART 2: AUTOMATIC ASSESSMENT GENERATION FOR NEW STUDENTS
# ============================================================================

"""
WORKFLOW FOR NEW STUDENTS:

1. Student creates account and gets default status: ADVISING
   → No Assessment created (students haven't been evaluated yet)

2. Registrar reviews student and approves them
   → Updates StudentProfile.enrollment_status to: ASSESSED
   → Django signal automatically triggers Assessment creation

3. Student sees Assessment in dashboard
   → Can view total_units, total_amount, and balance_due
   → Can make payments

4. Student pays and Registrar marks as PAID
   → Assessment remains (not modified)
   → Student is officially enrolled


HOW THE AUTOMATION WORKS:

The system uses Django signals to listen for StudentProfile changes:

File: accounts/signals.py
Signal: @receiver(post_save, sender=StudentProfile)

When StudentProfile is saved, the signal:
1. Checks if enrollment_status changed to 'ASSESSED' or 'PAID'
2. Gets or creates the active Term
3. Gets or creates an EnrollmentRecord for student + term
4. Queries ClassOffering records for the student's section
5. Calculates total_units (sum of all subject units)
6. Calculates balance_due = (units * 400) + 3550
7. Creates Assessment with calculated values

ADVANTAGES:
✓ Automatic - no extra API call needed
✓ Transparent - happens silently in the background
✓ Idempotent - won't create duplicates if called multiple times
✓ Decoupled - works regardless of how StudentProfile is updated


# ============================================================================
# PART 3: REGISTRAR APPROVAL FLOW (FRONTEND/BACKEND)
# ============================================================================

CURRENT SETUP (No changes needed):

The Registrar approves a student by updating their profile via the API:

    PATCH /api/students/{id}/
    {
        "enrollment_status": "ASSESSED"
    }

BACKEND:
- StudentProfileViewSet handles the PATCH request
- Student status gets updated
- Django signal is automatically triggered
- Assessment is created silently
- Frontend just needs to refresh to see the Assessment

NO ADDITIONAL BACKEND CODE NEEDED!

FRONTEND CONSIDERATIONS:

In your Registrar dashboard (RoleShell.tsx or RegistrarLayout.tsx):

1. When the "Approve" button is clicked, send:
    await api.patch(`/students/${studentId}/`, {
        enrollment_status: 'ASSESSED'
    })

2. The signal will automatically create the Assessment
3. Refresh the student details to show the new Assessment

4. (Optional) Show a toast notification:
    "Student approved and Assessment generated successfully!"


# ============================================================================
# PART 4: VERIFICATION & DEBUGGING
# ============================================================================

VERIFY THE AUTOMATION IS WORKING:

1. Check Django logs:
    - Look for log messages like:
    "✓ Assessment automatically created for john@example.com: 9 units, $7150"

2. In Django shell:
    python manage.py shell
    
    >>> from accounts.models import StudentProfile
    >>> from finance.models import Assessment
    >>> student = StudentProfile.objects.get(user__email='john@example.com')
    >>> student.enrollment_status
    'ASSESSED'
    >>> Assessment.objects.filter(enrollment_record__student=student).exists()
    True

3. Check database:
    SELECT * FROM finance_assessment 
    WHERE enrollment_record_id IN (
        SELECT id FROM enrollment_enrollmentrecord 
        WHERE student_id = <student_id>
    );


TROUBLESHOOTING:

Issue: Signal not triggering
Solution:
- Verify apps.py has ready() method importing signals
- Check that signals.py is in the accounts app
- Restart Django server

Issue: "No class offerings found for section"
Solution:
- Verify ClassOffering records exist for student's section
- Run: 
    SELECT * FROM academics_classoffering 
    WHERE section_id = <section_id>

Issue: Student has no section assigned
Solution:
- Registrar must assign section before approving
- Update StudentProfile.section in admin or API

Issue: Duplicate Assessments created
Solution:
- Signal includes check: if Assessment.objects.filter(enrollment_record=...).exists()
- This prevents duplicates even if signal fires multiple times


# ============================================================================
# PART 5: ALTERNATIVE APPROACHES
# ============================================================================

APPROACH 1: CUSTOM SERIALIZER (Alternative to signals)
---------------------------------------------------

Instead of signals, override StudentProfileSerializer.update():

    # In accounts/serializers.py
    class StudentProfileSerializer(serializers.ModelSerializer):
        class Meta:
            model = StudentProfile
            fields = ['id', 'enrollment_status', 'section', ...]
        
        def update(self, instance, validated_data):
            old_status = instance.enrollment_status
            new_status = validated_data.get('enrollment_status', old_status)
            
            # Call parent update
            instance = super().update(instance, validated_data)
            
            # If status changed to ASSESSED, create Assessment
            if old_status != 'ASSESSED' and new_status == 'ASSESSED':
                create_assessment_for_student(instance)
            
            return instance

PROS: More explicit, easier to debug
CONS: Only works via API, misses direct database updates


APPROACH 2: MANAGEMENT COMMAND (For scheduled backfills)
---------------------------------------------------

Create: backend/accounts/management/commands/generate_assessments.py

    from django.core.management.base import BaseCommand
    from accounts.models import StudentProfile
    from finance.models import Assessment
    
    class Command(BaseCommand):
        help = 'Generate missing assessments for ASSESSED students'
        
        def handle(self, *args, **options):
            # Same logic as generate_assessments.py
            ...

USAGE: python manage.py generate_assessments

PROS: More Django-idiomatic, works with cron jobs
CONS: Requires extra setup for recurring tasks


APPROACH 3: CELERY TASK (For async processing)
---------------------------------------------------

If you have Celery, create an async task:

    # tasks.py
    from celery import shared_task
    
    @shared_task
    def generate_assessment_for_student(student_id):
        student = StudentProfile.objects.get(id=student_id)
        create_assessment_for_student(student)

Call from signal or API view:
    generate_assessment_for_student.delay(instance.id)

PROS: Non-blocking, better for slow calculations
CONS: Requires Celery setup, adds complexity


RECOMMENDATION:
===============

Use the SIGNAL approach (already implemented):
✓ Simplest - requires no API changes
✓ Automatic - works for all update methods
✓ Django-standard - best practice
✓ Already implemented - go with it!

Alternative: Use custom serializer if you need explicit control over
the approval workflow and want to handle errors differently.


# ============================================================================
# PART 6: TUITION CALCULATION FORMULA
# ============================================================================

FORMULA:
    balance_due = (total_units * 400) + 3550

BREAKDOWN:
- Per-unit cost: 400 PHP
- Flat administrative/registration fee: 3550 PHP

EXAMPLE:
Student is assigned to section with these classes:
  - CS101 (3 units)
  - CS102 (3 units)  
  - CS103 (3 units)
  - MATH101 (2 units)
  
Total units = 3 + 3 + 3 + 2 = 11 units
Balance due = (11 * 400) + 3550
            = 4400 + 3550
            = 7950 PHP

TO MODIFY THE FORMULA:
Edit: backend/generate_assessments.py line 104
Or: backend/accounts/signals.py line 93

Find:
    total_amount = Decimal(total_units * 400 + 3550)

Change 400 and 3550 to your desired values.


# ============================================================================
# PART 7: QUICK START CHECKLIST
# ============================================================================

✓ 1. Run the backfill script:
      cd backend && python generate_assessments.py

✓ 2. Verify signals are configured:
      - accounts/signals.py exists
      - accounts/apps.py has ready() method
      - Django server restarted

✓ 3. Test the workflow:
      - Create a new student (status=ADVISING)
      - Update to status=ASSESSED via API or Django admin
      - Check if Assessment was automatically created

✓ 4. Frontend: Registrar "Approve" button now works automatically!
      Just update StudentProfile.enrollment_status to 'ASSESSED'

✓ 5. Done! Future students will get Assessments automatically.


# ============================================================================
"""

# For detailed implementation examples, see:
# - backend/generate_assessments.py (backfill script)
# - backend/accounts/signals.py (automatic generation)
# - backend/accounts/apps.py (signal registration)
