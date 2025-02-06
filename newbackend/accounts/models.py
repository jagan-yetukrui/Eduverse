from django.contrib.auth.models import AbstractUser
from django.db import models
# from django.contrib.postgres.fields import ArrayField


class CustomUser(AbstractUser):
    # Add any custom user fields here
    pass

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    education = models.TextField(blank=True)
    # experience = ArrayField(models.CharField(max_length=255), blank=True, default=list)
    experience = models.TextField(blank=True)

    def __str__(self):
        return self.user.username