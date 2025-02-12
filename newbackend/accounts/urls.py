from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, ProfileListView, CreatePostView, ListPostsView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profiles/", ProfileListView.as_view(), name="profile_list"),
    path("posts/new/", CreatePostView.as_view(), name="create_post"),
    path("posts/", ListPostsView.as_view(), name="list_posts"),
]
