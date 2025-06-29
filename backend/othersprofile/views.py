from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import PublicProfileSerializer
from .models import Follow

User = get_user_model()

class PublicProfileView(APIView):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        serializer = PublicProfileSerializer(user, context={'request': request})
        return Response(serializer.data)

class FollowActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_username = request.data.get('target_username')
        action = request.data.get('action')

        if not target_username or action not in ['follow', 'unfollow']:
            return Response(
                {'error': 'Invalid request data'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user = get_object_or_404(User, username=target_username)

        if request.user == target_user:
            return Response(
                {'error': 'Users cannot follow themselves'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if action == 'follow':
                _, created = Follow.objects.get_or_create(follower=request.user, following=target_user)
                if not created:
                    return Response({'error': 'Already following'}, status=status.HTTP_400_BAD_REQUEST)
                message = f'Successfully followed {target_username}'
            else:  # unfollow
                Follow.objects.filter(follower=request.user, following=target_user).delete()
                message = f'Successfully unfollowed {target_username}'

            # Return updated profile data
            serializer = PublicProfileSerializer(target_user, context={'request': request})
            return Response({
                'message': message,
                'profile': serializer.data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class FollowersListView(APIView):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        followers = user.followers.all().select_related('follower')
        users = [f.follower for f in followers]
        serializer = PublicProfileSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)

class FollowingListView(APIView):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        following = user.following.all().select_related('following')
        users = [f.following for f in following]
        serializer = PublicProfileSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)
