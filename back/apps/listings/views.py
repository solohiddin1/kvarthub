from apps.users.models import User
from apps.shared.utils import SuccessResponse, ErrorResponse
from apps.shared.enum import ResultCodes

from apps.listings.models import Listing
from apps.listings.serializers import ListingSerializer, BaseListingSerializer

from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated


# Create your views here.

class ListingCreateView(CreateAPIView):
    """Create a new listing"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        if user is None or not user.is_authenticated:
            return SuccessResponse(result="User is not authenticated.")
        data = request.data.copy()
        data['host'] = user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return SuccessResponse(serializer.data)


class ListingsListView(ListAPIView):
    """List all listings"""
    queryset = Listing.objects.all()
    serializer_class = BaseListingSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(serializer.data)


class ListingRetrieveView(RetrieveAPIView):
    """Retrieve a single listing"""
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
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
