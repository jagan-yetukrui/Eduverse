from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib import admin
from django.urls import path, include
urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='login'),  # ✅ Fixing the login route
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # ✅ JWT login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
