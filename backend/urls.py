from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token', include('accounts.urls')),  # ✅ Ensures /api/login/ works
    path('api/posts/', include('posts.urls')),
    path('api/profile/', include('profiles.urls')),  # ✅ Profile endpoint
]
