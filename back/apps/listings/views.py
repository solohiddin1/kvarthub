import requests
import base64
from io import BytesIO
from apps.users.models import User
from apps.shared.enum import ResultCodes
from apps.shared.utils import SuccessResponse, ErrorResponse, detect_nsfw, get_logger

from apps.listings.models import Listing, ListingImage
from apps.listings.serializers import ListingSerializer, BaseListingSerializer, ListingDetailSerializer

from apps.payment.models import Transaction

from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView, ListAPIView, GenericAPIView

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction as db_transaction
from django.conf import settings

logger = get_logger()

class ListingCreateView(CreateAPIView):
    """Create a new listing with optional image uploads"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        summary="Create a new listing",
        tags=["listings"],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string'},
                    'description': {'type': 'string'},
                    'price': {'type': 'number'},
                    'location': {'type': 'string'},
                    'location_link': {'type': 'string', 'format': 'uri'},
                    'rooms': {'type': 'integer'},
                    'phone_number': {'type': 'string'},
                    'total_floor_of_building': {'type': 'integer'},
                    'floor_of_this_apartment': {'type': 'integer'},
                    'region': {'type': 'integer'},
                    'district': {'type': 'integer'},
                    'for_whom': {
                        'type': 'array',
                        'items': {
                            'type': 'string',
                            'enum': ['BOYS', 'GIRLS', 'FAMILY', 'FOREIGNERS']
                    },
                        'description': 'For whom (BOYS, GIRLS, FAMILY, FOREIGNERS)',
                        # 'enum': ['BOYS', 'GIRLS', 'FAMILY', 'FOREIGNERS']
                    },
                    'state': {
                        'type': 'string',
                        'description': 'Listing state (ACCEPTED, REJECTED)',
                        'enum': ['ACCEPTED', 'REJECTED']
                    },
                    'images_upload': {
                        'type': 'array',
                        'items': {'type': 'string', 'format': 'binary'}
                    },
                },
                'required': ['title', 'description', 'price', 'location', 'rooms']
            }
        },
        description="Create a new listing. Frontend can send images in 'images_upload' field as multipart.",
    )
    def create(self, request, *args, **kwargs):
        user = request.user
        if user is None or not user.is_authenticated:
            return SuccessResponse(result="User is not authenticated.")
        
        # Check if user has an active card
        from apps.payment.models import Card
        user_card = Card.objects.filter(user=user, is_active=True).first()
        
        if not user_card:
            return ErrorResponse(
                result=ResultCodes.VALIDATION_ERROR,
                message={
                    "en": "Please add a payment card before creating a listing.",
                    "ru": "Пожалуйста, добавьте платежную карту перед созданием объявления.",
                    "uz": "Iltimos, e'lon yaratishdan oldin to'lov kartasini qo'shing."
                }
            )

        # Define listing charge amount
        LISTING_CREATION_CHARGE = settings.LISTING_CREATION_CHARGE
        
        # Check if user has sufficient balance
        if user_card.balance < LISTING_CREATION_CHARGE:
            return ErrorResponse(
                result=ResultCodes.VALIDATION_ERROR,
                message={
                    "en": f"Insufficient balance. You need {LISTING_CREATION_CHARGE} to create a listing. Current balance: {user_card.balance}",
                    "ru": f"Недостаточно средств. Для создания объявления требуется {LISTING_CREATION_CHARGE}. Текущий баланс: {user_card.balance}",
                    "uz": f"Balansda mablag' yetarli emas. E'lon yaratish uchun {LISTING_CREATION_CHARGE} kerak. Joriy balans: {user_card.balance}"
                }
            )
        
        # Check for NSFW content in uploaded images BEFORE touching request.data
        images_upload = request.FILES.getlist('images_upload')
        if images_upload:
            logger.info(f"Checking {len(images_upload)} images for content validation.")
            
            # Prepare validation tasks
            has_nyckel = settings.NYCKEL_TOKEN and settings.NYCKEL_TOKEN != 'None'
            
            for image in images_upload:
                # Read image bytes once
                image.seek(0)
                image_bytes = image.read()
                image.seek(0)
                
                # Run NSFW check first (faster, local check)
                # is_nsfw, nsfw_confidence = detect_nsfw(image)
                # image.seek(0)
                
                # if is_nsfw:
                #     return ErrorResponse(
                #         result=ResultCodes.VALIDATION_ERROR,
                #         message={
                #             "en": f"Image contains inappropriate content (confidence: {nsfw_confidence:.2%}). Please upload appropriate property images.",
                #             "ru": f"Изображение содержит неприемлемый контент (уверенность: {nsfw_confidence:.2%}). Пожалуйста, загрузите соответствующие изображения недвижимости.",
                #             "uz": f"Rasm nomaqbul kontent o'z ichiga oladi (ishonch: {nsfw_confidence:.2%}). Iltimos, tegishli uy rasmlarini yuklang."
                #         }
                #     )
                
                # Only check Nyckel for house presence if configured
                if has_nyckel:
                    url = 'https://www.nyckel.com/v1/functions/house-presence-identifier/invoke'
                    headers = {'Authorization': 'Bearer ' + settings.NYCKEL_TOKEN}
                    
                    try:
                        result = requests.post(
                            url, 
                            headers=headers, 
                            files={'data': (image.name, BytesIO(image_bytes), image.content_type)},
                            timeout=5  # Add timeout to prevent hanging
                        )
                        
                        nyckel_response = result.json()
                        label_name = nyckel_response.get('labelName', '')
                        confidence = nyckel_response.get('confidence', 0)
                        
                        # Reject if house is not present with high confidence
                        if label_name == "House Not Present" and confidence >= 0.6:
                            return ErrorResponse(
                                result=ResultCodes.VALIDATION_ERROR,
                                message={
                                    "en": f"Image does not contain a house/property (confidence: {confidence:.2%}). Please upload actual property images.",
                                    "ru": f"Изображение не содержит дом/недвижимость (уверенность: {confidence:.2%}). Пожалуйста, загрузите фактические изображения недвижимости.",
                                    "uz": f"Rasmda uy/ko'chmas mulk yo'q (ishonch: {confidence:.2%}). Iltimos, haqiqiy uy rasmlarini yuklang."
                                }
                            )
                    except Exception as e:
                        logger.error(f"Nyckel API error: {str(e)}")
                        # Continue without Nyckel validation if it fails

        # Validate incoming data - serializer will handle for_whom array extraction


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with db_transaction.atomic():
            card_balance_before = float(user_card.balance)
            user_card.balance = card_balance_before - LISTING_CREATION_CHARGE
            user_card.save()
            
            listing = serializer.save(host=user)
            
            # Create transaction recordqqqs\q
            Transaction.objects.create(
                user=user,
                card=user_card,
                listing=listing,
                amount=LISTING_CREATION_CHARGE,
                transaction_type='listing_charge',
                status='completed',
                description=f'Charge for creating listing: {listing.title}'
            )
            
            logger.info(f"Charged {LISTING_CREATION_CHARGE} from user {user.email} for listing creation.")

        return SuccessResponse(serializer.data)


class ListingsListView(ListAPIView):
    """List all listings"""
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = BaseListingSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]

    search_fields = ["title", "description", "location"]

    filterset_fields = {
        'price': ['gte', 'lte'],
        'region': ['exact'],
        'district': ['exact'],
        'floor_of_this_apartment': ['exact'],
        'rooms': ['exact'],
        'for_whom__name': ['exact'],
        'type': ['exact'],
    }

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(serializer.data)


class ListingRetrieveView(RetrieveAPIView):
    """Retrieve a single listing"""
    queryset = Listing.objects.all()
    serializer_class = ListingDetailSerializer
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return SuccessResponse(serializer.data)


class ListingUpdateView(UpdateAPIView):
    """Update a listing"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user = request.user
        if user is None or not user.is_authenticated:
            return ErrorResponse(result=ResultCodes.USER_NOT_FOUND)
        instance = self.get_object()
        if instance.host != user:
            return ErrorResponse(result=ResultCodes.YOU_DO_NOT_HAVE_PERMISSION)
        data = request.data.copy()
        data['host'] = user.id
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return SuccessResponse(serializer.data)


