from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Post
from .serializers import PostSerializer
from .models import *
from .serializers import *


class PostListView(generics.ListCreateAPIView):
    """
    API View to list all posts and create a new post.
    """

    queryset = Post.objects.all().order_by("-created_at")
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]  # Ensure only logged-in users can post


    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a post.
    """

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]


class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users can post
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)  # Automatically assign the logged-in user as the author of the post.




class CommentListView(generics.ListCreateAPIView):
    """
    API View to list all comments and create a new comment.
    """

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a comment.
    """

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]


class LikeListView(generics.ListCreateAPIView):
    """
    API View to list all likes and create a new like.
    """

    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LikeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a like.
    """

    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]


class SaveListView(generics.ListCreateAPIView):
    """
    API View to list all saves and create a new save.
    """

    queryset = Save.objects.all()
    serializer_class = SaveSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SaveDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a save.
    """

    queryset = Save.objects.all()
    serializer_class = SaveSerializer
    permission_classes = [IsAuthenticated]


class ShareListView(generics.ListCreateAPIView):
    """
    API View to list all shares and create a new share.
    """

    queryset = Share.objects.all()
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ShareDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a share.
    """

    queryset = Share.objects.all()
    serializer_class = ShareSerializer
    permission_classes = [IsAuthenticated]


class FavoriteListView(generics.ListCreateAPIView):
    """
    API View to list all favorites and create a new favorite.
    """

    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a favorite.
    """

    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]


class ReportListView(generics.ListCreateAPIView):
    """
    API View to list all reports and create a new report.
    """

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a report.
    """

    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    