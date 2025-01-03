from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status, viewsets, permissions, filters
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .serializers import ProfileSerializer
from .models import Profile

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'display_name']

    def get_queryset(self):
        queryset = Profile.objects.all()
        
        # Handle search
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(username__icontains=search_query) |
                Q(display_name__icontains=search_query)
            )
            
        # Handle /profiles/me endpoint
        if self.action == 'me':
            return Profile.objects.filter(user=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile = request.user.profile
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        profile = self.get_object()
        posts = profile.user.posts.all()
        return Response({
            'posts': [
                {
                    'id': post.id,
                    'title': post.title,
                    'content': post.content,
                    'created_at': post.created_at,
                    'thumbnail': post.thumbnail.url if post.thumbnail else None
                } for post in posts
            ]
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        profile_to_follow = self.get_object()
        user_profile = request.user.profile
        
        if profile_to_follow == user_profile:
            return Response(
                {'error': 'You cannot follow yourself'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user_profile.following.add(profile_to_follow)
        return Response({
            'status': 'following',
            'followers_count': profile_to_follow.followers.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request, pk=None):
        profile_to_unfollow = self.get_object()
        user_profile = request.user.profile
        
        if profile_to_unfollow == user_profile:
            return Response(
                {'error': 'You cannot unfollow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user_profile.following.remove(profile_to_unfollow)
        return Response({
            'status': 'unfollowed',
            'followers_count': profile_to_unfollow.followers.count()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def following_status(self, request, pk=None):
        profile = self.get_object()
        is_following = False
        
        if request.user.is_authenticated:
            user_profile = request.user.profile
            is_following = user_profile.following.filter(id=profile.id).exists()
            
        return Response({
            'is_following': is_following,
            'followers_count': profile.followers.count(),
            'following_count': profile.following.count()
        })

    @action(detail=True, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def highlights(self, request, pk=None):
        profile = self.get_object()
        
        if request.user.profile != profile:
            return Response(
                {'error': 'You can only modify your own highlights'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        highlights = request.data.get('highlights', {})
        profile.highlights = highlights
        profile.save()
        
        return Response({
            'highlights': profile.highlights
        })
