from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework import status, viewsets, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from .serializers import (
    ProfileSerializer, ProfileUpdateSerializer, SettingsSerializer,
    PrivacySettingsSerializer, NotificationSettingsSerializer,
    SecuritySettingsSerializer, BlockedUserSerializer, CloseFriendSerializer,
    EducationSerializer, ExperienceSerializer, LicenseSerializer, ProjectSerializer
)
from .models import Profile, Education, License, Experience, Project


class ProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling all profile-related operations including settings management
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'display_name']
    lookup_field = 'user__username'
    parsers = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        """Add request to serializer context for absolute URL generation"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = Profile.objects.all()
        if self.action == 'list':
            # For list view, only return public profiles
            queryset = queryset.filter(privacy_settings__profile_visibility='public')
        return queryset

    def get_user_by_username(self, request, username=None):
        """
        Retrieve a user profile by username.
        """
        try:
            profile = Profile.objects.get(user__username=username)
            serializer = self.get_serializer(profile, context={'request': request})
            data = serializer.data

            # Add following status for authenticated users
            if request.user.is_authenticated:
                data['is_following'] = request.user.profile.following.filter(id=profile.id).exists()
            else:
                data['is_following'] = False

            return Response(data)
        except Profile.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
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

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated], url_path='me', url_name='me')
    def me(self, request, *args, **kwargs):
        """
        GET: Retrieve current user's full profile
        PATCH: Update current user's profile (supports multipart form data for image uploads)
        """
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=401)

        try:
            profile = user.profile
        except AttributeError:
            return Response({"detail": "Profile not found."}, status=404)

        if request.method == 'GET':
            # Return full profile with nested data
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Handle profile updates with multipart form data support
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # Return updated profile with full data
                full_serializer = ProfileSerializer(profile, context={'request': request})
                return Response(full_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='me/stats', url_name='me-stats')
    def me_stats(self, request):
        """Get statistics for the current user's profile"""
        try:
            profile = request.user.profile
            return Response({
                'followers_count': profile.followers.count(),
                'following_count': profile.following.count(),
                'posts_count': profile.user.posts.count() if hasattr(profile.user, 'posts') else 0,
                'education_count': profile.education_details.count(),
                'experience_count': profile.experiences.count(),
                'licenses_count': profile.licenses.count(),
                'projects_count': profile.projects.count(),
                'blocked_users_count': profile.blocked_users.count(),
                'close_friends_count': profile.close_friends.count()
            })
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Profile not found for this user'},
                status=status.HTTP_404_NOT_FOUND
            )

    # Education Management Endpoints
    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated], url_path='me/education', url_name='me-education')
    def me_education(self, request):
        """
        GET: Retrieve all education entries for current user
        POST: Add new education entry
        """
        profile = request.user.profile
        
        if request.method == 'GET':
            education_list = profile.education_details.all()
            serializer = EducationSerializer(education_list, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = EducationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(profile=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put', 'delete'], permission_classes=[IsAuthenticated], url_path='me/education/(?P<education_id>[^/.]+)', url_name='me-education-detail')
    def me_education_detail(self, request, education_id=None):
        """
        PUT: Update specific education entry
        DELETE: Delete specific education entry
        """
        profile = request.user.profile
        
        try:
            education = profile.education_details.get(id=education_id)
        except Education.DoesNotExist:
            return Response({"detail": "Education entry not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'PUT':
            serializer = EducationSerializer(education, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            education.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    # Experience Management Endpoints
    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated], url_path='me/experience', url_name='me-experience')
    def me_experience(self, request):
        """
        GET: Retrieve all experience entries for current user
        POST: Add new experience entry
        """
        profile = request.user.profile
        
        if request.method == 'GET':
            experience_list = profile.experiences.all()
            serializer = ExperienceSerializer(experience_list, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ExperienceSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(profile=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put', 'delete'], permission_classes=[IsAuthenticated], url_path='me/experience/(?P<experience_id>[^/.]+)', url_name='me-experience-detail')
    def me_experience_detail(self, request, experience_id=None):
        """
        PUT: Update specific experience entry
        DELETE: Delete specific experience entry
        """
        profile = request.user.profile
        
        try:
            experience = profile.experiences.get(id=experience_id)
        except Experience.DoesNotExist:
            return Response({"detail": "Experience entry not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'PUT':
            serializer = ExperienceSerializer(experience, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            experience.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    # License Management Endpoints
    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated], url_path='me/licenses', url_name='me-licenses')
    def me_licenses(self, request):
        """
        GET: Retrieve all license entries for current user
        POST: Add new license entry
        """
        profile = request.user.profile
        
        if request.method == 'GET':
            license_list = profile.licenses.all()
            serializer = LicenseSerializer(license_list, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = LicenseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(profile=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put', 'delete'], permission_classes=[IsAuthenticated], url_path='me/licenses/(?P<license_id>[^/.]+)', url_name='me-licenses-detail')
    def me_licenses_detail(self, request, license_id=None):
        """
        PUT: Update specific license entry
        DELETE: Delete specific license entry
        """
        profile = request.user.profile
        
        try:
            license_obj = profile.licenses.get(id=license_id)
        except License.DoesNotExist:
            return Response({"detail": "License entry not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'PUT':
            serializer = LicenseSerializer(license_obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            license_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    # Project Management Endpoints
    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated], url_path='me/projects', url_name='me-projects')
    def me_projects(self, request):
        """
        GET: Retrieve all project entries for current user
        POST: Add new project entry (supports multipart form data for image uploads)
        """
        profile = request.user.profile
        
        if request.method == 'GET':
            project_list = profile.projects.all()
            serializer = ProjectSerializer(project_list, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Handle multipart form data for image uploads
            serializer = ProjectSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(profile=profile)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put', 'patch', 'delete'], permission_classes=[IsAuthenticated], url_path='me/projects/(?P<project_id>[^/.]+)', url_name='me-projects-detail')
    def me_projects_detail(self, request, project_id=None):
        """
        PUT/PATCH: Update specific project entry (supports multipart form data for image uploads)
        DELETE: Delete specific project entry
        """
        profile = request.user.profile
        
        try:
            project = profile.projects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"detail": "Project entry not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method in ['PUT', 'PATCH']:
            # Debug logging to identify validation issues
            print("=== PROJECT UPDATE DEBUG ===")
            print(f"Method: {request.method}")
            print(f"Project ID: {project_id}")
            print("Request Data:", request.data)
            print("Request Files:", request.FILES)
            print("Content Type:", request.content_type)
            print("================================")
            
            # Handle multipart form data for image uploads
            serializer = ProjectSerializer(project, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                print("✅ Project updated successfully")
                return Response(serializer.data)
            else:
                print("❌ Validation failed:")
                print("Serializer Errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            project.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    # Legacy endpoints for backward compatibility
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Retrieve all posts for a specific profile"""
        profile = self.get_object()
        posts = profile.user.posts.all() if hasattr(profile.user, 'posts') else []
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
        
        # Check if user is trying to follow themselves
        if profile_to_follow == user_profile:
            return Response(
                {'error': 'You cannot follow yourself'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if already following
        if user_profile.following.filter(id=profile_to_follow.id).exists():
            return Response(
                {'detail': 'Already following this user'},
                status=status.HTTP_200_OK
            )
            
        user_profile.following.add(profile_to_follow)
        return Response({
            'status': 'following',
            'followers_count': profile_to_follow.followers.count()
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request, pk=None):
        """Unfollow another user's profile"""
        profile_to_unfollow = self.get_object()
        user_profile = request.user.profile
        
        # Check if user is trying to unfollow themselves
        if profile_to_unfollow == user_profile:
            return Response(
                {'error': 'You cannot unfollow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if not following
        if not user_profile.following.filter(id=profile_to_unfollow.id).exists():
            return Response(
                {'detail': 'Not following this user'},
                status=status.HTTP_200_OK
            )
            
        user_profile.following.remove(profile_to_unfollow)
        return Response(status=status.HTTP_204_NO_CONTENT)

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

    # Settings management endpoints
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

    # Additional utility endpoints
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def followers(self, request, pk=None):
        """Get list of followers for a profile"""
        profile = self.get_object()
        followers = profile.followers.all()
        return Response({
            'followers': [
                {'id': follower.id, 'username': follower.user.username, 'display_name': follower.display_name}
                for follower in followers
            ]
        })

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def following(self, request, pk=None):
        """Get list of users that this profile is following"""
        profile = self.get_object()
        following = profile.following.all()
        return Response({
            'following': [
                {'id': followed.id, 'username': followed.user.username, 'display_name': followed.display_name}
                for followed in following
            ]
        })

    @action(detail=False, methods=['get'])
    def faqs(self, request):
        """Get frequently asked questions"""
        faqs = [
                {
                "question": "How do I update my profile?",
                "answer": "You can update your profile by going to the Edit Profile section and making changes to your information."
                },
                {
                "question": "Can I edit my skills?",
                "answer": "Skills are automatically generated by AI based on your activities and cannot be manually edited."
            },
            {
                "question": "How do I add education or experience?",
                "answer": "You can add education and experience entries through the dedicated sections in your profile."
            }
        ]
        return Response({"faqs": faqs})

    @action(detail=False, methods=['post'])
    def submit_support_request(self, request):
        """Submit a support request"""
        subject = request.data.get('subject')
        message = request.data.get('message')
        user_email = request.data.get('email')
        
        if not all([subject, message, user_email]):
            return Response(
                {'error': 'Subject, message, and email are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Here you would typically send an email or create a support ticket
        # For now, we'll just return a success response
        return Response({
            'message': 'Support request submitted successfully',
            'ticket_id': 'SUP-' + str(hash(subject + message + user_email))[-8:]
        }, status=status.HTTP_201_CREATED)
