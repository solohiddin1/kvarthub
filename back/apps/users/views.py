import uuid
import datetime
import concurrent.futures
from drf_spectacular.utils import extend_schema
from django.contrib.auth import authenticate
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser

from apps.shared.enum import ResultCodes
from apps.shared.utils import ErrorResponse, SuccessResponse, ErrorResponseWithEmailResult
from apps.shared.utils import SuccessResponse
from apps.shared.utils import get_logger
from apps.shared.send_email import send_otp_with_fallback
from .repository import *
from .serialziers import (ApplyNewPasswordSerializer, OtpForgotPasswordSerializer,\
                           RegisterSerializer,AuthenticationSerializer, UserProfileImageUpdateSerializer,\
                             UserUpdateSerializer, 
                            UserVerifySerializer, AuthOtpSendSerializer, 
                            AuthOtpVerifySerializer, UserProfileSerializer, VerifyForgotPasswordSerializer)

logger = get_logger()


@extend_schema(
    summary='to register user'
)
class RegisterUser(GenericAPIView):
    serializer_class = RegisterSerializer
    filter_backends=[DjangoFilterBackend]
    role = "USER"

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        req_body = serializer.validated_data

        otp = generate_otp()
        user = get_user_by_username(req_body["email"])
        
        logger.info(f"user is registered with email: {req_body['email']}")
        if user is None:
            user = create_user(email=req_body["email"],
                                # first_name=req_body.get("first_name",""),
                                phone_number=req_body.get("phone_number",""),
                                otp=otp,
                                otp_created_at=timezone.now(),
                                password=req_body["password"],
                                region=req_body.get("region",None),
                                district=req_body.get("district",None),
                                is_active=True)
        else:
            if user.is_verified:
                return ErrorResponse(ResultCodes.USER_ALREADY_REGISTERED)
            # update_user_otp(user.id, otp, timezone.now())
            user_updated = update_user(email=req_body["email"],
                                first_name=req_body.get("first_name",""),
                                last_name=req_body.get("last_name",""),
                                phone_number=req_body.get("phone_number",""),
                                otp=otp,
                                otp_created_at=timezone.now(),
                                password=req_body["password"],
                                region=req_body.get("region",None),
                                district=req_body.get("district",None),
                                is_active=False)
            
            send_result = send_otp_with_fallback(req_body["email"], otp)

            user = get_user_by_username(req_body["email"])

            if user_updated:
                return SuccessResponse({
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "role": self.role,
                "is_verified": False,
                "otp": otp,
                "send_result": send_result
                })
            
        send_result = send_otp_with_fallback(req_body["email"], otp)

        if not send_result:
            return ErrorResponse(ResultCodes.ERROR_SMS_SERVICE)

        return SuccessResponse(result={
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "is_verified": False,
            "otp": otp,
            "send_result": send_result
        })


@extend_schema(
    summary='to verify registered user, send users id and otp , user id is ' \
    'when returned when they are  registered'
)
class VerifyOtp(GenericAPIView):
    serializer_class = UserVerifySerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_user_by_username(
            serializer.validated_data["email"],
        )

        if user is None: return ErrorResponse(ResultCodes.USER_ROLE_NOT_FOUND)
        if user.is_verified: return ErrorResponse(ResultCodes.USER_ALREADY_REGISTERED)
        
        if user.otp != serializer.validated_data["code"]: return ErrorResponse(ResultCodes.WRONG_VERIFICATION_CODE)
        
        if user.otp:
            if timezone.now() - user.otp_created_at > datetime.timedelta(
                minutes=20): return ErrorResponse(ResultCodes.OTP_EXPIRED)


        update_user_set_verified(user.id)


        token = RefreshToken.for_user(user)
        return SuccessResponse({
            "refresh": str(token),
            "access": str(token.access_token)
        })


