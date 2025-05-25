from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings

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

class UserSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    refresh_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    device_fingerprint = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['last_activity']),
        ]

    @classmethod
    def create_session(cls, user, refresh_token, device_fingerprint=None, ip_address=None, user_agent=None):
        # Get active sessions for user
        active_sessions = cls.objects.filter(user=user, is_active=True)
        
        # If user has reached max sessions, deactivate oldest
        if active_sessions.count() >= 5:  # Max 5 active sessions
            oldest_session = active_sessions.order_by('last_activity').first()
            oldest_session.deactivate()
        
        # Create new session
        return cls.objects.create(
            user=user,
            refresh_token=refresh_token,
            device_fingerprint=device_fingerprint,
            ip_address=ip_address,
            user_agent=user_agent
        )

    def deactivate(self):
        self.is_active = False
        self.save(update_fields=['is_active'])

    @classmethod
    def cleanup_expired_sessions(cls):
        # Deactivate sessions older than 14 days
        expiry_date = timezone.now() - timezone.timedelta(days=14)
        cls.objects.filter(
            last_activity__lt=expiry_date,
            is_active=True
        ).update(is_active=False)

    def validate_session(self, device_fingerprint=None, ip_address=None):
        """Validate session against device fingerprint and IP"""
        if device_fingerprint and self.device_fingerprint != device_fingerprint:
            return False
        if ip_address and self.ip_address != ip_address:
            return False
        return True