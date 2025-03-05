import pytest
from rest_framework import status


# member tests


@pytest.mark.django_db
def test_browse_books(api_client, member_token, admin_token):
    """Test browsing available books."""

    book_data = {"title": "Test Book", "author": "Author Name", "available": True}

    create_response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        create_response.status_code == status.HTTP_201_CREATED
    ), f"Create book failed: {create_response.json()}"

    response = api_client.get(
        "/api/books/", headers={"Authorization": f"Bearer {member_token['access']}"}
    )

    assert (
        response.status_code == status.HTTP_200_OK
    ), f"Browse failed: {response.json()}"
    assert isinstance(
        response.json(), list
    ), f"Unexpected response format: {response.json()}"
    assert len(response.json()) > 0, "No books found in the response"


@pytest.mark.django_db
def test_borrow_book(api_client, member_token, admin_token):
    """Test borrowing a book."""

    book_data = {"title": "Test Book", "author": "Author Name", "available": True}

    create_response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        create_response.status_code == status.HTTP_201_CREATED
    ), f"Create book failed: {create_response.json()}"

    book_id = create_response.json().get("books", [])[0].get("id")

    assert book_id is not None, "Book ID is None! Book creation likely failed."

    borrow_response = api_client.post(
        f"/api/books/{book_id}/borrow/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )

    assert (
        borrow_response.status_code == status.HTTP_201_CREATED
    ), f"Borrow book failed: {borrow_response.json()}"
    assert (
        borrow_response.json()["message"]
        == f"You have successfully borrowed '{book_data['title']}'"
    )


@pytest.mark.django_db
def test_borrow_nonexistent_book(api_client, member_token):
    """Test borrowing a non-existent book"""
    response = api_client.post(
        "/api/books/999/borrow/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Book not found" in response.json()["error"]


@pytest.mark.django_db
def test_double_borrow_same_book(api_client, member_token, admin_token):
    """Test borrowing the same book twice"""

    book_data = {"title": "Duplicate Borrow", "author": "Author", "available": True}
    create_response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )
    book_id = create_response.json()["books"][0]["id"]

    borrow_response = api_client.post(
        f"/api/books/{book_id}/borrow/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )
    assert borrow_response.status_code == status.HTTP_201_CREATED

    borrow_again = api_client.post(
        f"/api/books/{book_id}/borrow/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )
    assert borrow_again.status_code == status.HTTP_400_BAD_REQUEST
    assert "already borrowed" in borrow_again.json()["error"]


@pytest.mark.django_db
def test_return_unborrowed_book(api_client, member_token):
    """Test returning a book that wasn't borrowed"""
    response = api_client.post(
        "/api/books/999/return/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "No active borrow record" in response.json()["error"]


@pytest.mark.django_db
def test_return_book(api_client, member_token):
    """Test returning a borrowed book."""
    response = api_client.post(
        "/api/books/1/return/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )

    assert response.status_code == status.HTTP_200_OK
    assert "You have successfully returned" in response.json()["message"]


@pytest.mark.django_db
def test_return_book(api_client, member_token, admin_token):
    """Test returning a borrowed book."""

    book_data = {"title": "Test Book", "author": "Author Name", "available": True}

    create_response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        create_response.status_code == status.HTTP_201_CREATED
    ), f"Create book failed: {create_response.json()}"

    book_id = create_response.json().get("books", [])[0].get("id")
    assert book_id is not None, "Book ID is None! Book creation likely failed."

    borrow_response = api_client.post(
        f"/api/books/{book_id}/borrow/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )

    assert (
        borrow_response.status_code == status.HTTP_201_CREATED
    ), f"Borrow book failed: {borrow_response.json()}"

    return_response = api_client.post(
        f"/api/books/{book_id}/return/",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )

    assert (
        return_response.status_code == status.HTTP_200_OK
    ), f"Return book failed: {return_response.json()}"
    assert "You have successfully returned" in return_response.json()["message"]


@pytest.mark.django_db
def test_permission_member_creating_book(api_client, member_token):
    """Test member trying to create a book (should fail)"""
    book_data = {"title": "Unauthorized", "author": "Fake", "available": True}
    response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {member_token['access']}"},
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "permission" in response.json()["detail"].lower()


# admin tests
@pytest.mark.django_db
def test_admin_create_books(api_client, admin_token):
    """Test admin creating multiple books."""
    books_data = [
        {"title": "Book 1", "author": "Author 1", "available": True},
        {"title": "Book 2", "author": "Author 2", "available": True},
    ]

    response = api_client.post(
        "/api/admin/books/",
        data=books_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    print("Response JSON:", response.json())

    assert (
        response.status_code == status.HTTP_201_CREATED
    ), f"Create books failed: {response.json()}"
    assert response.json()["message"] == "2 books successfully added"


@pytest.mark.django_db
def test_admin_update_book(api_client, admin_token):
    """Test admin updating a book."""

    book_data = {"title": "Old Title", "author": "Old Author", "available": True}

    create_response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        create_response.status_code == status.HTTP_201_CREATED
    ), f"Create book failed: {create_response.json()}"

    book_id = create_response.json()["books"][0]["id"]

    updated_data = {"title": "Updated Title", "author": "Updated Author"}

    update_response = api_client.put(
        f"/api/admin/books/{book_id}/",
        data=updated_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        update_response.status_code == status.HTTP_200_OK
    ), f"Update failed: {update_response.json()}"

    updated_book = update_response.json().get("book", {})

    assert (
        updated_book.get("title") == "Updated Title"
    ), f"Unexpected title: {updated_book}"
    assert (
        updated_book.get("author") == "Updated Author"
    ), f"Unexpected author: {updated_book}"


@pytest.mark.django_db
def test_admin_delete_book(api_client, admin_token):
    """Test admin deleting a book."""

    book_data = {"title": "Book to Delete", "author": "Author", "available": True}

    create_response = api_client.post(
        "/api/admin/books/",
        data=book_data,
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        create_response.status_code == status.HTTP_201_CREATED
    ), f"Create book failed: {create_response.json()}"

    book_id = create_response.json()["books"][0]["id"]

    delete_response = api_client.delete(
        f"/api/admin/books/{book_id}/",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        delete_response.status_code == status.HTTP_200_OK
    ), f"Delete failed: {delete_response.json()}"
    assert "deleted successfully" in delete_response.json().get(
        "message", ""
    ), "Delete message incorrect!"


@pytest.mark.django_db
def test_create_book_invalid(api_client, admin_token):
    """Test creating a book with missing fields"""
    response = api_client.post(
        "/api/admin/books/",
        data={"title": "Title Only"},
        format="json",
        headers={"Authorization": f"Bearer {admin_token['access']}"},
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), f"Unexpected response: {response.json()}"

    assert (
        "details" in response.json()
    ), f"Missing 'details' in response: {response.json()}"
    assert (
        "author" in response.json()["details"][0]
    ), f"Missing field validation for 'author': {response.json()}"
