from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/search/', include('search.urls')),
    path('api/othersprofile/', include('othersprofile.urls')),
] 