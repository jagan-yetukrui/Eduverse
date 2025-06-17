from django.urls import path
from . import views

urlpatterns = [
    path('<str:username>/', views.PublicProfileView.as_view(), name='public-profile'),
    path('follow/', views.FollowActionView.as_view(), name='follow-action'),
] 