# library_api/urls.py
from django.urls import path
from .views import (
    AdminBookListCreateView,
    AdminBookDetail,
    AdminBorrowedBooks,
    UserBookList,
    UserBookBorrow,
    UserBookReturn,
    UserBorrowHistory,
)

urlpatterns = [
    # Admin Routes
    path(
        "admin/books/", AdminBookListCreateView.as_view(), name="admin-book-list-create"
    ),  # GET & POST
    path(
        "admin/books/<int:pk>/", AdminBookDetail.as_view(), name="admin-book-detail"
    ),  # GET, PUT, DELETE
    path(
        "admin/borrowed-books/",
        AdminBorrowedBooks.as_view(),
        name="admin-borrowed-books",
    ),  # GET
    # User Routes
    path("books/", UserBookList.as_view(), name="user-book-list"),  # GET
    path(
        "books/<int:pk>/borrow/", UserBookBorrow.as_view(), name="user-book-borrow"
    ),  # POST
    path(
        "books/<int:pk>/return/", UserBookReturn.as_view(), name="user-book-return"
    ),  # POST
    path("books/history/", UserBorrowHistory.as_view(), name="user-borrow-history"),
]
