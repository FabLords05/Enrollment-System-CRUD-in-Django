"""
Backfill script to generate Assessment records for existing students with ASSESSED or ADVISING status.

This script:
1. Finds all StudentProfile records with enrollment_status='ASSESSED' or 'ADVISING'
2. For each student, finds or creates an active Term
3. Creates an EnrollmentRecord linking the student to the term
4. Calculates total tuition based on assigned section's class offerings
5. Creates Assessment with total_units, total_amount, and balance_due
"""

import os
import sys
import django
from decimal import Decimal

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems_backend.settings')
django.setup()

from accounts.models import StudentProfile
from academics.models import Term, ClassOffering
from enrollment.models import EnrollmentRecord
from finance.models import Assessment


def generate_assessments():
    """
    Backfill assessments for students with ASSESSED or ADVISING enrollment status.
    """
    print("=" * 80)
    print("ASSESSMENT BACKFILL SCRIPT")
    print("=" * 80)
    
    # Get or create an active Term
    term, term_created = Term.objects.get_or_create(
        is_active=True,
        defaults={'name': 'Active Term'}
    )
    print(f"\n{'Created' if term_created else 'Using existing'} term: {term.name}")
    
    # Query students with ASSESSED or ADVISING status
    students = StudentProfile.objects.filter(
        enrollment_status__in=['ASSESSED', 'ADVISING']
    ).select_related('user', 'section')
    
    print(f"\nFound {students.count()} student(s) to process...\n")
    
    if not students.exists():
        print("No students found with ASSESSED or ADVISING status.")
        return
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for idx, student in enumerate(students, 1):
        email = student.user.email
        print(f"[{idx}/{students.count()}] Processing {email}...")
        
        # Validate that student has a section assigned
        if not student.section:
            print(f"  ✗ ERROR: No section assigned to this student")
            error_count += 1
            continue
        
        # Get or create EnrollmentRecord for this student and term
        enrollment_record, enrollment_created = EnrollmentRecord.objects.get_or_create(
            student=student,
            term=term,
            defaults={'status': student.enrollment_status}
        )
        
        # Check if Assessment already exists for this EnrollmentRecord
        if Assessment.objects.filter(enrollment_record=enrollment_record).exists():
            print(f"  ⊘ SKIP: Assessment already exists")
            skip_count += 1
            continue
        
        # Query all ClassOffering records for this student's section
        class_offerings = ClassOffering.objects.filter(
            section=student.section
        ).select_related('subject')
        
        if not class_offerings.exists():
            print(f"  ✗ ERROR: No class offerings found for section '{student.section.name}'")
            error_count += 1
            continue
        
        # Calculate total units by summing units from all offered subjects
        total_units = sum(offering.subject.units for offering in class_offerings)
        
        # Calculate balance_due: (units * 400) + 3550
        # The formula: per-unit cost is 400, plus flat fee of 3550
        total_amount = Decimal(total_units * 400 + 3550)
        
        # Create the Assessment record
        try:
            assessment = Assessment.objects.create(
                enrollment_record=enrollment_record,
                total_units=total_units,
                total_amount=total_amount,
                balance_due=total_amount
            )
            print(f"  ✓ SUCCESS: Assessment created")
            print(f"     Units: {total_units} | Amount: ${total_amount}")
            success_count += 1
        except Exception as e:
            print(f"  ✗ ERROR: Failed to create assessment: {str(e)}")
            error_count += 1
    
    # Summary
    print("\n" + "=" * 80)
    print("BACKFILL SUMMARY")
    print("=" * 80)
    print(f"Success:  {success_count}")
    print(f"Skipped:  {skip_count}")
    print(f"Errors:   {error_count}")
    print(f"Total:    {students.count()}\n")


if __name__ == '__main__':
    try:
        generate_assessments()
    except Exception as e:
        print(f"\nFATAL ERROR: {str(e)}")
        sys.exit(1)
