from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet

router = DefaultRouter()
router.register(r'', ProfileViewSet, basename='profile')

# Custom profile URLs
urlpatterns = [
    
    # Profile detail and edit
    path('me/', ProfileViewSet.as_view({'get': 'me', 'put': 'me', 'patch': 'me'}), name='profile-me'),
    path('me/stats/', ProfileViewSet.as_view({'get': 'stats'}), name='profile-stats'),
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
    path('<str:username>/block-user/', ProfileViewSet.as_view({
        'post': 'block_user',
        'delete': 'unblock_user'
    }), name='profile-block-user'),
    path('<str:username>/settings/security/password/', ProfileViewSet.as_view({
        'put': 'update_password'
    }), name='profile-security-password'),
    path('<str:username>/settings/security/tfa/', ProfileViewSet.as_view({
        'get': 'tfa_status',
        'post': 'enable_tfa',
        'delete': 'disable_tfa'
    }), name='profile-security-tfa'),
    path('<str:username>/settings/security/logout-all/', ProfileViewSet.as_view({
        'post': 'logout_all_sessions'
    }), name='profile-security-logout-all'),
    path('<str:username>/settings/blocked/', ProfileViewSet.as_view({
        'get': 'blocked_users',
        'post': 'block_user',
        'delete': 'unblock_user'
    }), name='profile-blocked'),
    path('<str:username>/settings/liked-posts/', ProfileViewSet.as_view({
        'get': 'liked_posts'
    }), name='profile-liked-posts'),
    path('<str:username>/settings/close-friends/', ProfileViewSet.as_view({
        'get': 'close_friends',
        'post': 'add_close_friend',
        'delete': 'remove_close_friend'
    }), name='profile-close-friends'),
    
    # Education, Experience and Licenses
    path('<str:username>/education/', ProfileViewSet.as_view({
        'get': 'education_details',
        'post': 'add_education',
        'put': 'update_education',
        'delete': 'remove_education'
    }), name='profile-education'),
    path('<str:username>/experience/', ProfileViewSet.as_view({
        'get': 'experiences',
        'post': 'add_experience',
        'put': 'update_experience',
        'delete': 'remove_experience'
    }), name='profile-experience'),
    path('<str:username>/licenses/', ProfileViewSet.as_view({
        'get': 'licenses',
        'post': 'add_license',
        'put': 'update_license',
        'delete': 'remove_license'
    }), name='profile-licenses'),
    
    # Help & Support
    path('help/faqs/', ProfileViewSet.as_view({
        'get': 'faqs'
    }), name='help-faqs'),
    path('help/support/', ProfileViewSet.as_view({
        'post': 'submit_support_request'
    }), name='help-support'),
    
    # Follow functionality
    path('<str:username>/followers/', ProfileViewSet.as_view({'get': 'followers'}), name='profile-followers'),
    path('<str:username>/following/', ProfileViewSet.as_view({'get': 'following'}), name='profile-following'),
    path('<str:username>/follow/', ProfileViewSet.as_view({'post': 'follow', 'delete': 'unfollow'}), name='profile-follow'),
    path('<str:username>/unfollow/', ProfileViewSet.as_view({'post': 'unfollow'}), name='profile-unfollow'),
    
    # Search
    path('search/', ProfileViewSet.as_view({'get': 'list'}), name='profile-search'),
    
    # Auth
    path('logout/', ProfileViewSet.as_view({'post': 'logout'}), name='logout'),
    
    # Include router URLs for any additional default endpoints
    path('', include(router.urls)),
]