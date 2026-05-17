from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from .managers import CustomUserManager

class BaseUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        REGISTRAR = 'REGISTRAR', 'Registrar'
        CASHIER = 'CASHIER', 'Cashier'
        STUDENT = 'STUDENT', 'Student'

    username = None # Remove the default username field
    email = models.EmailField('email address', unique=True)
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.STUDENT)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

# --- PROFILES ---

class AdminProfile(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='admin_profile')
    
    def __str__(self):
        return f"Admin: {self.user.email}"

class RegistrarProfile(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='registrar_profile')
    employee_id = models.CharField(max_length=50, blank=True, null=True)
    assigned_department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Registrar: {self.user.email}"

class CashierProfile(models.Model):
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='cashier_profile')
    employee_id = models.CharField(max_length=50, blank=True, null=True)
    terminal_number = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return f"Cashier: {self.user.email}"

class StudentProfile(models.Model):
    STATUS_CHOICES = (
        ('ADVISING', 'Advising'),
        ('ASSESSED', 'Assessed'),
        ('PAID', 'Paid'),
        ('ENROLLED', 'Officially Enrolled'),
    )
    user = models.OneToOneField(BaseUser, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    program_enrolled = models.CharField(max_length=100, blank=True, null=True)
    year_level = models.IntegerField(default=1)
    enrollment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ADVISING')

    def __str__(self):
        return f"Student: {self.user.email}"

# --- SIGNALS ---

@receiver(post_save, sender=BaseUser)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create the correct profile based on the user's role."""
    if created:
        if instance.role == BaseUser.Role.ADMIN:
            AdminProfile.objects.create(user=instance)
        elif instance.role == BaseUser.Role.REGISTRAR:
            RegistrarProfile.objects.create(user=instance)
        elif instance.role == BaseUser.Role.CASHIER:
            CashierProfile.objects.create(user=instance)
        elif instance.role == BaseUser.Role.STUDENT:
            StudentProfile.objects.create(user=instance)