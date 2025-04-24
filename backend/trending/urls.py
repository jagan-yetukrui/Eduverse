from django.urls import path
from .views import trending_projects

urlpatterns = [
    path('trending', trending_projects, name='trending_projects'),
]
