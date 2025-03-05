from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    class RoleChoices(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10, choices=RoleChoices.choices, default=RoleChoices.MEMBER
    )

    class Meta:
        db_table = "custom_user"

    # def __str__(self):
    #     return self.username


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "book"

    # def __str__(self):
    #     return f"{self.title} by {self.author}"


class Borrow(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True, blank=True)
    borrowed_at = models.DateTimeField(default=timezone.now)
    returned_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = "borrow"

    # def __str__(self):
    #     return f"{self.user.username} - {self.book.title}"
