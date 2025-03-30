from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Education, License, Experience, Project


# Main serializer for Profile model handling basic profile information and related counts
class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    email = serializers.EmailField(read_only=True)
    username = serializers.CharField(read_only=True)
    display_name = serializers.CharField(max_length=100)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
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

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'username', 'display_name', 'email',
            'bio', 'avatar', 'skills', 'account_status',
            'is_verified', 'created_at', 'updated_at',
            'followers_count', 'following_count', 'posts',
            'blocked_users', 'notification_settings', 'privacy_settings',
            'highlights', 'website', 'location', 'education_details',
            'experiences', 'licenses', 'close_friends', 'liked_posts'
        ]
        read_only_fields = ['id', 'user', 'username', 'email', 'account_status', 'is_verified']

    def update(self, instance, validated_data):
        # Handle avatar update separately if needed
        avatar = validated_data.pop('avatar', None)
        if avatar:
            instance.avatar = avatar

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    # Get total number of followers
    def get_followers_count(self, obj):
        return obj.followers.count()

    # Get total number of users being followed
    def get_following_count(self, obj):
        return obj.following.count()

    # Get simplified list of user's posts
    def get_posts(self, obj):
        if obj.posts:
            return {
                "id": obj.posts.id,
                "title": obj.posts.title,
                "thumbnail": obj.posts.thumbnail.url if obj.posts.thumbnail else None,
            }
        return None

    # Get list of blocked users with basic info
    def get_blocked_users(self, obj):
        return [
            {"id": user.id, "username": user.username}
            for user in obj.blocked_users.all()
        ]


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


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ['profile']


class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = '__all__'
        read_only_fields = ['profile']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ['profile']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['profile']
