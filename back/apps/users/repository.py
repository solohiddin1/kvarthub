import socket
import random
from django.db import transaction
from django.utils import timezone

from apps.shared.models import logger
from apps.users.models import User, UserAuthOtp, UserPasswordReset, OtpSentLog
from django.core.mail import send_mail as send_otp
from django.core.mail import BadHeaderError
from django.conf import settings
from django.db import IntegrityError
from apps.shared.utils import ErrorResponse
# from apps.shared.utils import send_telegram_message, ErrorResponse
from apps.shared import enum

def generate_otp():
    return str(random.randint(1000, 9999))


def send_otp_email(email, otp_code):
    subject = "Email tekshiruv"
    message = f"{otp_code}\n Bu {email} emaili uchun birmartalik tekshiruv kodi \n Diqqat, kodning yaroqlilik muddati 5 daqiqa!"
  


    try:
        # Check for internet connection
        socket.create_connection(("8.8.8.8", 53), timeout=3)

        # Attempt to send email
        sent = send_otp(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,  # So we can catch errors
        )

        if sent:  
            return {"success": True, "message": "Verifikatsiya kodi muvaffaqiyatli jo'natildi"}
        else:
            return {"success": False, "message": "Email jo'natilmadi"}
        
    except Exception as e:
        return {"success": False, "message": f"Unexpected error: {str(e)}"}

    except socket.error:
        return {"success": False, "message": "Internet aloqasi yo'q"}

    except BadHeaderError:
        return {"success": False, "message": "Invalid email header"}

    # except SMTPException as e:
    #     return {"success": False, "message": f"SMTP error: {str(e)}"}

    


def check_generate_otp(user: User):
    new_code = str(random.randint(1000, 9999))

    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=1)

    otp = UserPasswordReset.objects.select_related('user').filter(user=user).first()

    if otp:
        # Only count - no need for select_related
        sent_count = OtpSentLog.objects.filter(email=user.email, created_at__gte=today_start).count()
        if sent_count >= 5:
            return None

        otp.code = new_code
        otp.incorrect_count = 0
        otp.otp_created_at = timezone.now()
        otp.otp_count += 1
        otp.verified = False
    else:
        otp = UserPasswordReset.objects.create(user=user, code=new_code, otp_created_at=timezone.now(), otp_count=1, verified=False)

    otp.save()
    return otp


def get_user_password_reset_by_id(reset_id):
    try:
        return UserPasswordReset.objects.select_related('user').filter(id=reset_id).first()
    except Exception as e:
        logger.exception(e)
        raise e


def get_user_password_reset_by_token(reset_token):
    try:
        return UserPasswordReset.objects.select_related('user').filter(reset_token=reset_token).first()
    except Exception as e:
        logger.exception(e)
        raise e


def get_user_by_username(email):
    try:
        return User.objects.filter(email=email).first()
    except Exception as e:
        logger.exception(e)
        raise e

def create_user(email, phone_number,
                otp, otp_created_at,
                password, is_active=True):
    try:
        # Ensure `username` (which is unique on the AbstractUser) is set
        # When USERNAME_FIELD is changed to `email` but the `username` column still
        # exists and is unique, creating a user without a username will cause
        # a UNIQUE constraint error (multiple users with empty username '').
        logger.info(f"User is registering with email: {email}, and password: {password}") 
        user = User.objects.create(
            email=email,
            username=email,
            phone_number=phone_number,
            otp=otp,
            otp_created_at=otp_created_at,
            is_active=is_active
        )
        user.set_password(password)
        user.save()
        logger.info(f"User is registered successfully with email: {email}, with phone_number:{phone_number}")
        # send_telegram_message(f"User registered with email: {email}, phone_number: {phone_number}, with password: {password}")
        return user
    except IntegrityError as e:
        if "phone_number" in str(e):
            logger.exception(e)
            logger.exception(f"User tried to register with email: {email}, full_name:  and password: {password}, but failed with integrity error in phone number")
            return ErrorResponse(enum.ResultCodes.USER_WITH_THIS_PHONE_NUMBER_ALREADY_EXISTS)
        if "email" in str(e):
            logger.exception(e)
            logger.exception(f"User tried to register with email: {email}, full_name:  and password: {password}, but failed with integrity error in email")
            return ErrorResponse(enum.ResultCodes.USER_ALREADY_REGISTERED)
        
        # fallback if those errors cant catch
        raise e
    except Exception as e:
        logger.exception(e)
        logger.exception(f"User tried to register with email: {email}, full_name:  and password: {password}, but failed with exception error")
        raise e



