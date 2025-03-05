import pytest
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_register_member(api_client):
    """Test successful registration of a member"""
    response = api_client.post(
        "/auth/signup/",
        data={
            "username": "member1",
            "email": "member1@example.com",
            "password": "SecurePass123!",
            "role": "member",
        },
        format="json",
    )

    assert (
        response.status_code == status.HTTP_201_CREATED
    ), f"Unexpected response: {response.json()}"
    assert response.json()["role"] == "member"


@pytest.mark.django_db
def test_register_admin(api_client):
    """Test successful registration of an admin"""
    response = api_client.post(
        "/auth/signup/",
        data={
            "username": "admin1",
            "email": "admin1@example.com",
            "password": "SecurePass123!",
            "role": "admin",
        },
        format="json",
    )

    assert (
        response.status_code == status.HTTP_201_CREATED
    ), f"Unexpected response: {response.json()}"
    assert response.json()["role"] == "admin"


@pytest.mark.django_db
def test_register_duplicate_username(api_client):
    """Test registering a user with a duplicate username"""
    User.objects.create_user(
        username="testuser", email="test1@example.com", password="TestPass123!"
    )

    response = api_client.post(
        "/auth/signup/",
        data={
            "username": "testuser",
            "email": "test2@example.com",
            "password": "NewPass123!",
        },
        format="json",
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), f"Unexpected response: {response.json()}"

    response_data = response.json()

    assert "error" in response_data, f"Expected 'error' key, got: {response_data}"
    assert (
        "username" in response_data["error"]
    ), f"Missing username field in error: {response_data}"
    assert (
        "A user with that username already exists."
        in response_data["error"]["username"]
    ), f"Unexpected message: {response_data['error']['username']}"


@pytest.mark.django_db
def test_register_invalid_role(api_client):
    """Test registering a user with an invalid role"""
    response = api_client.post(
        "/auth/signup/",
        data={
            "username": "invalidrole",
            "email": "role@example.com",
            "password": "SecurePass123!",
            "role": "invalid",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["error"] == "Invalid role. Choose 'admin' or 'member'."


@pytest.mark.django_db
def test_register_missing_fields(api_client):
    """Test registering a user with missing fields"""
    response = api_client.post(
        "/auth/signup/", data={"username": "testuser"}, format="json"
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), f"Unexpected response: {response.json()}"

    response_data = response.json()

    assert (
        "error" in response_data
    ), f"Expected 'error' key in response, got: {response_data}"
    assert (
        "password" in response_data["error"]
    ), f"Missing password validation failed: {response_data}"
    assert (
        "email" in response_data["error"]
    ), f"Missing email validation failed: {response_data}"


@pytest.mark.django_db
def test_register_invalid_email(api_client):
    """Test registering a user with an invalid email"""
    response = api_client.post(
        "/auth/signup/",
        data={
            "username": "testuser",
            "email": "invalidemail",
            "password": "TestPass123!",
        },
        format="json",
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), f"Unexpected response: {response.json()}"

    response_data = response.json()

    assert (
        "error" in response_data
    ), f"Expected 'error' key in response, got: {response_data}"
    assert (
        "email" in response_data["error"]
    ), f"Invalid email validation failed: {response_data}"
    assert (
        "Enter a valid email address." in response_data["error"]["email"]
    ), f"Unexpected email error message: {response_data['error']['email']}"


@pytest.mark.django_db
def test_login_member(api_client):
    """Test login as a registered member"""
    user = User.objects.create_user(
        username="member1",
        email="member1@example.com",
        password="SecurePass123!",
        role="member",
    )

    response = api_client.post(
        "/auth/login/",
        data={"username": "member1", "password": "SecurePass123!"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.json()
    assert response.json()["role"] == "member"


@pytest.mark.django_db
def test_login_admin(api_client):
    """Test login as a registered admin"""
    user = User.objects.create_user(
        username="admin1",
        email="admin1@example.com",
        password="SecurePass123!",
        role="admin",
    )

    response = api_client.post(
        "/auth/login/",
        data={"username": "admin1", "password": "SecurePass123!"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.json()
    assert response.json()["role"] == "admin"


@pytest.mark.django_db
def test_login_invalid_user(api_client):
    """Test login with non-existent user"""
    response = api_client.post(
        "/auth/login/", data={"username": "fakeuser", "password": "wrongpass"}
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), f"Unexpected response: {response.json()}"

    response_data = response.json()

    assert (
        "error" in response_data
    ), f"Expected 'error' key in response, got: {response_data}"
    assert (
        "non_field_errors" in response_data["error"]
    ), f"Expected 'non_field_errors' inside 'error', got: {response_data}"
    assert (
        response_data["error"]["non_field_errors"][0]
        == "Invalid credentials, please try again."
    ), f"Unexpected message: {response_data['error']['non_field_errors']}"
