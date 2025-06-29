from django.urls import path
from .views import upcoming_events

urlpatterns = [
    path('upcoming', upcoming_events, name='upcoming_events'),
]