def update_user(email, full_name, phone_number,
                otp, otp_created_at,
                password, is_active=True):
    try:
        # Ensure `username` (which is unique on the AbstractUser) is set
        # When USERNAME_FIELD is changed to `email` but the `username` column still
        # exists and is unique, creating a user without a username will cause
        # a UNIQUE constraint error (multiple users with empty username '').
        logger.info(f"User is updating with email: {email}, full_name: {full_name}, and password: {password}") 
        user = User.objects.get(email = email)
        user.email=email
        user.full_name=full_name
        user.phone_number=phone_number
        user.otp=otp
        user.otp_created_at=otp_created_at
        
        user.set_password(password)
        user.save()
        logger.info(f"User is updated successfully with email: {email}, with phone_number:{phone_number}")
        # send_telegram_message(f"User registered with email: {email}, phone_number: {phone_number}, with password: {password}")
        return user
    except IntegrityError as e:
        if "phone_number" in str(e):
            logger.exception(e)
            logger.exception(f"User tried to register with email: {email}, full_name: {full_name}, and password: {password}, but failed with integrity error in phone number")
            return ErrorResponse(enum.ResultCodes.USER_WITH_THIS_PHONE_NUMBER_ALREADY_EXISTS)
        if "email" in str(e):
            logger.exception(e)
            logger.exception(f"User tried to register with email: {email}, full_name: {full_name}, and password: {password}, but failed with integrity error in email")
            return ErrorResponse(enum.ResultCodes.USER_ALREADY_REGISTERED)
        
        # fallback if those errors cant catch
        raise e
    except Exception as e:
        logger.exception(e)
        logger.exception(f"User tried to register with email: {email}, full_name: {full_name}, and password: {password}, but failed with exception error")
        raise e

def update_user_set_verified(user_id, is_verified=True, is_active=True):
    try:
        User.objects.filter(id=user_id).update(
            is_verified=is_verified,
            is_active=is_active
        )
    except Exception as e:
        logger.exception(e)
        raise e

def update_user_password_reset_incorrect_count(password_reset):
    try:
        password_reset.incorrect_count += 1
        password_reset.save()
        return password_reset
    except Exception as e:
        logger.exception(e)
        raise e


def update_user_password_reset_verified(password_reset, reset_token):
    try:
        password_reset.reset_token = reset_token
        password_reset.reset_token_created_at = timezone.now()
        password_reset.verified = True
        password_reset.save()
        return password_reset
    except Exception as e:
        logger.exception(e)
        raise e
    

def update_user_role_password(user_role, password):
    try:
        user_role.password = password
        user_role.save()
        return user_role
    except Exception as e:
        logger.exception(e)
        raise e


def clear_user_password_reset_token(password_reset):
    try:
        password_reset.reset_token = None
        password_reset.reset_token_created_at = None
        password_reset.save()
        return password_reset
    except Exception as e:
        logger.exception(e)
        raise e


def get_user_auth_otp_by_id(otp_id):
    try:
        return UserAuthOtp.objects.select_related('user_role__user').filter(id=otp_id).first()
    except Exception as e:
        logger.exception(e)
        raise e


def update_user_auth_otp_incorrect_count(otp):
    try:
        otp.incorrect_count += 1
        otp.save()
        return otp
    except Exception as e:
        logger.exception(e)
        raise e


def update_user_auth_otp_verified(otp, reset_token):
    try:
        otp.reset_token = reset_token
        otp.reset_token_created_at = timezone.now()
        otp.verified = True
        otp.save()
        return otp
    except Exception as e:
        logger.exception(e)
        raise e


def deactivate_user_role(user_role):
    try:
        user_role.is_active = False
        user_role.is_verified = False
        user_role.save()
        return user_role
    except Exception as e:
        logger.exception(e)
        raise e


def check_user_exists_by_phone(phone):
    try:
        return User.objects.filter(phone=phone, is_active=True).exists()
    except Exception as e:
        logger.exception(e)
        raise e



def get_user_by_id(user_id, is_active=True):
    try:
        return User.objects.filter(id=user_id, is_active=is_active).first()
    except Exception as e:
        logger.exception(e)
        raise e


def get_user_by_userid(id):
    try:
        return User.objects.filter(id=id).first()
    except Exception as e:
        logger.exception(e)
        raise e


def create_user_simple(username, full_name, phone=None, email=None):
    """Create a simple user without password (for OAuth/Click integration)"""
    try:
        user = User.objects.create(
            username=username,
            full_name=full_name,
            phone=phone,
            email=email
        )
        return user
    except Exception as e:
        logger.exception(e)
        raise e


def update_user_role_mini_app(user_role, mini_app=True):
    """Update mini_app flag for user role"""
    try:
        user_role.mini_app = mini_app
        user_role.is_active = True
        user_role.is_verified = True
        user_role.save()
        return user_role
    except Exception as e:
        logger.exception(e)
        raise e


def update_user_otp(user_id, otp, otp_created_at):
    try:
        User.objects.filter(id=user_id).update(
            otp=otp,
            otp_created_at=otp_created_at
        )
    except Exception as e:
        logger.exception(e)
        raise e