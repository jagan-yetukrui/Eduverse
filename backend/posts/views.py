from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Post
from .serializers import PostSerializer


class PostListView(generics.ListCreateAPIView):
    """
    API View to list all posts and create a new post.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a post.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]