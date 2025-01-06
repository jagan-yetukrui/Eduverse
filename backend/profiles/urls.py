from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')

# Custom profile URLs
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Profile detail and edit
    path('profiles/<str:username>/', ProfileViewSet.as_view({'get': 'retrieve'}), name='profile-detail'),
    path('profiles/<str:username>/edit/', ProfileViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update'
    }), name='profile-edit'),
    
    # Profile content
    path('profiles/<str:username>/posts/', ProfileViewSet.as_view({'get': 'posts'}), name='profile-posts'),
    path('profiles/<str:username>/highlights/', ProfileViewSet.as_view({'get': 'highlights', 'put': 'highlights'}), name='profile-highlights'),
    
    # Settings
    path('profiles/<str:username>/settings/', ProfileViewSet.as_view({
        'get': 'settings',
        'put': 'update_settings',
        'patch': 'partial_update_settings'
    }), name='profile-settings'),
    path('profiles/<str:username>/settings/blocked/', ProfileViewSet.as_view({
        'get': 'blocked_users',
        'post': 'block_user',
        'delete': 'unblock_user'
    }), name='profile-blocked'),
    path('profiles/<str:username>/settings/liked-posts/', ProfileViewSet.as_view({
        'get': 'liked_posts'
    }), name='profile-liked-posts'),
    path('profiles/<str:username>/settings/close-friends/', ProfileViewSet.as_view({
        'get': 'close_friends',
        'post': 'add_close_friend',
        'delete': 'remove_close_friend'
    }), name='profile-close-friends'),
    
    # Follow functionality
    path('profiles/<str:username>/followers/', ProfileViewSet.as_view({'get': 'followers'}), name='profile-followers'),
    path('profiles/<str:username>/following/', ProfileViewSet.as_view({'get': 'following'}), name='profile-following'),
    path('profiles/<str:username>/follow/', ProfileViewSet.as_view({'post': 'follow', 'delete': 'unfollow'}), name='profile-follow'),
    
    # Search
    path('profiles/search/', ProfileViewSet.as_view({'get': 'list'}), name='profile-search'),
    
    # Auth
    path('logout/', ProfileViewSet.as_view({'post': 'logout'}), name='logout'),
    
    # Include router URLs for any additional default endpoints
    path('', include(router.urls)),
]