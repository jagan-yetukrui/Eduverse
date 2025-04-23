from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    agreeToTerms = serializers.BooleanField(required=True)

    class Meta:
        model = User
        fields = ('user_id', 'username', 'email', 'password', 'password2', 'agreeToTerms')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        if not attrs['agreeToTerms']:
            raise serializers.ValidationError({"agreeToTerms": "You must agree to the Terms and Conditions"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, help_text='Username or Email')
    password = serializers.CharField(required=True, write_only=True)

    def validate_username(self, value):
        # Check if the input is an email
        if '@' in value:
            try:
                user = User.objects.get(email=value)
                # Return the actual username for authentication
                return user.username
            except User.DoesNotExist:
                raise serializers.ValidationError("No user found with this email address.")
        return value
