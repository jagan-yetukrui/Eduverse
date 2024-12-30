# search/views.py
from django.db.models import Q # Import Q for complex queries (OR, AND, NOT)
from django.http import JsonResponse # Import JsonResponse to return JSON response

from accounts.models import CustomUser # accounts app
from posts.models import Post # posts app
from profiles.models import Profile  # profiles app

def search(request):
    query = request.GET.get('query', '')
    name_filter = request.GET.get('name', '')
    post_type_filter = request.GET.get('post_type', '')

    # Searching CustomUser (accounts app)
    users = CustomUser.objects.filter(Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query))
    if name_filter:
        users = users.filter(Q(username__icontains=name_filter) | Q(first_name__icontains=name_filter) | Q(last_name__icontains=name_filter))

    # Searching Posts (posts app)
    posts = Post.objects.filter(Q(title__icontains=query) | Q(content__icontains=query))
    if post_type_filter:
        posts = posts.filter(post_type=post_type_filter)

    # Combine results
    user_results = [{"username": user.username, "email": user.email} for user in users]
    post_results = [{"title": post.title, "content": post.content, "post_type": post.post_type} for post in posts]

    return JsonResponse({
        'users': user_results,
        'posts': post_results,
    })
