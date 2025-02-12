from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ProfileListView,
    CreatePostView,
    ListPostsView,
)
urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),  # Ensure this is correct
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/profile/", ProfileView.as_view(), name="profile"),
    path("api/profiles/", ProfileListView.as_view(), name="profile_list"),
    path("api/posts/new/", CreatePostView.as_view(), name="create_post"),
    path("api/posts/", ListPostsView.as_view(), name="list_posts"),
]