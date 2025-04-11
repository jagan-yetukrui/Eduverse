from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import UserProfileSerializer
from accounts.views import UpdateUserProfile, UserProfileView


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ✅ Profile-related endpoints
    path("update-profile/", UpdateUserProfile.as_view(), name="update-profile"),
    path("profiles/me/", UserProfileView.as_view(), name="user-profile"),
]
