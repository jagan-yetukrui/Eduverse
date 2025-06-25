from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')

# Enhanced profile URLs with proper routing for nested sections
urlpatterns = [
    # Main profile endpoints
    path('me/', ProfileViewSet.as_view({'get': 'me', 'patch': 'me'}), name='profile-me'),
    path('me/stats/', ProfileViewSet.as_view({'get': 'me_stats'}), name='profile-me-stats'),
    
    # Education management endpoints
    path('me/education/', ProfileViewSet.as_view({'get': 'me_education', 'post': 'me_education'}), name='profile-me-education'),
    path('me/education/<int:education_id>/', ProfileViewSet.as_view({'put': 'me_education_detail', 'delete': 'me_education_detail'}), name='profile-me-education-detail'),
    
    # Experience management endpoints
    path('me/experience/', ProfileViewSet.as_view({'get': 'me_experience', 'post': 'me_experience'}), name='profile-me-experience'),
    path('me/experience/<int:experience_id>/', ProfileViewSet.as_view({'put': 'me_experience_detail', 'delete': 'me_experience_detail'}), name='profile-me-experience-detail'),
    
    # License management endpoints
    path('me/licenses/', ProfileViewSet.as_view({'get': 'me_licenses', 'post': 'me_licenses'}), name='profile-me-licenses'),
    path('me/licenses/<int:license_id>/', ProfileViewSet.as_view({'put': 'me_licenses_detail', 'delete': 'me_licenses_detail'}), name='profile-me-licenses-detail'),
    
    # Project management endpoints
    path('me/projects/', ProfileViewSet.as_view({'get': 'me_projects', 'post': 'me_projects'}), name='profile-me-projects'),
    path('me/projects/<int:project_id>/', ProfileViewSet.as_view({'put': 'me_projects_detail', 'patch': 'me_projects_detail', 'delete': 'me_projects_detail'}), name='profile-me-projects-detail'),
    
    # User profile by username (public access)
    path('users/<str:username>/', ProfileViewSet.as_view({'get': 'get_user_by_username'}), name='user-profile'),
    
    # Profile detail and edit (legacy)
    path('<str:username>/', ProfileViewSet.as_view({'get': 'retrieve'}), name='profile-detail'),
    path('<str:username>/edit/', ProfileViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update'
    }), name='profile-edit'),
    
    # Profile content
    path('<str:username>/posts/', ProfileViewSet.as_view({'get': 'posts'}), name='profile-posts'),
    path('<str:username>/highlights/', ProfileViewSet.as_view({'get': 'highlights', 'put': 'highlights'}), name='profile-highlights'),
    
    # Settings
    path('<str:username>/settings/', ProfileViewSet.as_view({
        'get': 'settings',
        'put': 'update_settings',
        'patch': 'partial_update_settings'
    }), name='profile-settings'),
    path('<str:username>/privacy/', ProfileViewSet.as_view({
        'get': 'privacy_settings',
        'patch': 'update_privacy_settings'
    }), name='profile-privacy'),
    path('<str:username>/notifications/', ProfileViewSet.as_view({
        'get': 'notification_settings',
        'patch': 'update_notification_settings'
    }), name='profile-notifications'),
    
    # Follow functionality
    path('<str:username>/followers/', ProfileViewSet.as_view({'get': 'followers'}), name='profile-followers'),
    path('<str:username>/following/', ProfileViewSet.as_view({'get': 'following'}), name='profile-following'),
    path('<str:username>/follow/', ProfileViewSet.as_view({'post': 'follow', 'delete': 'unfollow'}), name='profile-follow'),
    path('<str:username>/unfollow/', ProfileViewSet.as_view({'post': 'unfollow'}), name='profile-unfollow'),
    path('<str:username>/following-status/', ProfileViewSet.as_view({'get': 'following_status'}), name='profile-following-status'),
    
    # Help & Support
    path('help/faqs/', ProfileViewSet.as_view({'get': 'faqs'}), name='help-faqs'),
    path('help/support/', ProfileViewSet.as_view({'post': 'submit_support_request'}), name='help-support'),
    
    # Search
    path('search/', ProfileViewSet.as_view({'get': 'list'}), name='profile-search'),
    
    # Include router URLs for any additional default endpoints
    path('', include(router.urls)),
]