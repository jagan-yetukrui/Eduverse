from django.urls import path
from .views import bot_endpoint
from django.http import JsonResponse

urlpatterns = [
    path('bot/', bot_endpoint, name='bot-endpoint'),
    path('health/', lambda request: JsonResponse({'status': 'healthy'}), name='ai-health'),
]
