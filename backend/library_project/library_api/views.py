from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Book, Borrow
from .serializers import BookSerializer, BorrowSerializer
from .permissions import IsAdmin
from rest_framework_simplejwt.authentication import JWTAuthentication


# Admin Views
class AdminBookListCreateView(generics.ListCreateAPIView):
    """GET /admin/books → View all books, POST /admin/books → Add multiple books"""

    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        data = request.data

        if isinstance(data, dict):
            data = [data]

        serializer = self.get_serializer(data=data, many=True)
        if serializer.is_valid():
            books = serializer.save()
            return Response(
                {
                    "message": f"{len(books)} books successfully added",
                    "books": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"error": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class AdminBookDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Book updated successfully", "book": serializer.data},
                status=status.HTTP_200_OK,
            )

        # return Response({"error": "Invalid data", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": f"Book '{instance.title}' deleted successfully"},
            status=status.HTTP_200_OK,
        )


class AdminBorrowedBooks(generics.ListAPIView):
    serializer_class = BorrowSerializer
    permission_classes = [IsAdmin]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Borrow.objects.filter(returned_at=None)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response(
                {"message": "No books are currently borrowed"},
                status=status.HTTP_200_OK,
            )
        return super().list(request, *args, **kwargs)


# User Views
class UserBookList(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response(
                {"message": "No books available in the library"},
                status=status.HTTP_200_OK,
            )
        return super().list(request, *args, **kwargs)


class UserBookBorrow(generics.CreateAPIView):
    """POST /books/{id}/borrow → Borrow a book"""

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, *args, **kwargs):
        try:
            book = Book.objects.get(pk=kwargs["pk"])

            # ✅ First, check if the user already borrowed this book
            if Borrow.objects.filter(
                book=book, user=request.user, returned_at=None
            ).exists():
                return Response(
                    {"error": "You have already borrowed this book"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ✅ Then, check if the book is available
            if not book.available:
                return Response(
                    {"error": "Book is not available for borrowing"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            borrow = Borrow.objects.create(user=request.user, book=book)
            book.available = False
            book.save()

            return Response(
                {
                    "message": f"You have successfully borrowed '{book.title}'",
                    "borrow_details": BorrowSerializer(borrow).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND
            )


class UserBookReturn(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, *args, **kwargs):
        try:
            borrow = Borrow.objects.get(
                book_id=kwargs["pk"], user=request.user, returned_at=None
            )

            borrow.returned_at = timezone.now()
            borrow.save()

            book = borrow.book
            book.available = True
            book.save()

            return Response(
                {
                    "message": f"You have successfully returned '{book.title}'",
                    "return_details": BorrowSerializer(borrow).data,
                },
                status=status.HTTP_200_OK,
            )

        except Borrow.DoesNotExist:
            return Response(
                {"error": "No active borrow record found for this book"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserBorrowHistory(generics.ListAPIView):
    serializer_class = BorrowSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Borrow.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response(
                {"message": "No borrowing history found"}, status=status.HTTP_200_OK
            )
        return super().list(request, *args, **kwargs)
