from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Profile, CustomUser


# register serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


# login serializer with jwt
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        User = get_user_model()
        try:
            user = User.objects.get(email=data["email"])
            user = authenticate(username=user.username, password=data["password"])
            if not user:
                raise serializers.ValidationError("Invalid credentials")
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address")
        return data

    def create(self, validated_data):
        User = get_user_model()
        user = User.objects.get(email=validated_data["email"])
        auth_user = authenticate(
            username=user.username, password=validated_data["password"]
        )
        refresh = RefreshToken.for_user(auth_user)
        return {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
        }


# profile serializer from accounts.models import UserProfile
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "username", "bio", "profile_picture", "education", "experience"]
