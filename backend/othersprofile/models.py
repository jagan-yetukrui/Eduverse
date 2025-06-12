from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

# Create your models here.

class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following'
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def clean(self):
        if self.follower == self.following:
            raise ValidationError("Users cannot follow themselves.")

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
