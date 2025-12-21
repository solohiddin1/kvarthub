from drf_spectacular.utils import extend_schema_view, extend_schema
from rest_framework.response import Response
from rest_framework import generics, permissions

from apps.shared.models import District, Region
from .utils import SuccessResponse
from apps.shared.serializers import RegionDistrictSerializer, DistrictSerializer, RegionSerializer

@extend_schema(
    summary="Shared API View for Regions and Districts",
    description="This is an API view to retrieve shared data like regions and districts.",
)
class SharedView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegionDistrictSerializer

    def get(self, request, *args, **kwargs):

        serializer = self.get_serializer(Region.objects.all(), many=True)
        return SuccessResponse(
            result=serializer.data
        )


@extend_schema_view(
    get=extend_schema(
        summary="List Regions",
        description="Retrieve a list of all regions.",
    )
)
class RegionsListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegionSerializer
    queryset = Region.objects.all()

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return SuccessResponse(
            result=serializer.data
        )
    

@extend_schema_view(
    get=extend_schema(
        summary="List Districts",
        description="Retrieve a list of all districts.",
    )
)
class DistrictsListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = DistrictSerializer
    queryset = District.objects.all()

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return SuccessResponse(
            result=serializer.data
        )