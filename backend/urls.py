from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),  # ✅ Ensures /api/login/ works
    path('api/posts/', include('posts.urls')),
]
