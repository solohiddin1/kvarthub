from enum import Enum


class ResultCodes(Enum):
    SUCCESS = 0
    UNKNOWN_ERROR = -1
    USER_ALREADY_REGISTERED = -2
    USER_NOT_FOUND = -3
    WRONG_VERIFICATION_CODE = -4
    INVALID_CREDENTIALS = -5
    INVALID_REFRESH_TOKEN = -6
    PRODUCT_IMAGE_NOT_FOUND = -11
    PRODUCT_IMAGE_NOT_CREATED = -12
    PRODUCT_NOT_CREATED = -13
    PRODUCT_NOT_UPDATED = -14
    VALIDATION_ERROR = -15
    INTERNAL_SERVER_ERROR = -17
    BUSINESS_NOT_FOUND = -18
    USER_ROLE_NOT_FOUND = -19
    USER_IS_NOT_VERIFIED = -20
    USER_WITH_THIS_PHONE_NUMBER_ALREADY_EXISTS = -22
    OTP_EXPIRED = -21
    SERVER_ERROR = -23
    DEVICE_ALREADY_REGISTERED = -25
    ALREADY_VERIFIED = -57
    OTP_INCORRECT = -59
    INVALID_RESET_TOKEN = -60
    OTP_ALREADY_SENT = -61
    FAILED_TO_OBTAIN_TOKEN = -62
    NO_CODE_PROVIDED = -63
    ERROR_SMS_SERVICE = -64
    YOU_DO_NOT_HAVE_PERMISSION = -100
    CARD_NOT_FOUND = -101
    CARD_INACTIVE = -102
    INSUFFICIENT_BALANCE = -103
    NO_ACTIVE_CARD = -104
    CARD_CREATION_FAILED = -105
    PAYMENT_FAILED = -106
    CARD_IN_USE = -107
    INVALID_URL = -108



