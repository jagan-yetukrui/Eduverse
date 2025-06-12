from django.urls import path
from .views import bot_endpoint

urlpatterns = [
    path('bot/', bot_endpoint, name='bot-endpoint'),
]
