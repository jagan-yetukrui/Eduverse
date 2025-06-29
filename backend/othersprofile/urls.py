from django.urls import path
from . import views

urlpatterns = [

    path('follow/', views.FollowActionView.as_view(), name='follow-action'),

     # List followers of a user
    path('<str:username>/followers/', views.FollowersListView.as_view(), name='followers-list'),

    # List users that a user is following
    path('<str:username>/following/', views.FollowingListView.as_view(), name='following-list'),

    path('<str:username>/', views.PublicProfileView.as_view(), name='public-profile'),
    
] 