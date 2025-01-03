from django.db import models
from django.conf import settings

class Profile(models.Model):
    ACCOUNT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('deactivated', 'Deactivated'),
        ('suspended', 'Suspended')
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100)
    username = models.CharField(max_length=30, unique=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following')
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by')
    close_friends = models.ManyToManyField('self', symmetrical=False, related_name='close_friend_of')
    posts = models.ForeignKey('posts.Post', on_delete=models.CASCADE, related_name='author', null=True)
    liked_posts = models.ManyToManyField('posts.Post', related_name='liked_by')
    highlights = models.JSONField(default=dict, blank=True)
    notification_settings = models.JSONField(default=dict, blank=True, help_text={
        'email': True,
        'push': True,
        'sms': False,
        'post_likes': True,
        'comments': True,
        'follows': True,
        'messages': True
    })
    privacy_settings = models.JSONField(default=dict, blank=True, help_text={
        'profile_visibility': 'public',
        'posts_visibility': 'public',
        'followers_visibility': 'public',
        'following_visibility': 'public'
    })
    account_status = models.CharField(
        max_length=20,
        choices=ACCOUNT_STATUS_CHOICES,
        default='active'
    )
    is_verified = models.BooleanField(default=False)
    website = models.URLField(max_length=200, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    skills = models.TextField(blank=True, null=True, editable=False, help_text="This field is managed by AI")
    education = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.username
