# auth_api/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView

urlpatterns = [
    path("signup/", RegisterView.as_view(), name="auth-signup"),
    path("login/", LoginView.as_view(), name="auth-login"),
    # path('logout/', LogoutView.as_view(), name='auth-logout'),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
]
