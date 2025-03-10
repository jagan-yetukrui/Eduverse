import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from .models import Profile
from rest_framework_simplejwt.tokens import RefreshToken  # Correct import for JWT
from .serializers import RegisterSerializer, ProfileSerializer

logger = logging.getLogger(__name__)

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
        try:
            email = request.data.get("email")
            password = request.data.get("password")
            
            # Debug logging
            logger.debug(f"Login attempt with email: {email}")
            
            if not email or not password:
                return Response(
                    {"error": "Email and password are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # First try to get the user by email
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
                # Authenticate with the retrieved username and provided password
                auth_user = authenticate(username=user.username, password=password)
                
                if auth_user:
                    refresh = RefreshToken.for_user(auth_user)
                    return Response(
                        {
                            "refresh": str(refresh),
                            "access": str(refresh.access_token),
                            "token": str(refresh.access_token),  # Added for frontend compatibility
                            "user": {"username": user.username, "email": user.email},
                        },
                        status=status.HTTP_200_OK,
                    )
                else:
                    # Authentication failed even though user exists
                    logger.warning(f"Authentication failed for existing email: {email}")
                    return Response(
                        {"error": "Invalid password"}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except User.DoesNotExist:
                logger.warning(f"No user found with email: {email}")
                return Response(
                    {"error": "No user found with this email"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            # Catch all other exceptions
            logger.error(f"Error in login: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred. Please try again later."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
    

class ProfileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profiles = Profile.objects.all()
        serializer = ProfileSerializer(profiles, many=True)
        return Response(serializer.data)