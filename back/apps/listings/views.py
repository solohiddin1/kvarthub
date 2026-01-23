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
import nyckel


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
                        'description': 'For whom (BOYS, GIRLS, FAMILY, FOREIGNERS)'
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
        
        # Check if this is the user's first listing
        existing_listings_count = Listing.objects.filter(host=user).count()
        is_first_listing = existing_listings_count == 0
        
        # Define listing charge amount
        LISTING_CREATION_CHARGE = settings.LISTING_CREATION_CHARGE
        
        # If it's not the first listing, check for payment card and balance
        if not is_first_listing:
            # Check if user has active cards
            from apps.payment.models import Card
            user_cards = Card.objects.filter(user=user, is_active=True).order_by('-balance')
            
            if not user_cards.exists():
                return ErrorResponse(
                    result=ResultCodes.VALIDATION_ERROR,
                    message={
                        "en": "Please add a payment card before creating a listing.",
                        "ru": "Пожалуйста, добавьте платежную карту перед созданием объявления.",
                        "uz": "Iltimos, e'lon yaratishdan oldin to'lov kartasini qo'shing."
                    }
                )
            
            # Try to find a card with sufficient balance
            user_card = None
            for card in user_cards:
                if card.balance >= LISTING_CREATION_CHARGE:
                    user_card = card
                    break
            
            # If no card has sufficient balance
            if not user_card:
                total_balance = sum(card.balance for card in user_cards)
                return ErrorResponse(
                    result=ResultCodes.VALIDATION_ERROR,
                    message={
                        "en": f"Insufficient balance in all cards. You need {LISTING_CREATION_CHARGE} to create a listing. Total balance across all cards: {total_balance}",
                        "ru": f"Недостаточно средств на всех картах. Для создания объявления требуется {LISTING_CREATION_CHARGE}. Общий баланс на всех картах: {total_balance}",
                        "uz": f"Barcha kartalarda mablag' yetarli emas. E'lon yaratish uchun {LISTING_CREATION_CHARGE} kerak. Barcha kartalardagi umumiy balans: {total_balance}"
                    }
                )
        else:
            user_card = None
        
        # Check for NSFW content in uploaded images BEFORE touching request.data
        images_upload = request.FILES.getlist('images_upload')
        if images_upload:
            logger.info(f"Checking {len(images_upload)} images for content validation.")
            
            # Prepare validation tasks
            # has_nyckel = settings.NYCKEL_TOKEN and settings.NYCKEL_TOKEN != 'None'
            has_nyckel = settings.CLIENT_ID and settings.CLIENT_SECRET and settings.CLIENT_ID != 'None' and settings.CLIENT_SECRET != 'None'
            logger.info(f"Nyckel validation is {'enabled' if has_nyckel else 'disabled'}.")
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
                
                logger.info(f"Running Nyckel content validation for an image.{image.name}")
                # Only check Nyckel for house presence if configured
                if has_nyckel:
                    url = 'https://www.nyckel.com/v1/functions/house-presence-identifier/invoke'
                    # headers = {'Authorization': 'Bearer ' + settings.NYCKEL_TOKEN}
                    # logger.info(f"Sending image to Nyckel for validation.{headers}")
                    # logger.info(settings.NYCKEL_TOKEN)
                    credentials=nyckel.Credentials(client_id=settings.CLIENT_ID, client_secret=settings.CLIENT_SECRET)

                    try:
                        # result = requests.post(
                        #     url, 
                        #     headers=headers, 
                        #     files={'data': (image.name, BytesIO(image_bytes), image.content_type)},
                        #     timeout=20  # Add timeout to prevent hanging
                        # )
                        nyckel_response = nyckel.invoke("house-presence-identifier", "https://www.nyckel.com/assets/example.jpg", credentials)
                        
                        logger.info(f"Nyckel response: {nyckel_response}")
                        label_name = nyckel_response.get('labelName', '')
                        confidence = nyckel_response.get('confidence', 0)
                        example_response = {
                            "labelName": "Bird",
                            "labelId": "label_2n5a7za51n329v0l",
                            "confidence": 0.76
                            }
                        logger.info(f"Nyckel example response: {example_response}")
                        logger.info(f"Nyckel example response: {nyckel_response}")
                        # Reject if house is not present with high confidence
                        if label_name == "House Not Present" and confidence >= 0.70:
                            logger.error(f"Nyckel validation failed: House not present (confidence: {confidence:.2%})")
                            return ErrorResponse(
                                result=ResultCodes.VALIDATION_ERROR,
                                message={
                                    "en": f"Image does not contain a house/property (confidence: {confidence:.2%}). Please upload actual property images.",
                                    "ru": f"Изображение не содержит дом/недвижимость (уверенность: {confidence:.2%}). Пожалуйста, загрузите фактические изображения недвижимости.",
                                    "uz": f"Rasmda uy/ko'chmas mulk yo'q (ishonch: {confidence:.2%}). Iltimos, haqiqiy uy rasmlarini yuklang."
                                }
                            )
                        logger.info(f"Nyckel validation passed for image.{image.name}")
                    except Exception as e:
                        logger.error(f"Nyckel API error: {str(e)}")
                        # Continue without Nyckel validation if it fails

        # Validate incoming data - serializer will handle for_whom array extraction


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with db_transaction.atomic():
            listing = serializer.save(host=user)
            
            # Only charge if it's not the first listing
            if not is_first_listing:
                card_balance_before = float(user_card.balance)
                user_card.balance = card_balance_before - LISTING_CREATION_CHARGE
                user_card.save()
                
                # Create transaction record
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
            else:
                logger.info(f"First listing for user {user.email} - no charge applied.")

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
        print(instance.host, user)
        if instance.host != user:
            print("Permission denied: User is not the host of the listing.")
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
                from apps.payment.models import Card
                user_cards = Card.objects.filter(user=user, is_active=True).order_by('-balance')
                
                if not user_cards.exists():
                    return ErrorResponse(
                        result=ResultCodes.VALIDATION_ERROR,
                        message={
                            "en": "Please add a payment card before activating the listing.",
                            "ru": "Пожалуйста, добавьте платежную карту перед активацией объявления.",
                            "uz": "Iltimos, e'lonni faollashtirishdan oldin to'lov kartasini qo'shing."
                        }
                    )
                
                # Try to find a card with sufficient balance
                card = None
                for c in user_cards:
                    if c.balance >= settings.LISTING_ACTIVATION_CHARGE:
                        card = c
                        break
                
                # If no card has sufficient balance
                if not card:
                    total_balance = sum(c.balance for c in user_cards)
                    return ErrorResponse(
                        result=ResultCodes.VALIDATION_ERROR,
                        message={
                            "en": f"Insufficient balance in all cards. You need {settings.LISTING_ACTIVATION_CHARGE} to activate the listing. Total balance across all cards: {total_balance}",
                            "ru": f"Недостаточно средств на всех картах. Для активации объявления требуется {settings.LISTING_ACTIVATION_CHARGE}. Общий баланс на всех картах: {total_balance}",
                            "uz": f"Barcha kartalarda mablag' yetarli emas. E'lonni faollashtirish uchun {settings.LISTING_ACTIVATION_CHARGE} kerak. Barcha kartalardagi umumiy balans: {total_balance}"
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
