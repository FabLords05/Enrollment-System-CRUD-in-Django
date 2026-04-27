import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from user.models import User

print('Registered user accounts:')
for u in User.objects.all():
    print(u.id, u.email, u.name, 'ACTIVE' if u.is_active else 'INACTIVE', u.last_login)
