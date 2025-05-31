# search/views.py
from django.db.models import Q, Count
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from accounts.models import CustomUser
from posts.models import Post
from profiles.models import Profile
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """
    Search endpoint for users and posts with filtering and relevance scoring
    """
    try:
        # Get and validate search parameters
        query = request.GET.get("query", "").strip()
        search_type = request.GET.get("type", "all")
        post_type = request.GET.get("post_type", None)
        time_filter = request.GET.get("time", None)
        
        # Validate inputs
        if not query:
            return Response({"error": "Search query is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if search_type not in ["all", "users", "posts"]:
            return Response({"error": "Invalid search type"}, status=status.HTTP_400_BAD_REQUEST)
        
        results = {
            "users": [],
            "posts": [],
            "total_results": 0
        }
        
        # Search users
        if search_type in ["all", "users"]:
            users = _search_users(query, request.user)
            results["users"] = users
        
        # Search posts
        if search_type in ["all", "posts"]:
            posts = _search_posts(query, post_type, time_filter)
            results["posts"] = posts
        
        results["total_results"] = len(results["users"]) + len(results["posts"])
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": "An error occurred while searching", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _search_users(query, current_user):
    """Search for users based on query"""
    users = CustomUser.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query)
    ).select_related('profile')
    
    # Exclude current user if authenticated
    if current_user.is_authenticated:
        users = users.exclude(id=current_user.id)
    
    user_results = []
    for user in users:
        try:
            profile = getattr(user, 'profile', None)
            if not profile:
                continue
                
            mutual_followers = 0
            is_following = False
            
            if current_user.is_authenticated and hasattr(current_user, 'profile'):
                # Calculate mutual connections
                mutual_followers = profile.followers.filter(
                    id__in=current_user.profile.followers.values_list('id', flat=True)
                ).count()
                
                # Check if current user is following this user
                is_following = current_user.profile.following.filter(id=user.id).exists()
            
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "display_name": profile.display_name or f"{user.first_name} {user.last_name}".strip(),
                "avatar_url": profile.avatar.url if profile.avatar else None,
                "bio": profile.bio or "",
                "location": profile.location or "",
                "skills": [skill.name for skill in profile.skills.all()],
                "followers_count": profile.followers.count(),
                "following_count": profile.following.count(),
                "is_following": is_following,
                "mutual_connections": mutual_followers,
                "relevance_score": calculate_user_relevance(user, profile, query, mutual_followers)
            }
            user_results.append(user_data)
            
        except Exception as e:
            # Log error but continue processing other users
            continue
    
    # Sort by relevance score
    user_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return user_results


def _search_posts(query, post_type=None, time_filter=None):
    """Search for posts based on query and filters"""
    posts = Post.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(author__username__icontains=query)
    ).select_related('author').prefetch_related('likes', 'comments')
    
    # Apply post type filter
    if post_type:
        posts = posts.filter(post_type=post_type)
    
    # Apply time filter
    if time_filter:
        now = timezone.now()
        time_filters = {
            "today": now - timedelta(days=1),
            "week": now - timedelta(weeks=1),
            "month": now - timedelta(days=30),
            "year": now - timedelta(days=365)
        }
        
        if time_filter in time_filters:
            posts = posts.filter(created_at__gte=time_filters[time_filter])
    
    post_results = []
    for post in posts:
        try:
            author_profile = getattr(post.author, 'profile', None)
            
            post_data = {
                "id": post.id,
                "title": post.title,
                "content": post.content[:200] + "..." if len(post.content) > 200 else post.content,
                "author": {
                    "id": post.author.id,
                    "username": post.author.username,
                    "display_name": author_profile.display_name if author_profile else post.author.username,
                    "avatar_url": author_profile.avatar.url if author_profile and author_profile.avatar else None
                },
                "post_type": post.post_type,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
                "likes_count": post.likes.count(),
                "comments_count": post.comments.count(),
                "relevance_score": calculate_post_relevance(post, query)
            }
            post_results.append(post_data)
            
        except Exception as e:
            # Log error but continue processing other posts
            continue
    
    # Sort by relevance score
    post_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return post_results


def calculate_user_relevance(user, profile, query, mutual_connections):
    """Calculate relevance score for user search results"""
    score = 0
    query_lower = query.lower()
    
    # Exact username match gets highest score
    if user.username.lower() == query_lower:
        score += 20
    elif query_lower in user.username.lower():
        score += 10
    
    # Name matches
    full_name = f"{user.first_name} {user.last_name}".lower()
    if full_name == query_lower:
        score += 15
    elif query_lower in full_name:
        score += 8
    
    # Email match (partial for privacy)
    if query_lower in user.email.lower():
        score += 5
    
    # Profile completeness bonus
    if profile.bio:
        score += 2
    if profile.location:
        score += 1
    if profile.skills.exists():
        score += 3
    if profile.avatar:
        score += 1
    
    # Social signals
    followers_count = profile.followers.count()
    score += min(followers_count / 100, 5)  # Cap at 5 points
    
    # Mutual connections bonus
    score += min(mutual_connections * 2, 10)  # Cap at 10 points
    
    return round(score, 2)


def calculate_post_relevance(post, query):
    """Calculate relevance score for post search results"""
    score = 0
    query_lower = query.lower()
    
    # Title relevance (most important)
    if query_lower in post.title.lower():
        # Exact title match
        if post.title.lower() == query_lower:
            score += 20
        else:
            score += 10
    
    # Content relevance
    if query_lower in post.content.lower():
        # Count occurrences for better scoring
        occurrences = post.content.lower().count(query_lower)
        score += min(occurrences * 3, 8)  # Cap at 8 points
    
    # Author relevance
    if query_lower in post.author.username.lower():
        score += 5
    
    # Engagement signals
    likes_count = post.likes.count()
    comments_count = post.comments.count()
    
    score += min(likes_count / 50, 5)  # Cap at 5 points
    score += min(comments_count / 20, 5)  # Cap at 5 points
    
    # Recency bonus
    days_old = (timezone.now() - post.created_at).days
    if days_old == 0:
        score += 5
    elif days_old <= 7:
        score += 3
    elif days_old <= 30:
        score += 1
    
    return round(score, 2)
