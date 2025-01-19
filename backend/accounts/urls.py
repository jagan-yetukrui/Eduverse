from django.urls import path
from .views import AccountsRootView, RegisterView, LoginView, ProtectedView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', AccountsRootView.as_view(), name='accounts-root'),  # Root of `/api/accounts/`
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected-endpoint/', ProtectedView.as_view(), name='protected-endpoint'),
]
