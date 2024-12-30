from django.urls import path
from .views import UserProfileView
from django.contrib import admin
from django.urls import path, include

from .views import WelcomeAPIView

urlpatterns = [
<<<<<<< HEAD
    path('', UserProfileView.as_view(), name='user_profile'),
]


urlpatterns = [
    path('welcome/', WelcomeAPIView.as_view(), name='welcome'),
=======
    path('admin/', admin.site.urls),
    path('profiles/', include('profiles.urls')),
>>>>>>> 548e78726cf4e1c3dfb4e14b89210eefa9301a97
]