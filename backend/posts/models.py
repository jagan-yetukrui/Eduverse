from django.db import models

from accounts.models import CustomUser  # accounts app
from django.utils import timezone


class Post(models.Model):
    POST_TYPES = (
        ("T", "Text"),
        ("I", "Image"),
        ("V", "Video"),
    )

    title = models.CharField(max_length=255)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    post_type = models.CharField(max_length=1, choices=POST_TYPES, default="T")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
