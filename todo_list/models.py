from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Users(AbstractUser):

    def jsonDefaultFormat():
        return {
            "toDoList": []
        }

    full_name = models.CharField(max_length=255)
    todo = models.JSONField(null=True, default=jsonDefaultFormat)

    def __str__(self):
        return self.username
    
