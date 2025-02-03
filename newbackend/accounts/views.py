from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import Profile
from rest_framework_simplejwt.tokens import RefreshToken  # Correct import for JWT
from .serializers import RegisterSerializer, ProfileSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            Profile.objects.create(user=user)  # Create profile automatically

            refresh = RefreshToken.for_user(user) # Generate JWT tokens

            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {"username": user.username, "email": user.email},
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": {"username": user.username, "email": user.email},
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:  # Use try-except to handle profile not found
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user, bio='') # Create if doesn't exist

        serializer = ProfileSerializer(profile)
        data = serializer.data
        data['username'] = request.user.username
        data['email'] = request.user.email
        return Response(data)

    def put(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            data = serializer.data
            data['username'] = request.user.username
            data['email'] = request.user.email
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)