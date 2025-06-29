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
from .serializers import UserSearchSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """
    Real-time search endpoint for users and posts with filtering
    """
    try:
        # Get and validate search parameters
        query = request.GET.get("query", "").strip()
        search_type = request.GET.get("type", "users")
        exclude_self = str(request.GET.get("exclude_self", "true")).lower() == "true"
        
        # Debug logging
        print("Search Params — Query:", query, "Type:", search_type, "Exclude Self:", exclude_self)
        
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
            users = CustomUser.objects.filter(
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query)
            ).select_related('profile')
            
            # Exclude current user if requested and authenticated
            if request.user.is_authenticated and exclude_self:
                users = users.exclude(id=request.user.id)
            
            # Serialize results
            serializer = UserSearchSerializer(users, many=True)
            results["users"] = serializer.data
        
        # Search posts
        if search_type in ["all", "posts"]:
            posts = _search_posts(query)
            results["posts"] = posts
        
        results["total_results"] = len(results["users"]) + len(results["posts"])
        
        return Response(results, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return Response(
            {"error": "An error occurred while searching", "details": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _search_posts(query):
    """Search for posts based on query"""
    posts = Post.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(author__username__icontains=query)
    ).select_related('author').prefetch_related('likes', 'comments')
    
    post_results = []
    for post in posts:
        try:
            author_profile = getattr(post.author, 'profile', None)
            
            post_data = {
                "id": post.id,
                "title": post.title,
                "content": post.content[:200] + "..." if len(post.content) > 200 else post.content,
                "author": {
                    "username": post.author.username,
                    "display_name": author_profile.display_name if author_profile else post.author.username,
                    "avatar_url": author_profile.avatar.url if author_profile and author_profile.avatar else None
                },
                "post_type": post.post_type,
                "created_at": post.created_at,
                "updated_at": post.updated_at,
                "likes_count": post.likes.count(),
                "comments_count": post.comments.count()
            }
            post_results.append(post_data)
            
        except Exception as e:
            print(f"Error processing post {post.id}: {str(e)}")
            continue
    
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
