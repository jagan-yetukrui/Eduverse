from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.CharField(max_length=100)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()
    blocked_users = serializers.SerializerMethodField()
    notification_settings = serializers.JSONField(required=False)
    privacy_settings = serializers.JSONField(required=False)
    account_status = serializers.ChoiceField(choices=Profile.ACCOUNT_STATUS_CHOICES, read_only=True)
    highlights = serializers.JSONField(required=False)
    website = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = [
            'user', 'username', 'display_name', 'bio', 'avatar',
            'website', 'location', 'followers_count', 'following_count',
            'posts', 'highlights', 'education', 'experience',
            'blocked_users', 'notification_settings', 'privacy_settings',
            'account_status', 'is_verified'
        ]
        read_only_fields = ['user', 'username', 'followers_count', 'following_count', 'posts', 'is_verified']

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()
        
    def get_posts(self, obj):
        posts = obj.user.posts.all()
        return [{'id': post.id, 'title': post.title, 'thumbnail': post.thumbnail.url if post.thumbnail else None}
                for post in posts]

    def get_blocked_users(self, obj):
        return [{'id': user.id, 'username': user.username} for user in obj.blocked_users.all()]

class SettingsSerializer(serializers.ModelSerializer):
    blocked_users = serializers.PrimaryKeyRelatedField(many=True, queryset=Profile.objects.all())
    close_friends = serializers.PrimaryKeyRelatedField(many=True, queryset=Profile.objects.all())
    liked_posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    highlights = serializers.JSONField(required=False)

    class Meta:
        model = Profile
        fields = [
            'blocked_users', 'notification_settings', 'privacy_settings',
            'account_status', 'liked_posts', 'close_friends', 'highlights'
        ]

    def validate_notification_settings(self, value):
        required_keys = ['email', 'push', 'sms', 'post_likes', 'comments', 'follows', 'messages']
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError("Missing required notification settings")
        return value

    def validate_privacy_settings(self, value):
        required_keys = ['profile_visibility', 'posts_visibility', 'followers_visibility', 'following_visibility']
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError("Missing required privacy settings")
        return value

class EditProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.CharField(max_length=100)
    bio = serializers.CharField(max_length=500, required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    website = serializers.URLField(required=False, allow_blank=True)
    location = serializers.CharField(max_length=100, required=False, allow_blank=True)
    education = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.CharField(read_only=True, help_text="This field is managed by AI")
    highlights = serializers.JSONField(required=False)

    class Meta:
        model = Profile
        fields = [
            'username', 'display_name', 'bio', 'avatar', 'website', 
            'location', 'education', 'experience', 'skills', 'highlights'
        ]

    def validate_avatar(self, value):
        if value and value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Avatar file size must be under 5MB")
        return value
