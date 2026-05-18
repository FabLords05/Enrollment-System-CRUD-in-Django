from django.db import models
from enrollment.models import EnrollmentRecord

class Assessment(models.Model):
    enrollment_record = models.OneToOneField(EnrollmentRecord, on_delete=models.CASCADE)
    total_units = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class Payment(models.Model):
    assessment = models.ForeignKey(Assessment, related_name='payments', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    receipt_number = models.CharField(max_length=100, unique=True)

    def save(self, *args, **kwargs):
        # 1. Check if this is a brand new payment being created (not just an edit)
        is_new = self.pk is None 
        
        # 2. Save the Payment to the database first
        super().save(*args, **kwargs)
        
        # 3. If it is new, deduct the amount from the Assessment's balance
        if is_new:
            self.assessment.balance_due -= self.amount_paid
            self.assessment.save()