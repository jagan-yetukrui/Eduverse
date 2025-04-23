from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

# Model for managing user education details
class Education(models.Model):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='education_details')
    school_name = models.CharField(max_length=200, verbose_name="School Name", default="")
    degree = models.CharField(max_length=100, default="")
    field_of_study = models.CharField(max_length=100, default="")
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True, default="")

    class Meta:
        ordering = ['-end_date', '-start_date']
        verbose_name = "Education"
        verbose_name_plural = "Education"

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date")

    def __str__(self):
        return f"{self.degree} at {self.school_name}"

# Model for managing licenses and certifications
class License(models.Model):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='licenses')
    name = models.CharField(max_length=200, default="")
    issuing_organization = models.CharField(max_length=200, default="")
    issue_date = models.DateField(null=True)
    expiry_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True, null=True, default="")
    credential_url = models.URLField(blank=True, null=True, default="")

    class Meta:
        ordering = ['-issue_date']
        verbose_name = "License"
        verbose_name_plural = "Licenses"

    def clean(self):
        if self.expiry_date and self.issue_date and self.expiry_date < self.issue_date:
            raise ValidationError("Expiry date cannot be before issue date")

    def __str__(self):
        return f"{self.name} from {self.issuing_organization}"

# Model for managing work experience
class Experience(models.Model):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=200, default="")
    company = models.CharField(max_length=200, default="")
    location = models.CharField(max_length=100, blank=True, null=True, default="")
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True, default="")

    class Meta:
        ordering = ['-end_date', '-start_date']
        verbose_name = "Experience"
        verbose_name_plural = "Experiences"

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date")

    def __str__(self):
        return f"{self.title} at {self.company}"

# Model for managing projects and research
class Project(models.Model):
    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200, default="")
    description = models.TextField(default="")
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True, blank=True)
    url = models.URLField(blank=True, null=True, default="")
    is_research = models.BooleanField(default=False)
    collaborators = models.ManyToManyField('Profile', related_name='collaborated_projects', blank=True)

    class Meta:
        ordering = ['-end_date', '-start_date']
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be before start date")

    def __str__(self):
        return self.title

# Main Profile model managing user profile information
class Profile(models.Model):
    # Account status choices
    ACCOUNT_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended')
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=150, unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    skills = models.JSONField(default=dict, blank=True)
    account_status = models.CharField(
        max_length=20,
        choices=ACCOUNT_STATUS_CHOICES,
        default='active'
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when profile is created
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp for last update
    website = models.URLField(max_length=200, blank=True, null=True, default="")
    location = models.CharField(max_length=100, blank=True, null=True, default="")
    # AI managed skills field
    skills = models.JSONField(default=dict, blank=True, editable=False, help_text="This field is managed by AI")
    last_login = models.DateTimeField(null=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following')
    blocked_users = models.ManyToManyField('self', symmetrical=False, related_name='blocked_by')
    close_friends = models.ManyToManyField('self', symmetrical=False, related_name='close_friend_of')
    posts = models.ForeignKey('posts.Post', on_delete=models.CASCADE, related_name='authorProfile', null=True)
    liked_posts = models.ManyToManyField('posts.Post', related_name='liked_by')
    social_links = models.JSONField(default=dict, blank=True)  
    notification_settings = models.JSONField(default=dict, blank=True, help_text="Notification settings.")
    privacy_settings = models.JSONField(default=dict, blank=True, help_text="Privacy settings.")
    security_settings = models.JSONField(default=dict, blank=True, help_text="Security settings.")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def clean(self):
        if self.account_status not in dict(self.ACCOUNT_STATUS_CHOICES):
            raise ValidationError(f"Invalid account status: {self.account_status}")

    def __str__(self):
        return self.username

    @classmethod
    def get_by_user_id(cls, user_id):
        try:
            return cls.objects.get(user_id=user_id)
        except cls.DoesNotExist:
            return None

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(
            user=instance,
            username=instance.username,
            email=instance.email,
            display_name=instance.get_full_name() or instance.username
        )

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
