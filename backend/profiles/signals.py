# In your user registration view or signal
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Profile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a Profile instance when a new User is created"""
    if created:
        Profile.objects.create(
            user=instance,
            display_name=instance.get_full_name() or instance.username,
            email=instance.email
        )

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    """Save the Profile instance when the User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()