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
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from .models import UserSession
from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

logger = logging.getLogger(__name__)

class TokenRateThrottle(UserRateThrottle):
    rate = '100/day'  # Limit to 100 requests per day per user

class AnonTokenRateThrottle(AnonRateThrottle):
    rate = '50/day'  # Limit to 50 requests per day per IP

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

class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [AnonTokenRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the refresh token from response
            refresh_token = response.data.get('refresh')
            
            # Get device info
            device_fingerprint = request.data.get('device_fingerprint')
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT')
            
            # Create or update user session
            UserSession.create_session(
                user=request.user,
                refresh_token=refresh_token,
                device_fingerprint=device_fingerprint,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class CustomTokenRefreshView(TokenRefreshView):
    throttle_classes = [TokenRateThrottle]

    def post(self, request, *args, **kwargs):
        # Get device info
        device_fingerprint = request.data.get('device_fingerprint')
        ip_address = self.get_client_ip(request)
        
        # Validate session
        try:
            session = UserSession.objects.get(
                user=request.user,
                refresh_token=request.data.get('refresh'),
                is_active=True
            )
            
            if not session.validate_session(device_fingerprint, ip_address):
                return Response(
                    {"error": "Invalid session. Please login again."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except UserSession.DoesNotExist:
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get the new refresh token
            refresh_token = response.data.get('refresh')
            
            # Update user session with new refresh token
            UserSession.create_session(
                user=request.user,
                refresh_token=refresh_token,
                device_fingerprint=device_fingerprint,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class CustomTokenBlacklistView(TokenBlacklistView):
    throttle_classes = [TokenRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Deactivate the current session
            try:
                session = UserSession.objects.get(
                    user=request.user,
                    refresh_token=request.data.get('refresh')
                )
                session.deactivate()
            except UserSession.DoesNotExist:
                pass
            
        return response