ResultMessages = {
    "SUCCESS": {
        "uz": "Muvaffaqiyatli bajarildi!",
        "en": "Success!",
        "ru": "Успешно!"
    },
    "USER_IS_NOT_VERIFIED": {
        "uz": "User vefikatsiyadan o'tmaga",
        "ru": "User ne verifitsirovan",
        "en": "User is not verified"
    },
    "UNKNOWN_ERROR": {
        "uz": "Noma'lum xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring!",
        "en": "An unknown error occurred. Please try again later!",
        "ru": "Произошла неизвестная ошибка. Пожалуйста, попробуйте позже!"
    },
    "USER_ALREADY_REGISTERED": {
        "uz": "Foydalanuvchi allaqachon ro‘yxatdan o‘tgan!",
        "en": "User is already registered!",
        "ru": "Пользователь уже зарегистрирован!"
    },
    "USER_NOT_FOUND": {
        "uz": "Foydalanuvchi topilmadi!",
        "en": "User not found!",
        "ru": "Пользователь не найден!"
    },
    "USER_WITH_THIS_PHONE_NUMBER_ALREADY_EXISTS": {
        "uz": "Foydalanuvchi ushbu telefon raqami bilan allaqachon mavjud!",
        "en": "User with this phone number already exists!",
        "ru": "Пользователь с этим номером телефона уже существует!"
    },
    "WRONG_VERIFICATION_CODE": {
        "uz": "Tasdiqlash kodi noto‘g‘ri!",
        "en": "Wrong verification code!",
        "ru": "Неверный код подтверждения!"
    },
    "INVALID_CREDENTIALS": {
        "uz": "Login yoki parol noto‘g‘ri!",
        "en": "Invalid credentials!",
        "ru": "Неверный логин или пароль!"
    },
    "INVALID_REFRESH_TOKEN": {
        "uz": "Refresh token yaroqsiz!",
        "en": "Invalid refresh token!",
        "ru": "Неверный refresh token!"
    },
    "PRODUCT_IMAGE_NOT_FOUND": {
        "uz": "Mahsulot rasmi topilmadi!",
        "en": "Product image not found!",
        "ru": "Изображение товара не найдено!"
    },
    "PRODUCT_IMAGE_NOT_CREATED": {
        "uz": "Mahsulot rasmi yaratilmagan!",
        "en": "Product image not created!",
        "ru": "Изображение товара не создано!"
    },
    "PRODUCT_NOT_CREATED": {
        "uz": "Mahsulot yaratilmagan!",
        "en": "Product not created!",
        "ru": "Товар не создан!"
    },
    "PRODUCT_NOT_UPDATED": {
        "uz": "Mahsulot yangilanmadi!",
        "en": "Product not updated!",
        "ru": "Товар не обновлён!"
    },
    "VALIDATION_ERROR": {
        "uz": "Tasdiqlash xatosi yuz berdi!",
        "en": "Validation error!",
        "ru": "Ошибка валидации!"
    },
    "INTERNAL_SERVER_ERROR": {
        "uz": "Ichki server xatosi!",
        "en": "Internal server error!",
        "ru": "Внутренняя ошибка сервера!"
    },
    "BUSINESS_NOT_FOUND": {
        "uz": "Biznes topilmadi!",
        "en": "Business not found!",
        "ru": "Бизнес не найден!"
    },
    "USER_ROLE_NOT_FOUND": {
        "uz": "Foydalanuvchi  topilmadi!",
        "en": "User  not found!",
        "ru": "пользователя не найдена!"
    },
    "OTP_EXPIRED": {
        "uz": "OTP muddati tugagan!",
        "en": "OTP has expired!",
        "ru": "Срок действия OTP истёк!"
    },
    "SERVER_ERROR": {
        "uz": "Server xatosi!",
        "en": "Server error!",
        "ru": "Ошибка сервера!"
    },
    "ALREADY_VERIFIED": {
        "uz": "ALREADY_VERIFIED",
        "en": "ALREADY_VERIFIED",
        "ru": "ALREADY_VERIFIED"
    },
    "OTP_INCORRECT": {
        "uz": "Noto‘g‘ri OTP kiritildi!",
        "en": "Incorrect OTP!",
        "ru": "Неверный OTP!"
    },
    "INVALID_RESET_TOKEN": {
        "uz": "INVALID_RESET_TOKEN",
        "en": "INVALID_RESET_TOKEN",
        "ru": "INVALID_RESET_TOKEN"
    },
    "OTP_ALREADY_SENT": {
        "uz": "OTP allaqachon yuborilgan! Iltimos, biroz kuting va qayta urinib ko‘ring.",
        "en": "OTP has already been sent! Please wait a moment and try again.",
        "ru": "OTP уже был отправлен! Пожалуйста, подождите немного и попробуйте снова."
    },
    "FAILED_TO_OBTAIN_TOKEN": {
        "uz": "Token olishda xatolik yuz berdi!",
        "en": "Failed to obtain token!",
        "ru": "Не удалось получить токен!"
    },
    "NO_CODE_PROVIDED": {
        "uz": "Kod taqdim etilmadi!",
        "en": "No code provided!",
        "ru": "Код не предоставлен!"
    },
    "ERROR_SMS_SERVICE": {
        "uz": "SMS xizmatida xatolik yuz berdi!",
        "en": "Error in SMS service!",
        "ru": "Ошибка в SMS сервисе!"
    },
    "YOU_DO_NOT_HAVE_PERMISSION": {
        "uz": "Sizda ruxsat yo'q!",
        "en": "You do not have permission!",
        "ru": "У вас нет разрешения!"
    },
    "CARD_NOT_FOUND": {
        "uz": "Karta topilmadi!",
        "en": "Card not found!",
        "ru": "Карта не найдена!"
    },
    "CARD_INACTIVE": {
        "uz": "Karta nofaol!",
        "en": "Card is inactive!",
        "ru": "Карта неактивна!"
    },
    "INSUFFICIENT_BALANCE": {
        "uz": "Hisobda mablag' yetarli emas!",
        "en": "Insufficient balance!",
        "ru": "Недостаточно средств!"
    },
    "NO_ACTIVE_CARD": {
        "uz": "Faol karta topilmadi!",
        "en": "No active card found!",
        "ru": "Активная карта не найдена!"
    },
    "CARD_CREATION_FAILED": {
        "uz": "Karta yaratishda xatolik yuz berdi!",
        "en": "Failed to create card!",
        "ru": "Не удалось создать карту!"
    },
    "PAYMENT_FAILED": {
        "uz": "To'lov amalga oshmadi!",
        "en": "Payment failed!",
        "ru": "Платёж не выполнен!"
    },
    "CARD_IN_USE": {
        "uz": "Faol e'lonlarga ulangan kartani o'chirib bo'lmaydi, iltimos, avval e'lonlarni o'chiring yoki deaktivatsiya qiling",
        "en": "Cannot delete card linked to active listings, please deactivate listings first",
        "ru": "Невозможно удалить карту, связанную с активными объявлениями, пожалуйста, сначала деактивируйте объявления"
    },
    "INVALID_URL": {
        "uz": "Noto'g'ri URL manzil!",
        "en": "Invalid URL!",
        "ru": "Неверный URL!"
    },
}
