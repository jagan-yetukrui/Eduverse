from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.bot_endpoint, name='chatbot'),
]
