from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.urls import path


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', lambda request: HttpResponse("Welcome to Eduverse!")),
    path("admin/", admin.site.urls), #Works
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),#works
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"), #works
    path("api/accounts/", include("accounts.urls")),  # Include the accounts app's URLs #Doesn't work  
    path("api/profiles/", include("profiles.urls")), #works
    path("api/search/", include("search.urls")), #works
    path("api/posts/", include("posts.urls")),  # Include the posts app's URLs #Works 
    path('ai/', include('ai.urls')),# has the chatbot   
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
