# library_api/serializers.py
from rest_framework import serializers
from .models import User, Book, Borrow


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role")
        read_only_fields = ("id",)


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ("id", "title", "author", "available")
        read_only_fields = ("id",)


class BorrowSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Borrow
        fields = (
            "id",
            "user",
            "book",
            "book_title",
            "username",
            "borrowed_at",
            "returned_at",
        )
        read_only_fields = ("id", "borrowed_at")
