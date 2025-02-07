from django.urls import path
from .views import RegisterView, LoginView, ProfileView, ProfileListView
from rest_framework_simplejwt import views as jwt_views
from .views import RegisterView, LoginView, ProfileView, ProfileListView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/list', ProfileListView.as_view(), name='profile_list'),
    path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]