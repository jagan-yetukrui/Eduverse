from django.contrib import admin
from django.urls import path, include
from profiles.views import ProfileView
from accounts.views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomTokenBlacklistView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/profiles/me', ProfileView.as_view(), name='profile_me'),
    path('api/profiles/<str:user_id>', ProfileView.as_view(), name='profile_detail'),
    path('api/profiles/', include('profiles.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/logout/', CustomTokenBlacklistView.as_view(), name='token_blacklist'),
] 