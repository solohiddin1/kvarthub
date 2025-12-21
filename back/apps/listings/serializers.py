from apps.users.models import User
from rest_framework import serializers
from apps.listings.models import Listing, ListingImage

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = [
            'id',
            'image'
        ]

class BaseListingSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)

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
            'images',
        ]
        read_only_fields = ['id', 'is_active']
        
    def get_images(self, obj):
        """Return serialized images for the listing"""
        images = ListingImage.objects.filter(listing=obj)
        return ListingImageSerializer(images, many=True, context=self.context).data


class ListingSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)
    images_upload = serializers.ListField(
        child=serializers.ImageField(max_length=None, allow_empty_file=False),
        write_only=True,
        required=False,
        help_text='Upload multiple images for the listing'
    )
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
            'images',
            'images_upload',
            'facilities',
        ]
        read_only_fields = [
            'id', 
            'is_active', 
            'images',
            'facilities'
        ]

    def get_images(self, obj):
        """Return serialized images for the listing"""
        images = ListingImage.objects.filter(listing=obj)
        return ListingImageSerializer(images, many=True, context=self.context).data

    def create(self, validated_data):
        """Handle image upload during creation"""
        images_data = validated_data.pop('images_upload', [])
        listing = Listing.objects.create(**validated_data)
        
        for image in images_data:
            ListingImage.objects.create(listing=listing, image=image)
        
        return listing

    def update(self, instance, validated_data):
        """Handle image upload during update"""
        images_data = validated_data.pop('images_upload', [])
        
        # Update listing fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images (without deleting old ones)
        for image in images_data:
            ListingImage.objects.create(listing=instance, image=image)
        
        return instance

    
class ListingDetailSerializer(ListingSerializer):
    images = serializers.SerializerMethodField(required=False)
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
            'images',
            'images_upload',
            'facilities',
        ]
        read_only_fields = [
            'id', 
            'is_active', 
            'images',
            'facilities'
        ]
        
    def get_images(self, obj):
        images = ListingImage.objects.filter(listing=obj)
        return ListingImageSerializer(images, many=True, context=self.context).data
