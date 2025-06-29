from django.urls import path
from .views import bot_endpoint, health_check
from django.http import JsonResponse
from . import views

urlpatterns = [
    path('bot/', bot_endpoint, name='bot-endpoint'),
    path('health/', health_check, name='ai-health'),
    path("list_conversations/", views.list_conversations, name="list_conversations"),
    path("start_conversation/", views.start_conversation, name="start_conversation"),
    path("rename_conversation/", views.rename_conversation, name="rename_conversation"),
    path("delete_conversation/", views.delete_conversation, name="delete_conversation"),
    path("get_messages/", views.get_messages, name="get_messages"),
    path("send_message/", views.send_message, name="send_message"),
    path("edura_analysis/", views.edura_code_analysis, name="edura_code_analysis"),
]
