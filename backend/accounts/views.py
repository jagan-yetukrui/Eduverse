from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
import logging
from django.http import JsonResponse
from django.urls import path

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    """
    API View to handle user registration.
    """
    permission_classes = [AllowAny] # Registration needs to be accessible to unauthenticated users

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully."},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"errors": serializer.errors, "message": "Registration failed."},
            status=status.HTTP_400_BAD_REQUEST
        )
    

class AccountsRootView(APIView):
    """
    Root view for /api/accounts/
    Provides information about available endpoints.
    """
    permission_classes = [AllowAny]  # Accessible to anyone

    def get(self, request):
        return JsonResponse({
            "message": "Welcome to the Accounts API!",
            "endpoints": {
                "register": "/api/accounts/register/",
                "login": "/api/accounts/login/",
                "protected-endpoint": "/api/accounts/protected-endpoint/"
            }
        })


class LoginView(APIView):
    """
    API View to handle user login and token generation.
    Supports login with either username or email.
    """
    permission_classes = [AllowAny] # Login needs to be accessible to unauthenticated users
    authentication_classes = [] # Explicitly disable authentication

    def post(self, request):
        logger.info("Login attempt received.")
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            User = get_user_model()
            login_field = serializer.validated_data['username']
            password = serializer.validated_data['password']
            logger.info(f"Login attempt with field: {login_field}")
            
            # Try to authenticate with username first
            user = authenticate(username=login_field, password=password)
            
            # If username authentication fails, try with email
            if not user:
                try:
                    logger.info("Username authentication failed, trying email...")
                    username = User.objects.get(email=login_field).username
                    user = authenticate(username=username, password=password)
                except User.DoesNotExist:
                    logger.error(f"No user found with email: {login_field}")
                    user = None
            
            if user:
                logger.info(f"Authentication successful for user: {user.username}")
                # Generate new tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                return Response({
                    "message": "Login successful.",
                    "refresh": str(refresh),
                    "access": str(access_token)
                }, status=status.HTTP_200_OK)
                
            logger.error(f"Authentication failed for login field: {login_field}")
            return Response(
                {"error": "Invalid credentials. Please check your username/email and password."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        logger.error(f"Serializer validation failed with errors: {serializer.errors}")
        return Response(
            {"errors": serializer.errors, "message": "Login failed."},
            status=status.HTTP_400_BAD_REQUEST
        )

class ProtectedView(APIView):
    """
    Example of a protected view that requires authentication
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({"message": "This is a protected endpoint."})
