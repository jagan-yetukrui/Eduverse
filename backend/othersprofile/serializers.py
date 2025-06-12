from rest_framework import serializers
from django.contrib.auth import get_user_model
from profiles.models import Profile

User = get_user_model()

class PublicProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    is_private = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    can_view_posts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'username',
            'display_name',
            'profile_image',
            'is_private',
            'is_following',
            'can_view_posts'
        ]

    def get_display_name(self, obj):
        try:
            profile = obj.profile
            if profile.display_name:
                return profile.display_name
            full_name = f"{obj.first_name} {obj.last_name}".strip()
            return full_name or f"@{obj.username}"
        except Profile.DoesNotExist:
            return f"@{obj.username}"

    def get_profile_image(self, obj):
        try:
            return obj.profile.image.url if obj.profile.image else None
        except Profile.DoesNotExist:
            return None

    def get_is_private(self, obj):
        try:
            return obj.profile.is_private
        except Profile.DoesNotExist:
            return False

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.followers.filter(follower=request.user).exists()

    def get_can_view_posts(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user == obj:
            return True
        try:
            if not obj.profile.is_private:
                return True
            return obj.followers.filter(follower=request.user).exists()
        except Profile.DoesNotExist:
            return False 