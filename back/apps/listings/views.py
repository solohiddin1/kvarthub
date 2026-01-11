from apps.users.models import User
from apps.shared.enum import ResultCodes
from apps.shared.utils import SuccessResponse, ErrorResponse, detect_nsfw, get_logger

from apps.listings.models import Listing, ListingImage
from apps.listings.serializers import ListingSerializer, BaseListingSerializer, ListingDetailSerializer

from apps.payment.models import Transaction

from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView, ListAPIView, GenericAPIView

from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction as db_transaction
from django.conf import settings
from django.db import transaction as db_transaction
from django.conf import settings

logger = get_logger()
# Create your views here.

class ListingCreateView(CreateAPIView):
    """Create a new listing with optional image uploads"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        summary="Create a new listing",
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
            logger.info(f"Checking {len(images_upload)} images for NSFW content.")
            for image in images_upload:
                # Ensure file pointer is at start for reading and restored afterward
                try:
                    image.seek(0)
                except Exception:
                    pass
                is_nsfw, confidence = detect_nsfw(image)
                try:
                    image.seek(0)
                except Exception:
                    pass
                if is_nsfw:
                    return ErrorResponse(
                        result=ResultCodes.VALIDATION_ERROR,
                        message={
                            "en": f"Image contains inappropriate content (confidence: {confidence:.2%}). Please upload appropriate property images.",
                            "ru": f"Изображение содержит неприемлемый контент (уверенность: {confidence:.2%}). Пожалуйста, загрузите соответствующие изображения недвижимости.",
                            "uz": f"Rasm nomaqbul kontent o'z ichiga oladi (ishonch: {confidence:.2%}). Iltimos, tegishli uy rasmlarini yuklang."
                        }
                    )

        # Validate incoming data directly (avoid copying QueryDict with files)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Use atomic transaction to ensure payment and listing creation happen together
        with db_transaction.atomic():
            # Charge the card
            card_balance_before = float(user_card.balance)
            user_card.balance = card_balance_before - LISTING_CREATION_CHARGE
            user_card.save()
            
            # Save listing
            listing = serializer.save(host=user)
            
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

        # Return listing with images
        return SuccessResponse(serializer.data)


class ListingsListView(ListAPIView):
    """List all listings"""
    queryset = Listing.objects.filter(is_active=True)
    serializer_class = BaseListingSerializer
    filter_backends = [DjangoFilterBackend]

    filterset_fields = {
        'price': ['gte', 'lte'],
        'region': ['exact'],
        'district': ['exact'],
        'floor_of_this_apartment': ['exact'],
        'rooms': ['exact'],
    }


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
