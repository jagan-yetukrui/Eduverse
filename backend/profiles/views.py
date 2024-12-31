from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ProfileSerializer
from rest_framework import status
from rest_framework import viewsets, permissions
from .models import Profile

# class UserProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         profile = request.user.profile
#         serializer = ProfileSerializer(profile)
#         return Response(serializer.data)

#     def put(self, request):
#         profile = request.user.profile
#         serializer = ProfileSerializer(profile, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)
    # views.py
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Filter by logged-in user
        if self.request.user.is_staff:
            return Profile.objects.all()
        elif self.request.user.is_authenticated:
            return Profile.objects.filter(user=self.request.user)
        return Profile.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    
class WelcomeAPIView(APIView):
    def get(self, request):
        message = {"message": "Welcome to the API!"}
        return Response(message, status=status.HTTP_200_OK)

