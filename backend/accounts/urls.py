from django.urls import path
from .views import AccountsRootView, RegisterView, LoginView, ProtectedView
from rest_framework_simplejwt.views import TokenRefreshView,  TokenObtainPairView

urlpatterns = [
    path('', AccountsRootView.as_view(), name='accounts-root'),  # Root of `/api/accounts/`
    path('register/', RegisterView.as_view(), name='register'),
     path('login/', TokenObtainPairView.as_view(), name='login'),  # ✅ Ensures login works
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected-endpoint/', ProtectedView.as_view(), name='protected-endpoint'),
]