class ListingStatusUpdateView(UpdateAPIView):
    """Activate or deactivate a listing"""
    queryset = Listing.objects.all()
    lookup_field = 'id'
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Update listing status",
        description="Activate or deactivate a listing",
    )
    def update(self, request, *args, **kwargs):
        user = request.user
        if user is None or not user.is_authenticated:
            return ErrorResponse(result=ResultCodes.USER_NOT_FOUND)
        instance = self.get_object()
        if instance.host != user:
            return ErrorResponse(result=ResultCodes.YOU_DO_NOT_HAVE_PERMISSION)
        if instance.is_active:
            instance.is_active = False
        else:
            instance.is_active = True
            # Charge the user for activating the listing
            with db_transaction.atomic():
                card = None
                from apps.payment.models import Card
                card = Card.objects.filter(user=user, is_active=True).first()
                if not card:
                    return ErrorResponse(
                        result=ResultCodes.VALIDATION_ERROR,
                        message={
                            "en": "Please add a payment card before activating the listing.",
                            "ru": "Пожалуйста, добавьте платежную карту перед активацией объявления.",
                            "uz": "Iltimos, e'lonni faollashtirishdan oldin to'lov kartasini qo'shing."
                        }
                    )
                if card.balance < settings.LISTING_ACTIVATION_CHARGE:
                    return ErrorResponse(
                        result=ResultCodes.VALIDATION_ERROR,
                        message={
                            "en": f"Insufficient balance. You need {settings.LISTING_ACTIVATION_CHARGE} to activate the listing. Current balance: {card.balance}",
                            "ru": f"Недостаточно средств. Для активации объявления требуется {settings.LISTING_ACTIVATION_CHARGE}. Текущий баланс: {card.balance}",
                            "uz": f"Balansda mablag' yetarli emas. E'lonni faollashtirish uchun {settings.LISTING_ACTIVATION_CHARGE} kerak. Joriy balans: {card.balance}"
                        }
                    )
                # Deduct amount
                card_balance_before = float(card.balance)
                card.balance = card_balance_before - settings.LISTING_ACTIVATION_CHARGE
                card.save()
                Transaction.objects.create(
                    user=user,
                    listing=instance,
                    card=card,
                    amount=settings.LISTING_ACTIVATION_CHARGE,
                    transaction_type='listing_activation_charge',
                    status='completed',
                    description=f'Charge for activating listing: {instance.title}'
                )
                logger.info(f"Charged {settings.LISTING_ACTIVATION_CHARGE} from user {user.email} for listing activation.")
        instance.save()
        return SuccessResponse({"is_active": instance.is_active})

