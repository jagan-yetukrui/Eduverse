from django.urls import path
from .views import *

urlpatterns = [
    path("", PostListView.as_view(), name="post-list"),
    path("<int:pk>/", PostDetailView.as_view(), name="post-detail"),
    path("comments/", CommentListView.as_view(), name="comment-list"),
    path("comments/<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
    path("likes/", LikeListView.as_view(), name="like-list"),
    path("likes/<int:pk>/", LikeDetailView.as_view(), name="like-detail"),
    path("save/", SaveListView.as_view(), name="save-list"),
    path("save/<int:pk>/", SaveDetailView.as_view(), name="save-detail"),
    path("share/", ShareListView.as_view(), name="share-list"),
    path("share/<int:pk>/", ShareDetailView.as_view(), name="share-detail"),
    path("favorite/", FavoriteListView.as_view(), name="favorite-list"),
    path("favorite/<int:pk>/", FavoriteDetailView.as_view(), name="favorite-detail"),
    path("report/", ReportListView.as_view(), name="report-list"),
    path("report/<int:pk>/", ReportDetailView.as_view(), name="report-detail"),
]
