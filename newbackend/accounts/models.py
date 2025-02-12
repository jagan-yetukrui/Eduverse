from django.contrib.auth.models import AbstractUser
from django.db import models
# from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User


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

class Post(models.Model):
    post_id = models.AutoField(primary_key=True)  # Unique Post ID
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Link to the CustomUser
    content = models.TextField()  # Content of the post
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp of creation

    def __str__(self):
        return f"Post by {self.user.username}: {self.content[:20]}"