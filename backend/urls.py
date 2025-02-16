from django.urls import path, include
from profiles.views import ProfileView, PostListCreateView, CommentListView

urlpatterns = [
    path('api/profiles/me', ProfileView.as_view(), name='profile_me'),
    path('api/profiles/<str:user_id>', ProfileView.as_view(), name='profile_detail'),
    path('api/profiles/', include('profiles.urls')),
    path('api/posts/', include('posts.urls')),
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('comments/', CommentListView.as_view(), name='comment-list-create'),
] 