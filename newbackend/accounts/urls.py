from django.urls import path
from .views import RegisterView, LoginView, ProfileView, ProfileListView
from rest_framework_simplejwt import views as jwt_views
from .views import RegisterView, LoginView, ProfileView, ProfileListView, LogoutView
from . import views


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/list', ProfileListView.as_view(), name='profile_list'),
    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/posts/", views.get_posts, name="get_posts"),  # For retrieving posts
    path("api/posts/new/", views.create_post, name="create_post"),  # For creating new posts
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]