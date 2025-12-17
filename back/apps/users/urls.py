from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (LoginUser, UserProfileView, UserUpdate, 
                    UserUpdateProfileImage, UserUpdateProfileImage, 
                    VerifyOtp, RegisterUser,
                    ApplyNewPassword, OtpForgotPassword, VerifyForgotPassword)
from apps.users.services.google import GoogleLoginRedirect, GoogleCallback
 

urlpatterns = [
    # path('auth/token/',TokenObtainPairView.as_view(), name='token'),
    # path('auth/token/refresh/',TokenRefreshView.as_view(), name='token_refresh'),

    # register
    path('auth/register/', RegisterUser.as_view(), name='register'),
    path('auth/verify-otp/', VerifyOtp.as_view(), name='verify_otp'),

    # login
    path('auth/login/', LoginUser.as_view(), name='login'),

    path('get-profile/', UserProfileView.as_view(), name='get_profile'),
    path('profile-image-update/', UserUpdateProfileImage.as_view(), name='profile_image_update'),
    path('profile-update/', UserUpdate.as_view(), name='profile_update'),

    # password
    path("otp-forgot-password/", OtpForgotPassword.as_view(), name="otp_forgot_password"),
    path("verify-forgot-password/", VerifyForgotPassword.as_view(), name="verify_forgot_password"),
    path("password-reset/", ApplyNewPassword.as_view(), name="password_reset"),

    # google auth
    path('auth/google/login/', GoogleLoginRedirect.as_view(), name='google_login'),
    path('accounts/google/login/callback/', GoogleCallback.as_view(), name='google_callback'),
]
