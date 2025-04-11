from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    # username, password, email, first_name, last_name are inherited from AbstractUser

    def __str__(self):
        return self.username