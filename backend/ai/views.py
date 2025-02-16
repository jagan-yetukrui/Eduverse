from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Post, Comment, Like, Save, Share, Favorite, Report
from .serializers import (
    PostSerializer, CommentSerializer, LikeSerializer, SaveSerializer,
    ShareSerializer, FavoriteSerializer, ReportSerializer
)

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommentListView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LikeListView(generics.ListCreateAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LikeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

# Repeat similar structures for Save, Share, Favorite, and Report models
# Example for Save:
class SaveListView(generics.ListCreateAPIView):
    queryset = Save.objects.all()
    serializer_class = SaveSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SaveDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Save.objects.all()
    serializer_class = SaveSerializer
    permission_classes = [IsAuthenticated]
