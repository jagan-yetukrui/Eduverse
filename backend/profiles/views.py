from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status, viewsets, permissions, filters
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from .serializers import (
    ProfileSerializer, SettingsSerializer, EditProfileSerializer,
    PrivacySettingsSerializer, NotificationSettingsSerializer,
    SecuritySettingsSerializer, BlockedUserSerializer, CloseFriendSerializer
)
from .models import Profile, Education, License, Experience

class ProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling all profile-related operations including settings management
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'display_name']

    def get_queryset(self):
        """
        Get and filter queryset based on search parameters and endpoint
        """
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
        """Create a new profile linked to the authenticated user"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        if not hasattr(user, 'profile'):
            return Response({"error": "Profile not found"}, status=404)
        
        profile = user.profile
        posts_count = profile.posts.count() if hasattr(profile, 'posts') and profile.posts else 0
        followers_count = profile.followers.count() if hasattr(profile, 'followers') and profile.followers else 0
        following_count = profile.following.count() if hasattr(profile, 'following') and profile.following else 0
        projects_count = profile.projects.count() if hasattr(profile, 'projects') and profile.projects else 0

        stats = {
            "posts_count": posts_count,
            "followers_count": followers_count,
            "following_count": following_count,
            "projects_count": projects_count,
        }
        return Response(stats)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated], url_path='me', url_name='me')
    def me(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=401)

        # Assuming 'profile' is a related name on your User model
        try:
            profile = user.profile
        except AttributeError:
            return Response({"detail": "Profile not found."}, status=404)

        # Serialize and return the profile
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='me/stats', url_name='me-stats')
    def me_stats(self, request):
        """Get statistics for the current user's profile"""
        try:
            profile = request.user.profile
            return Response({
                'followers_count': profile.followers.count(),
                'following_count': profile.following.count(),
                'posts_count': profile.user.posts.count(),
                'education_count': profile.education_details.count(),
                'licenses_count': profile.licenses.count(),
                'blocked_users_count': profile.blocked_users.count(),
                'close_friends_count': profile.close_friends.count()
            })
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Retrieve all posts for a specific profile"""
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
        """Follow another user's profile"""
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
        """Unfollow another user's profile"""
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
        """Get following status and counts for a profile"""
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
        """Update profile highlights"""
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

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def privacy_settings(self, request, pk=None):
        """Retrieve privacy settings for a profile"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        serializer = PrivacySettingsSerializer(profile.privacy_settings)
        return Response(serializer.data)

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_privacy_settings(self, request, pk=None):
        """Update privacy settings for a profile"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PrivacySettingsSerializer(data=request.data)
        if serializer.is_valid():
            profile.privacy_settings = serializer.validated_data
            profile.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def notification_settings(self, request, pk=None):
        """Retrieve notification preferences"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        serializer = NotificationSettingsSerializer(profile.notification_settings)
        return Response(serializer.data)

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_notification_settings(self, request, pk=None):
        """Update notification preferences"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = NotificationSettingsSerializer(data=request.data)
        if serializer.is_valid():
            profile.notification_settings = serializer.validated_data
            profile.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_password(self, request, pk=None):
        """Change user password with old password verification"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not profile.user.check_password(old_password):
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
            
        profile.user.password = make_password(new_password)
        profile.user.save()
        return Response({'status': 'Password updated successfully'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def tfa_status(self, request, pk=None):
        """Check two-factor authentication status"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        serializer = SecuritySettingsSerializer(profile.security_settings)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enable_tfa(self, request, pk=None):
        """Enable two-factor authentication"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        profile.security_settings['two_factor_auth'] = True
        profile.save()
        return Response({'status': 'Two-factor authentication enabled'})

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def disable_tfa(self, request, pk=None):
        """Disable two-factor authentication"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        profile.security_settings['two_factor_auth'] = False
        profile.save()
        return Response({'status': 'Two-factor authentication disabled'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def blocked_users(self, request, pk=None):
        """Get list of blocked users"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        serializer = BlockedUserSerializer(profile.blocked_users.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def block_user(self, request, pk=None):
        """Block a user"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = BlockedUserSerializer(data=request.data)
        if serializer.is_valid():
            user_to_block = get_object_or_404(Profile, id=serializer.validated_data['user_id'])
            profile.blocked_users.add(user_to_block)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unblock_user(self, request, pk=None):
        """Unblock a previously blocked user"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        user_to_unblock = get_object_or_404(Profile, id=request.data.get('user_id'))
        profile.blocked_users.remove(user_to_unblock)
        return Response({'status': f'User {user_to_unblock.username} unblocked'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def close_friends(self, request, pk=None):
        """Get close friends list"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CloseFriendSerializer(profile.close_friends.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_close_friend(self, request, pk=None):
        """Add user to close friends list"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = CloseFriendSerializer(data=request.data)
        if serializer.is_valid():
            friend = get_object_or_404(Profile, id=serializer.validated_data['user_id'])
            profile.close_friends.add(friend)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated]) 
    def remove_close_friend(self, request, pk=None):
        """Remove user from close friends list"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        friend = get_object_or_404(Profile, id=request.data.get('user_id'))
        profile.close_friends.remove(friend)
        return Response({'status': f'User {friend.username} removed from close friends'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def liked_posts(self, request, pk=None):
        """Get liked posts"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'liked_posts': profile.liked_posts.values()})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def education_details(self, request, pk=None):
        """Get education details"""
        profile = self.get_object()
        education = Education.objects.filter(profile=profile)
        return Response({'education': education.values()})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_education(self, request, pk=None):
        """Add education details"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        education = Education.objects.create(
            profile=profile,
            **request.data
        )
        return Response({'status': 'Education details added'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def experiences(self, request, pk=None):
        """Get work experiences"""
        profile = self.get_object()
        experiences = Experience.objects.filter(profile=profile)
        return Response({'experiences': experiences.values()})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_experience(self, request, pk=None):
        """Add work experience"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        experience = Experience.objects.create(
            profile=profile,
            **request.data
        )
        return Response({'status': 'Experience added'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def licenses(self, request, pk=None):
        """Get licenses and certifications"""
        profile = self.get_object()
        licenses = License.objects.filter(profile=profile)
        return Response({'licenses': licenses.values()})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_license(self, request, pk=None):
        """Add license or certification"""
        profile = self.get_object()
        if request.user.profile != profile:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        license = License.objects.create(
            profile=profile,
            **request.data
        )
        return Response({'status': 'License added'})

    @action(detail=False, methods=['get'])
    def faqs(self, request):
        """Retrieve frequently asked questions"""
        return Response({
            'faqs': [
                {
                    'question': 'How do I change my password?',
                    'answer': 'Go to Settings > Account Security > Change Password'
                },
                {
                    'question': 'How do I enable two-factor authentication?',
                    'answer': 'Go to Settings > Account Security > Two-Factor Authentication'
                }
                # Add more FAQs as needed
            ]
        })

    @action(detail=False, methods=['post'])
    def submit_support_request(self, request):
        """Submit a support request ticket"""
        subject = request.data.get('subject')
        message = request.data.get('message')
        email = request.data.get('email')
        
        if not all([subject, message, email]):
            return Response(
                {'error': 'Please provide subject, message and email'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Here you would typically save the support request or send it to your support system
        return Response({
            'status': 'Support request submitted successfully',
            'ticket_id': '12345'  # Generate actual ticket ID in production
        })
