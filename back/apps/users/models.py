from django.db import models
from django.core.validators import RegexValidator
from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import MyUserManager

# Create your models here.

class BaseModel(models.Model):
    created_at = models.DateField(auto_now_add=True,null=True)
    updated_at = models.DateField(auto_now=True,null=True)

    class Meta:
        abstract = True


class User(AbstractUser, BaseModel, PermissionsMixin):
    phone_regex = RegexValidator(
        regex=r'^998\d{9}$',
        message="Telefon raqam '998XXXXXXXXX' formatida bo'lishi kerak!"
    )

    full_name = models.CharField(max_length=255,blank=True, null=True)
    first_name = None
    last_name = None
    email = models.EmailField(unique=True,blank=True, null=True, default=None)
    phone_number = models.CharField(max_length=12, blank=True, null=True, validators=[phone_regex], verbose_name=_('phone_number'))
    password = models.CharField(max_length=255,null=True, blank=True, verbose_name=_('password'))
    is_active = models.BooleanField(default=False, verbose_name=_('is_active'))
    is_verified = models.BooleanField(default=False, verbose_name=_('is_verified'))
    otp = models.CharField(max_length=4, null=True, blank=True, verbose_name=_("otp"))
    otp_created_at = models.DateTimeField(null=True, blank=True, verbose_name=_('otp_created_at'))
    is_from_social = models.BooleanField(default=False, verbose_name=_('is_from_social'))

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email or self.phone_number or f"{self.id}"



class UserAuthOtp(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
    # user = models.ForeignKey(User, verbose_name=_('userotp'), on_delete=models.CASCADE)
    code = models.IntegerField()
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_used = models.BooleanField(default=False)
    incorrect_count = models.IntegerField(default=0)
    verified = models.BooleanField(default=False, verbose_name=_('verified'))



class OtpSentLog(BaseModel):
    email = models.CharField(max_length=12, verbose_name=_("email"), blank=True, null=True)
    message_id = models.CharField(max_length=17, verbose_name=_("message_id"))
    otp = models.CharField(max_length=4, null=True, blank=True, verbose_name=_("otp"))

    class Meta:
        indexes = [
            # CRITICAL: Used for rate limiting - count OTPs sent today per phone
            models.Index(fields=['email', 'created_at'], name='otp_log_email_created_idx'),
        ]

class UserPasswordReset(BaseModel):
    user = models.OneToOneField(User, models.CASCADE, blank=True, null=True)  # OneToOneField auto-creates unique index
    reset_token = models.UUIDField(editable=True, null=True, blank=True, unique=True)  # unique=True auto-creates index
    reset_token_created_at = models.DateTimeField(null=True, blank=True)
    code = models.CharField(max_length=4, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    incorrect_count = models.IntegerField(default=0)
    otp_count = models.IntegerField(default=0)
    verified = models.BooleanField(default=False)
