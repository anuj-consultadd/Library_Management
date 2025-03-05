# auth_api/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(
        write_only=True, min_length=6, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        """Create and return a new user with encrypted password"""
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, data):
        from django.contrib.auth import authenticate

        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            raise serializers.ValidationError({"non_field_errors": ["Invalid credentials, please try again."]})

        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": ["Your account is inactive. Please contact support."]})

        return user  # ✅ Return user object so it can be used in the view


class TokenSerializer(serializers.Serializer):
    """Serializer to return tokens"""

    refresh = serializers.CharField()
    access = serializers.CharField()
