# search/views.py
from django.db.models import Q  # Import Q for complex queries (OR, AND, NOT)
from django.http import JsonResponse  # Import JsonResponse to return JSON response

from accounts.models import CustomUser  # accounts app
from posts.models import Post  # posts app
from profiles.models import Profile  # profiles app


def search(request):
    query = request.GET.get("query", "")
    name_filter = request.GET.get("name", "")
    skills_filter = request.GET.get("skills", "")
    post_author_filter = request.GET.get("post_author", "")
    post_type_filter = request.GET.get("post_type", "")

    # Searching CustomUser (accounts app)
    users = CustomUser.objects.filter(
        Q(username__icontains=query)
        | Q(first_name__icontains=query)
        | Q(last_name__icontains=query)
    )
    if name_filter:
        users = users.filter(
            Q(username__icontains=name_filter)
            | Q(first_name__icontains=name_filter)
            | Q(last_name__icontains=name_filter)
        )
    if skills_filter:
        users = users.filter(skills__name__icontains=skills_filter)

    # Searching Posts (posts app)
    posts = Post.objects.filter(Q(title__icontains=query) | Q(content__icontains=query))
    if post_author_filter:
        posts = posts.filter(author__username__icontains=post_author_filter)
    if post_type_filter:
        posts = posts.filter(post_type=post_type_filter)

    # If searching by username, return only user results and hide posts
    if name_filter:
        user_results = [
            {
                "username": user.username,
                "email": user.email,
                "skills": user.skills,
                "profile_picture": (
                    user.profile_picture.url if user.profile_picture else None
                ),
            }
            for user in users
        ]
        return JsonResponse({"users": user_results})  # Hide posts

    # If searching for posts, return only post results and hide users
    if post_author_filter or post_type_filter:
        post_results = [
            {
                "title": post.title,
                "author": post.author.username,
                "content": post.content,
                "post_type": post.post_type,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
            }
            for post in posts
        ]

        return JsonResponse(
            {
                "posts": post_results,
            }
        )
