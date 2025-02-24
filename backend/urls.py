from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, LogoutView, ProfileView, ProfileListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),  # ✅ Login endpoint
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/list/', ProfileListView.as_view(), name='profile_list'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # ✅ JWT login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
