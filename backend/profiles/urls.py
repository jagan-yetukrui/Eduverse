from django.urls import path
from .views import UserProfileView
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet

from .views import WelcomeAPIView

urlpatterns = [
    path('', UserProfileView.as_view(), name='user_profile'),
]


urlpatterns = [
    path('welcome/', WelcomeAPIView.as_view(), name='welcome'),
    path('admin/', admin.site.urls),
    path('profiles/', include('profiles.urls')),
]



router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
]