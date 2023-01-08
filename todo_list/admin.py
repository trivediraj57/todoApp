"""Admin"""
from django.contrib import admin
from .models import Users

# Register your models here.

class UsersAdmin(admin.ModelAdmin):
    """For Users Model Admin"""
    list_display = ['id', 'username', 'email', 'is_staff']

admin.site.register(Users, UsersAdmin)
