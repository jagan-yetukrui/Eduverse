from rest_framework import serializers
from .models import Post, Comment, Like, Save, Report

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'post', 'text', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'created_at']  # Add fields as per your `Like` model

class SaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Save
        fields = ['id', 'user', 'post', 'created_at']  # Add fields relevant to your Save model
from rest_framework import serializers
from .models import Share

class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = ['id', 'user', 'post', 'created_at']  # Add fields relevant to your Share model
from rest_framework import serializers
from .models import Favorite

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'post', 'created_at']  # Add fields relevant to your Favorite model

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'user', 'post', 'reason', 'created_at']  # Add fields relevant to your Report model