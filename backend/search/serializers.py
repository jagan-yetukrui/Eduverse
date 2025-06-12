from rest_framework import serializers
from accounts.models import CustomUser

class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer for user search results"""
    profile_image = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'profile_image', 'display_name']
        read_only_fields = fields

    def get_profile_image(self, obj):
        """Get profile image URL if available"""
        try:
            return obj.profile.avatar.url if obj.profile and obj.profile.avatar else None
        except Exception:
            return None

    def get_display_name(self, obj):
        """Get display name from profile or fallback to full name"""
        try:
            if obj.profile and obj.profile.display_name:
                return obj.profile.display_name
            return f"{obj.first_name} {obj.last_name}".strip() or obj.username
        except Exception:
            return obj.username 