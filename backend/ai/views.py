from django.shortcuts import render

# Create your views here.
from .serializers import (
    PostSerializer, CommentSerializer, LikeSerializer,
    SaveSerializer
)

from .models import Post
from rest_framework.views import APIView
from rest_framework.response import Response

class PostListCreateView(APIView):
    def get(self, request):
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

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
