from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    skills = models.JSONField(default=dict, blank=True)  # Changed to JSONField for better structure
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_active = models.DateTimeField(default=timezone.now)
    email_verified = models.BooleanField(default=False)
    account_type = models.CharField(
        max_length=20,
        choices=[
            ('basic', 'Basic'),
            ('premium', 'Premium'),
            ('enterprise', 'Enterprise')
        ],
        default='basic'
    )

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return self.username

    def update_last_active(self):
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])