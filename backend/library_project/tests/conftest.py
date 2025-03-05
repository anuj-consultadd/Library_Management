import os
import pytest
from django.conf import settings
from django.core.management import call_command
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture(scope="session", autouse=True)
def django_setup():
    """Ensure Django settings are configured for pytest."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "library_project.settings")
    import django

    django.setup()


@pytest.fixture
def api_client():
    """Fixture for Django API test client."""
    return APIClient()


@pytest.fixture
def create_admin_user(db):
    """Fixture to create an admin user."""
    admin_user = User.objects.create_superuser(
        username="adminuser",
        email="admin@example.com",
        password="adminpassword",
        role="admin",
    )
    return admin_user


@pytest.fixture
def create_member_user(db):
    """Fixture to create a regular member user."""
    member_user = User.objects.create_user(
        username="memberuser",
        email="member@example.com",
        password="memberpassword",
        role="member",
    )
    return member_user


@pytest.fixture
def admin_token(create_admin_user):
    """Fixture to generate an admin JWT token."""
    refresh = RefreshToken.for_user(create_admin_user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


@pytest.fixture
def member_token(create_member_user):
    """Fixture to generate a member JWT token."""
    refresh = RefreshToken.for_user(create_member_user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}
