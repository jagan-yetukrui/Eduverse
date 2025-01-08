from django.urls import path, include
from profiles.views import ProfileView

urlpatterns = [
    path('api/profiles/me', ProfileView.as_view(), name='profile_me'),
    path('api/profiles/<str:user_id>', ProfileView.as_view(), name='profile_detail'),
    path('api/profiles/', include('profiles.urls')),
] 