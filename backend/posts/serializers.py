from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "author",
            "content",
            "post_type",
            "created_at",
            "updated_at",
        ]
