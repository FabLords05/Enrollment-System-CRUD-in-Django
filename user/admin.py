from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserAdmin(UserAdmin):
    model = User
    # Added 'full_name' and 'profile_picture' to the list view
    list_display = ('email', 'full_name', 'is_active', 'is_staff', 'date_joined', 'profile_picture')
    list_filter = ('is_active', 'is_staff', 'date_joined')
    # Updated 'name' to 'full_name'
    search_fields = ('email', 'full_name')
    ordering = ('-date_joined',)
    
    readonly_fields = ('date_joined', 'last_login')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        # Updated 'name' to 'full_name' and kept profile_picture
        ('Personal Info', {'fields': ('full_name', 'profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('date_joined', 'last_login')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            # Updated 'name' to 'full_name'
            'fields': ('email', 'full_name', 'password', 'is_staff', 'is_active'),
        }),
    )

admin.site.register(User, CustomUserAdmin)