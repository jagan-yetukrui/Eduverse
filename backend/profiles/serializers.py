from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Education, License, Experience, Project


# Serializer for Education model with proper validation
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'school_name', 'degree', 'field_of_study', 
            'start_date', 'end_date', 'description'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """Validate that end_date is not before start_date"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date")
        
        return data


# Serializer for Experience model with proper validation
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id', 'title', 'company', 'location', 'start_date', 
            'end_date', 'is_current', 'description'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """Validate that end_date is not before start_date and handle current position"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date")
        
        if is_current and end_date:
            raise serializers.ValidationError("Current position should not have an end date")
        
        return data


# Serializer for License model with proper validation
class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = [
            'id', 'name', 'issuing_organization', 'issue_date', 
            'expiry_date', 'credential_id', 'credential_url'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """Validate that expiry_date is not before issue_date"""
        issue_date = data.get('issue_date')
        expiry_date = data.get('expiry_date')
        
        if issue_date and expiry_date and expiry_date < issue_date:
            raise serializers.ValidationError("Expiry date cannot be before issue date")
        
        return data


# Serializer for Project model with proper validation
class ProjectSerializer(serializers.ModelSerializer):
    project_image_url = serializers.SerializerMethodField()
    technologies = serializers.JSONField(required=False, allow_null=True)
    project_url = serializers.URLField(source='url', required=False, allow_blank=True)
    github_url = serializers.URLField(required=False, allow_blank=True)
    project_type = serializers.CharField(required=False, allow_blank=True)
    is_current = serializers.BooleanField(required=False, default=False)
    end_date = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'start_date', 
            'end_date', 'url', 'project_url', 'github_url', 'project_type',
            'project_image', 'project_image_url', 'is_research', 'is_current',
            'technologies'
        ]
        read_only_fields = ['id', 'collaborators']

    def get_project_image_url(self, obj):
        """Get project image URL if available"""
        request = self.context.get('request')
        if obj.project_image and hasattr(obj.project_image, 'url'):
            return request.build_absolute_uri(obj.project_image.url) if request else obj.project_image.url
        return None

    def validate_project_image(self, value):
        """Validate project image file size and type"""
        if value:
            # Check file size (5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Project image file size must be under 5MB")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, and GIF images are allowed")
        
        return value

    def validate(self, data):
        """Validate that end_date is not before start_date"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        # If project is current, don't require end_date
        if is_current:
            data['end_date'] = None
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date")
        
        return data

    def create(self, validated_data):
        """Handle custom field mapping during creation"""
        # Extract custom fields
        technologies = validated_data.pop('technologies', None)
        github_url = validated_data.pop('github_url', None)
        project_type = validated_data.pop('project_type', None)
        is_current = validated_data.pop('is_current', False)
        
        # Create the project
        project = super().create(validated_data)
        
        # Store additional data in a custom field or handle as needed
        # For now, we'll store technologies in a custom field if needed
        if technologies:
            # You might want to add a technologies field to the model
            pass
        
        return project

    def update(self, instance, validated_data):
        """Handle custom field mapping during updates"""
        # Extract custom fields
        technologies = validated_data.pop('technologies', None)
        github_url = validated_data.pop('github_url', None)
        project_type = validated_data.pop('project_type', None)
        is_current = validated_data.pop('is_current', False)
        
        # Update the project
        project = super().update(instance, validated_data)
        
        # Handle additional fields as needed
        if technologies:
            # Store technologies if you add a field for it
            pass
        
        return project


# Main serializer for Profile model handling basic profile information and related counts
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    display_name = serializers.CharField(max_length=100)
    avatar_url = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()
    blocked_users = serializers.SerializerMethodField()
    notification_settings = serializers.JSONField(required=False)
    privacy_settings = serializers.JSONField(required=False)
    account_status = serializers.ChoiceField(
        choices=Profile.ACCOUNT_STATUS_CHOICES,
        read_only=True
    )
    is_verified = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    highlights = serializers.JSONField(required=False)
    website = serializers.URLField(required=False, allow_blank=True)
    location = serializers.CharField(max_length=100, required=False, allow_blank=True)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    # Nested serializers for related data
    education_details = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    licenses = LicenseSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'username', 'display_name', 'email',
            'bio', 'avatar', 'avatar_url', 'profile_image', 'profile_image_url', 
            'skills', 'account_status', 'is_verified', 'created_at', 'updated_at',
            'followers_count', 'following_count', 'posts_count', 'posts',
            'blocked_users', 'notification_settings', 'privacy_settings',
            'highlights', 'website', 'location', 'education_details',
            'experiences', 'licenses', 'projects', 'close_friends', 'liked_posts'
        ]
        read_only_fields = ['id', 'username', 'email', 'account_status', 'is_verified', 'skills']

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return '/default-avatar.png'

    def get_profile_image_url(self, obj):
        """Get profile image URL with fallback to avatar"""
        return obj.get_profile_image_url() or '/default-avatar.png'

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_posts_count(self, obj):
        if hasattr(obj, 'posts') and obj.posts:
            return 1
        return 0

    def get_posts(self, obj):
        if hasattr(obj, 'posts') and obj.posts:
            return {
                "id": obj.posts.id,
                "title": obj.posts.title,
                "thumbnail": obj.posts.thumbnail.url if obj.posts.thumbnail else None,
            }
        return None

    def get_blocked_users(self, obj):
        return [
            {"id": user.id, "username": user.username}
            for user in obj.blocked_users.all()
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add fallback values for required fields
        data['display_name'] = data.get('display_name') or data.get('username')
        data['bio'] = data.get('bio') or 'No bio yet'
        data['avatar_url'] = data.get('avatar_url') or '/default-avatar.png'
        data['profile_image_url'] = data.get('profile_image_url') or '/default-avatar.png'
        data['followers_count'] = data.get('followers_count') or 0
        data['following_count'] = data.get('following_count') or 0
        data['posts_count'] = data.get('posts_count') or 0
        return data

    def update(self, instance, validated_data):
        # Handle image updates separately
        profile_image = validated_data.pop('profile_image', None)
        avatar = validated_data.pop('avatar', None)
        
        if profile_image:
            instance.profile_image = profile_image
        if avatar:
            instance.avatar = avatar

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


# Serializer for profile updates (PATCH operations)
class ProfileUpdateSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Profile
        fields = [
            'display_name', 'bio', 'profile_image', 'website', 
            'location', 'notification_settings', 'privacy_settings'
        ]

    def validate_profile_image(self, value):
        """Validate profile image file size and type"""
        if value:
            # Check file size (5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Profile image file size must be under 5MB")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, and GIF images are allowed")
        
        return value


# Dedicated serializer for privacy settings with strict choices validation
class PrivacySettingsSerializer(serializers.Serializer):
    profile_visibility = serializers.ChoiceField(choices=["public", "private"])
    posts_visibility = serializers.ChoiceField(choices=["public", "friends", "private"])
    followers_visibility = serializers.ChoiceField(
        choices=["public", "friends", "private"]
    )
    following_visibility = serializers.ChoiceField(
        choices=["public", "friends", "private"]
    )
    allow_friend_requests = serializers.BooleanField(default=True)
    show_online_status = serializers.BooleanField(default=True)


# Dedicated serializer for notification preferences across different channels
class NotificationSettingsSerializer(serializers.Serializer):
    email = serializers.BooleanField(default=True)
    push = serializers.BooleanField(default=True)
    sms = serializers.BooleanField(default=False)
    post_likes = serializers.BooleanField(default=True)
    comments = serializers.BooleanField(default=True)
    follows = serializers.BooleanField(default=True)
    messages = serializers.BooleanField(default=True)


# Dedicated serializer for security-related settings including 2FA
class SecuritySettingsSerializer(serializers.Serializer):
    two_factor_auth = serializers.BooleanField(default=False)
    login_alerts = serializers.BooleanField(default=True)
    backup_codes = serializers.ListField(child=serializers.CharField(), read_only=True)


# Dedicated serializer for blocked user entries with additional metadata
class BlockedUserSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    block_reason = serializers.CharField(required=False, allow_blank=True)
    block_duration = serializers.ChoiceField(
        choices=["temporary", "permanent"], default="permanent"
    )


# Dedicated serializer for close friends list management
class CloseFriendSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    added_at = serializers.DateTimeField(read_only=True)
    custom_list = serializers.CharField(required=False, allow_blank=True)


# Comprehensive settings serializer that combines all setting-specific serializers
class SettingsSerializer(serializers.ModelSerializer):
    blocked_users = BlockedUserSerializer(many=True, required=False)
    close_friends = CloseFriendSerializer(many=True, required=False)
    liked_posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    highlights = serializers.JSONField(required=False)
    privacy_settings = PrivacySettingsSerializer()
    notification_settings = NotificationSettingsSerializer()
    security_settings = SecuritySettingsSerializer(required=False)

    class Meta:
        model = Profile
        fields = [
            "blocked_users",
            "notification_settings",
            "privacy_settings",
            "security_settings",
            "account_status",
            "liked_posts",
            "close_friends",
            "highlights",
        ]

    # Validate notification settings using dedicated serializer
    def validate_notification_settings(self, value):
        serializer = NotificationSettingsSerializer(data=value)
        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        return value

    # Validate privacy settings using dedicated serializer
    def validate_privacy_settings(self, value):
        serializer = PrivacySettingsSerializer(data=value)
        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        return value

    # Validate security settings using dedicated serializer
    def validate_security_settings(self, value):
        serializer = SecuritySettingsSerializer(data=value)
        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        return value

    # Ensure blocked users list doesn't exceed platform limits
    def validate_blocked_users(self, value):
        if len(value) > 1000:  # Limit number of blocked users
            raise serializers.ValidationError(
                "Maximum number of blocked users exceeded"
            )
        return value

    # Ensure close friends list doesn't exceed platform limits
    def validate_close_friends(self, value):
        if len(value) > 500:  # Limit number of close friends
            raise serializers.ValidationError(
                "Maximum number of close friends exceeded"
            )
        return value


# Serializer for handling profile edits with field-specific validation
class EditProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    display_name = serializers.CharField(max_length=100)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    website = serializers.URLField(required=False, allow_blank=True)
    location = serializers.CharField(max_length=100, required=False, allow_blank=True)
    education_details = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    experiences = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    licenses = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    skills = serializers.JSONField(
        read_only=True, help_text="This field is managed by AI"
    )
    highlights = serializers.JSONField(required=False)

    class Meta:
        model = Profile
        fields = [
            "username",
            "display_name",
            "bio",
            "avatar",
            "website",
            "location",
            "education_details",
            "experiences",
            "licenses",
            "skills",
            "highlights",
        ]

    # Validate avatar file size
    def validate_avatar(self, value):
        if value and value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Avatar file size must be under 5MB")
        return value