@extend_schema(
    summary='login verified user with email and password and return tokens',
    responses={200: AuthenticationSerializer}
)
class LoginUser(GenericAPIView):
    serializer_class = AuthenticationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")

        user_verified = get_user_by_username(email)

        # If the account has no usable password (e.g. created via Google),
        # do not call authenticate (would trigger hasher on None). Guide user to set a password.
        if user_verified and not user_verified.has_usable_password():
            otp = generate_otp()
            send_result = send_otp_email(email, otp)
            update_user_otp(user_verified.id, otp, timezone.now())
            return ErrorResponseWithEmailResult(
                ResultCodes.INVALID_CREDENTIALS,
                send_result,
                message={
                    "uz": "Bu hisob Google orqali yaratilgan. Parol o'rnatish uchun emailga yuborilgan kodni tasdiqlang.",
                    "en": "This account was created via Google. Verify the OTP sent to email to set a password.",
                    "ru": "Эта учетная запись создана через Google. Подтвердите OTP, отправленный на email, чтобы установить пароль."
                }
            )

        otp = generate_otp()

        # Try authenticate; USERNAME_FIELD is 'email' so username is email
        user = authenticate(request=request._request, username=email, password=password)
        
        if user is None:
            # also try with email keyword for custom backends
            user = authenticate(request=request._request, email=email, password=password)
            
        
        if user is None:
            return ErrorResponse(ResultCodes.INVALID_CREDENTIALS)

        if not user_verified.is_verified:
            send_result = send_otp_email(email, otp)
            update_user_otp(user_verified.id,otp,timezone.now())
            return ErrorResponseWithEmailResult(ResultCodes.USER_IS_NOT_VERIFIED, send_result)

        # Ensure user has active & verified role
        # user_role = get_user_role_by_userid_role(user.id, role, is_active=True, is_verified=True)
        # if not user_role:
        #     return ErrorResponse(ResultCodes.USER_IS_NOT_VERIFIED)

        # if not user.is_verified:
        #     return ErrorResponse(ResultCodes.USER_IS_NOT_VERIFIED)

        token = RefreshToken.for_user(user)

        return SuccessResponse({
            "refresh": str(token),
            "access": str(token.access_token)
        })


@extend_schema(
    summary='Get authenticated user profile'
)
class UserProfileView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return SuccessResponse(UserProfileSerializer(request.user, context={'request': request}).data)


class UserUpdateProfileImage(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileImageUpdateSerializer
    parser_classes = [MultiPartParser]
    http_method_names = ['patch']

    def get_object(self):
        return self.request.user

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'image': {'type': 'string', 'format': 'binary'}
                }
            }
        }
    )
    def patch(self, request, *args, **kwargs):
        user = request.user
        serializer = UserProfileImageUpdateSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return SuccessResponse({"message": "Image updated"})

        return ErrorResponse(ResultCodes.UNKNOWN_ERROR)



class UserUpdate(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserUpdateSerializer
    http_method_names = ['patch']

    def get_object(self):
        user = self.request.user
        return user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance is None:
            return ErrorResponse(ResultCodes.USER_NOT_FOUND)
        # if instance.is_from_social and not instance.password:

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return SuccessResponse(serializer.data)



class OtpForgotPassword(GenericAPIView):
    queryset = User.objects.all()
    serializer_class = OtpForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_user_by_username(
            serializer.validated_data["email"],
        )

        if not user:
            return ErrorResponse(ResultCodes.USER_ROLE_NOT_FOUND)

        otp = check_generate_otp(user)

        if not otp: return ErrorResponse(ResultCodes.DAILY_LIMIT_REACHED)
        
        sms_res = send_otp_with_fallback(serializer.validated_data["email"], otp.code, timeout=5)

        if not sms_res: return ErrorResponse(ResultCodes.ERROR_SMS_SERVICE)

        return SuccessResponse({
            "reset_id": otp.id,
            "otp": otp.code,
            "message": "Email sent successfully!!!"
        })


class VerifyForgotPassword(GenericAPIView):
    queryset = User.objects.all()
    serializer_class = VerifyForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp_ = get_user_password_reset_by_id(serializer.validated_data['reset_id'])
        if not otp_: return ErrorResponse(ResultCodes.UNKNOWN_ERROR)

        if otp_.verified: return ErrorResponse(ResultCodes.ALREADY_VERIFIED)

        if otp_.incorrect_count >= 3: return ErrorResponse(ResultCodes.OTP_INCORRECT_CNT)

        if timezone.now() - otp_.otp_created_at > datetime.timedelta(minutes=3): return ErrorResponse(
            ResultCodes.OTP_EXPIRED)

        if otp_.code != serializer.validated_data['code']:
            update_user_password_reset_incorrect_count(otp_)
            return ErrorResponse(ResultCodes.OTP_INCORRECT)

        reset_token = uuid.uuid4()
        update_user_password_reset_verified(otp_, reset_token)

        return SuccessResponse({
            "reset_token": reset_token,
            "message": "Verification success!!!"
        })


class ApplyNewPassword(GenericAPIView):
    queryset = User.objects.all()
    serializer_class = ApplyNewPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp_ = get_user_password_reset_by_token(serializer.validated_data['reset_token'])
        if not otp_: return ErrorResponse(ResultCodes.INVALID_RESET_TOKEN)

        if not otp_.verified: return ErrorResponse(ResultCodes.ALREADY_VERIFIED)

        if timezone.now() - otp_.reset_token_created_at > datetime.timedelta(minutes=15): return ErrorResponse(
            ResultCodes.OTP_EXPIRED)

        # Update password
        user_role = get_user_by_username(otp_.user.email)
        update_user_role_password(user_role, make_password(serializer.validated_data['password']))

        clear_user_password_reset_token(otp_)

        return SuccessResponse({
            "message": "Successfully set new password!!!"
        })
    
