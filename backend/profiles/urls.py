from django.urls import path
from .views import UserProfileView
from django.contrib import admin
from django.urls import path, include

from .views import WelcomeAPIView

urlpatterns = [
    path('', UserProfileView.as_view(), name='user_profile'),
]


urlpatterns = [
    path('welcome/', WelcomeAPIView.as_view(), name='welcome'),
]