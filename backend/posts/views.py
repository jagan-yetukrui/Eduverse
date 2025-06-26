from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]  # ✅ Requires authentication

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)  # ✅ Auto-assign logged-in user
        
        # Handle multiple image uploads - safely check for images
        images = []
        if hasattr(self.request, 'FILES'):
            images = self.request.FILES.getlist('images')
        
        if images:
            # Validate number of images (max 5)
            if len(images) > 5:
                raise serializers.ValidationError("Maximum 5 images allowed per post")
            
            # Create PostImage instances for each uploaded image
            for index, image in enumerate(images):
                PostImage.objects.create(
                    post=post,
                    image=image,
                    order=index
                )


class PostListView(generics.ListCreateAPIView):
    """
    API View to list all posts and create a new post.
    """

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        
        # Handle multiple image uploads - safely check for images
        images = []
        if hasattr(self.request, 'FILES'):
            images = self.request.FILES.getlist('images')
        
        if images:
            # Validate number of images (max 5)
            if len(images) > 5:
                raise serializers.ValidationError("Maximum 5 images allowed per post")
            
            # Create PostImage instances for each uploaded image
            for index, image in enumerate(images):
                PostImage.objects.create(
                    post=post,
                    image=image,
                    order=index
                )


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update, and delete a post.
    """

    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]


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
    