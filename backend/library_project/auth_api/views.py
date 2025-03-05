from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /auth/signup → Register a new user"""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        role = request.data.get("role", User.RoleChoices.MEMBER)
        if role not in [User.RoleChoices.ADMIN, User.RoleChoices.MEMBER]:
            return Response(
                {"error": "Invalid role. Choose 'admin' or 'member'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.create_user(
                username=serializer.validated_data["username"],
                email=serializer.validated_data.get("email", ""),
                password=serializer.validated_data["password"],
                role=role,
            )
        except IntegrityError:
            return Response(
                {"error": "Username or email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    """POST /auth/login → Login a user and return access & refresh tokens"""

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data  

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "id": user.id, 
                "username": user.username,
                "email": user.email, 
                "role": user.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