class ListingDestroyView(DestroyAPIView):
    """Delete a listing"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if user is None or not user.is_authenticated:
            return ErrorResponse(result=ResultCodes.USER_NOT_FOUND)
        instance = self.get_object()
        if instance.host != user:
            return ErrorResponse(result=ResultCodes.YOU_DO_NOT_HAVE_PERMISSION)
        self.perform_destroy(instance)
        return SuccessResponse(result="Listing deleted successfully.")


class MyListingsListView(ListAPIView):
    """List all listings of the authenticated user"""
    serializer_class = BaseListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Listing.objects.filter(host=user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(serializer.data)
    
class ProductImageDeleteView(GenericAPIView):
    permissions_classes = [IsAuthenticated]
    queryset = ListingImage.objects.all()

    @extend_schema(
        tags=["product-image"],
        parameters=[
            OpenApiParameter(
                name='id',
                description='ID of the product image to delete',
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        summary="Delete product image",
    )
    def delete(self, request, pk, *args, **kwargs):
        try:
            image = self.get_queryset().get(pk=pk)
            image.delete()
            return SuccessResponse({"message": "Image deleted"})
        except ListingImage.DoesNotExist:
            return ErrorResponse(ResultCodes.PRODUCT_IMAGE_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting product image: {str(e)}")
            return ErrorResponse(ResultCodes.INTERNAL_SERVER_ERROR)
