from django.urls import path
from . import views

urlpatterns = [
    path('educational/', views.educational_scraper_view, name='educational_scraper'),
    path('jobs/', views.job_scraper_view, name='job_scraper'),
    path('skills/', views.skill_scraper_view, name='skill_scraper'),
]
