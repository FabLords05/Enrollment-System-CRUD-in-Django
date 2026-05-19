"""
Django signals for the accounts app.

Handles automatic Assessment generation when a Registrar approves a student.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import IntegrityError
from decimal import Decimal
import logging

from .models import StudentProfile
from academics.models import Term, ClassOffering
from enrollment.models import EnrollmentRecord
from finance.models import Assessment

logger = logging.getLogger(__name__)


@receiver(post_save, sender=StudentProfile)
def create_assessment_on_status_change(sender, instance, created, **kwargs):
    """
    Automatically create an Assessment when a StudentProfile status changes to ASSESSED.
    
    This signal is triggered whenever a StudentProfile is saved. It checks if:
    1. The student has a section assigned
    2. The enrollment_status is ASSESSED or PAID
    3. No Assessment already exists for the current term
    
    If all conditions are met, it creates:
    - An active Term (if not exists)
    - An EnrollmentRecord linking student to term
    - An Assessment with calculated total_units and balance_due
    """
    
    # Skip if this is a brand new student profile creation
    # (enrollment_status defaults to ADVISING, and no assessment is needed yet)
    if created:
        return
    
    # Only create Assessment for ASSESSED or PAID students
    if instance.enrollment_status not in ['ASSESSED', 'PAID']:
        return
    
    # Student must have a section assigned
    if not instance.section:
        logger.warning(f"Student {instance.user.email} approved but has no section assigned.")
        return
    
    try:
        # Get or create the active Term
        term, _ = Term.objects.get_or_create(
            is_active=True,
            defaults={'name': 'Active Term'}
        )
        
        # Get or create EnrollmentRecord for this student and term
        enrollment_record, enrollment_created = EnrollmentRecord.objects.get_or_create(
            student=instance,
            term=term,
            defaults={'status': instance.enrollment_status}
        )
        
        # Update status if the enrollment_record already existed
        if not enrollment_created and enrollment_record.status != instance.enrollment_status:
            enrollment_record.status = instance.enrollment_status
            enrollment_record.save()
        
        # Check if Assessment already exists - if so, skip
        if Assessment.objects.filter(enrollment_record=enrollment_record).exists():
            logger.info(f"Assessment already exists for {instance.user.email} in term {term.name}")
            return
        
        # Get all ClassOffering records for this student's section
        class_offerings = ClassOffering.objects.filter(
            section=instance.section
        ).select_related('subject')
        
        if not class_offerings.exists():
            logger.warning(
                f"Student {instance.user.email} has no class offerings "
                f"for section {instance.section.name}"
            )
            return
        
        # Calculate total units by summing units from all offered subjects
        total_units = sum(offering.subject.units for offering in class_offerings)
        
        # Calculate balance_due: (units * 400) + 3550
        # Formula: per-unit cost (400) × total units + flat administrative fee (3550)
        total_amount = Decimal(total_units * 400 + 3550)
        
        # Create Assessment record
        assessment = Assessment.objects.create(
            enrollment_record=enrollment_record,
            total_units=total_units,
            total_amount=total_amount,
            balance_due=total_amount
        )
        
        logger.info(
            f"✓ Assessment automatically created for {instance.user.email}: "
            f"{total_units} units, ${total_amount}"
        )
        
    except IntegrityError as e:
        # Handle race condition where Assessment already exists
        logger.warning(f"Integrity error creating assessment for {instance.user.email}: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating assessment for {instance.user.email}: {str(e)}")
