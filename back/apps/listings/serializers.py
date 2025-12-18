from apps.users.models import User
from rest_framework import serializers
from apps.listings.models import Listing

class BaseListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'price',
            'location',
            'rooms',
            'beds',
            'bathrooms',
            'max_people',
            'total_floor_of_building',
            'floor_of_this_apartment',  
            'square_meters',
            'region',
            'district',
            'is_active',
        ]
        read_only_fields = ['id', 'is_active']


class ListingSerializer(serializers.ModelSerializer):
    listings_images = serializers.StringRelatedField(many=True, read_only=True)
    facilities = serializers.StringRelatedField(many=True, read_only=True)
    host = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'description',
            'host',
            'price',
            'location',
            'lat',
            'long',
            'rooms',
            'beds',
            'bathrooms',
            'max_people',
            'phone_number',
            'total_floor_of_building',
            'floor_of_this_apartment',  
            'square_meters',
            'region',
            'district',
            'is_active',
            'listings_images',
            'facilities',
        ]
        read_only_fields = [
            'id', 
            'is_active', 
            'listings_images', 
            'facilities'
            ]