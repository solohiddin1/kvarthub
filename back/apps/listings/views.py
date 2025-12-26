from apps.users.models import User
from apps.shared.utils import SuccessResponse, ErrorResponse, detect_nsfw, get_logger
from apps.shared.enum import ResultCodes

from apps.listings.models import Listing, ListingImage
from apps.listings.serializers import ListingSerializer, BaseListingSerializer, ListingDetailSerializer

from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView, ListAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend

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
        
        # Check for NSFW content in uploaded images BEFORE copying data
        images_upload = request.FILES.getlist('images_upload')
        if images_upload:
            logger.info(f"Checking {len(images_upload)} images for NSFW content.")
            for image in images_upload:
                # Reset file pointer to beginning
                image.seek(0)
                is_nsfw, confidence = detect_nsfw(image)
                # Reset file pointer again for serializer to use
                image.seek(0)
                if is_nsfw:
                    return ErrorResponse(
                        result=ResultCodes.VALIDATION_ERROR,
                        message={
                            "en": f"Image contains inappropriate content (confidence: {confidence:.2%}). Please upload appropriate property images.",
                            "ru": f"Изображение содержит неприемлемый контент (уверенность: {confidence:.2%}). Пожалуйста, загрузите соответствующие изображения недвижимости.",
                            "uz": f"Rasm nomaqbul kontent o'z ichiga oladi (ishonch: {confidence:.2%}). Iltimos, tegishli uy rasmlarini yuklang."
                        }
                    )
        
        # Create a mutable copy of data and add host
        data = request.data.copy()
        data['host'] = user.id
        
        # Serializer handles image creation automatically
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return listing with images
        listing_serializer = self.get_serializer(serializer.instance)
        return SuccessResponse(listing_serializer.data)


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
