from rest_framework import serializers
from .models import *


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "skills", "profile_picture"]


class PostImageSerializer(serializers.ModelSerializer):
    """Serializer for PostImage model"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'image_url', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image_url(self, obj):
        """Get image URL if available"""
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class PostSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)  # ✅ Allow manual assignment
    comments_count = serializers.IntegerField(source="comments.count", read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    post_images = PostImageSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = "__all__"
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'content': {'required': False, 'allow_blank': True, 'allow_null': True},
            'post_type': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_image_url(self, obj):
        """Get main image URL if available (for backward compatibility)"""
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def validate(self, data):
        """Validate that post has either content or images"""
        request = self.context.get('request')
        has_content = bool(data.get('content', '').strip())
        
        # Safely check for images without raising KeyError
        has_images = False
        if request and hasattr(request, 'FILES'):
            images = request.FILES.getlist('images')
            has_images = len(images) > 0
        
        if not has_content and not has_images:
            raise serializers.ValidationError("Post must have either content or at least one image")
        return data


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = "__all__"


class SaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Save
        fields = "__all__"


class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = "__all__"


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = "__all__"


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = "__all__"