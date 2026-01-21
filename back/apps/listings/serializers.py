from apps.shared.models import District, Region
from apps.users.models import User
from rest_framework import serializers
from apps.listings.models import Listing, ListingImage, Facility, ForWhom

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = [
            'id',
            'image'
        ]

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'

class BaseListingSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)
    for_whom = serializers.SerializerMethodField(read_only=True)

    region = serializers.SerializerMethodField(read_only=True)
    district = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'price',
            'location',
            'location_link',
            'rooms',
            'total_floor_of_building',
            'floor_of_this_apartment',  
            'region',
            'for_whom',
            'district',
            'type',
            'is_active',
            'images',
        ]
        read_only_fields = ['id', 'is_active', 'region', 'district']
        
    def get_images(self, obj):
        """Return serialized images for the listing"""
        images = ListingImage.objects.filter(listing=obj)
        return ListingImageSerializer(images, many=True, context=self.context).data
    
    
    def get_for_whom(self, obj):
        """Return list of for_whom values"""

        return [fw.name for fw in obj.for_whom.all()] if obj.for_whom else None

    def get_region(self, obj):
        """Return region object"""
        return RegionSerializer(obj.region, context=self.context).data if obj.region else None

    def get_district(self, obj):
        """Return district object"""
        return DistrictSerializer(obj.district, context=self.context).data if obj.district else None
    
class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = [
            'id',
            'icon',
            'name',
        ]

        
class ListingSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)
    images_upload = serializers.ListField(
        child=serializers.ImageField(max_length=None, allow_empty_file=False),
        write_only=True,
        required=False,
        help_text='Upload multiple images for the listing'
    )
    facilities = serializers.StringRelatedField(many=True, read_only=True)
    host = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    for_whom = serializers.ListField(
        child=serializers.ChoiceField(choices=ForWhom.FOR_WHOM_CHOICES),
        write_only=True,
        required=False,
        help_text='List of audience types (e.g., ["BOYS", "GIRLS"])'
    )
    for_whom_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'description',
            'host',
            'price',
            'location',
            'location_link',
            'rooms',
            'phone_number',
            'total_floor_of_building',
            'floor_of_this_apartment',  
            'is_active',
            'region',
            'for_whom',
            'for_whom_display',
            'district',
            'type',
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
    
    def get_for_whom_display(self, obj):
        """Return list of for_whom values"""
        return [fw.name for fw in obj.for_whom.all()]
    
    # def to_internal_value(self, data):
    #     """Handle for_whom array from multipart/form-data (QueryDict)"""
    #     # Extract for_whom as list before parent processing
    #     if hasattr(data, 'getlist') and 'for_whom' in data:
    #         for_whom_list = data.getlist('for_whom')
    #         # Store it temporarily
    #         self._for_whom_list = for_whom_list
        
        # Convert QueryDict to regular dict to avoid copy issues with files
        # if hasattr(data, 'dict'):
        #     data_dict = {}
        #     for key in data.keys():
        #         if key == 'for_whom' and hasattr(self, '_for_whom_list'):
        #             data_dict[key] = self._for_whom_list
        #         elif key == 'images_upload':
        #             # Handle multiple files
        #             data_dict[key] = data.getlist(key) if hasattr(data, 'getlist') else data.get(key)
        #         else:
        #             data_dict[key] = data.get(key)
        #     return super().to_internal_value(data_dict)
        
        # return super().to_internal_value(data)

    def create(self, validated_data):
        """Handle image upload and for_whom during creation"""
        images_data = validated_data.pop('images_upload', [])
        for_whom_data = validated_data.pop('for_whom', [])
        listing = Listing.objects.create(**validated_data)
        
        # Add for_whom relationships
        for fw_name in for_whom_data:
            fw_obj, _ = ForWhom.objects.get_or_create(name=fw_name)
            listing.for_whom.add(fw_obj)
        
        for image in images_data:
            ListingImage.objects.create(listing=listing, image=image)
        
        return listing

    def update(self, instance, validated_data):
        """Handle image upload and for_whom during update"""
        images_data = validated_data.pop('images_upload', [])
        for_whom_data = validated_data.pop('for_whom', None)
        
        # Update listing fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update for_whom relationships if provided
        if for_whom_data is not None:
            instance.for_whom.clear()
            for fw_name in for_whom_data:
                fw_obj, _ = ForWhom.objects.get_or_create(name=fw_name)
                instance.for_whom.add(fw_obj)
        
        # Add new images (without deleting old ones)
        for image in images_data:
            ListingImage.objects.create(listing=instance, image=image)
        
        return instance
    
    def validate_rooms(self, value):
        """Validate rooms count"""
        if value and value > 200:
            raise serializers.ValidationError("Xonalar soni 200 dan oshmasligi kerak.")
        return value
    
    def validate_total_floor_of_building(self, value):
        """Validate total floor count"""
        if value and value > 150:
            raise serializers.ValidationError("Bino qavatlari soni 150 dan oshmasligi kerak.")
        return value
    
    def validate(self, data):
        """Validate that floor of apartment is less than total floors"""
        floor_apt = data.get('floor_of_this_apartment')
        total_floor = data.get('total_floor_of_building')
        
        if floor_apt and total_floor and floor_apt > total_floor:
            raise serializers.ValidationError({
                'floor_of_this_apartment': "Kvartira qavati binoning umumiy qavatidan oshmasligi kerak."
            })
        
        return data
    
    def validate_location_link(self, value):
        """Validate that location_link is a valid URL"""
        if not value:  # Allow empty/null values
            return value
            
        from django.core.validators import URLValidator
        from django.core.exceptions import ValidationError as DjangoValidationError
        
        validator = URLValidator()
        try:
            validator(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Invalid URL for location_link")
        
        return value


class ForWhomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForWhom
        fields = [
            'id',
            'name',
        ]

class ListingDetailSerializer(ListingSerializer):
    images = serializers.SerializerMethodField(required=False)
    facilities = serializers.StringRelatedField(many=True, read_only=True)
    host = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)
    region = serializers.SerializerMethodField(read_only=True)
    district = serializers.SerializerMethodField(read_only=True)
    for_whom_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'description',
            'host',
            'price',
            'location',
            'location_link',
            'rooms',
            'phone_number',
            'total_floor_of_building',
            'floor_of_this_apartment',  
            'is_active',
            'for_whom_display',
            'region',
            'district',
            'type',

            'for_whom',

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
    
    def get_for_whom_display(self, obj):
        """Return list of for_whom values"""
        return [fw.name for fw in obj.for_whom.all()]
    
    def get_region(self, obj):
        """Return region object"""
        return RegionSerializer(obj.region, context=self.context).data if obj.region else None
        
    def get_district(self, obj):
        """Return district object"""
        return DistrictSerializer(obj.district, context=self.context).data if obj.district else None
    
    def get_for_whom(self, obj):
        """Return list of for_whom values"""
        return [fw.name for fw in obj.for_whom.all()]
    
    def get_images(self, obj):
        images = ListingImage.objects.filter(listing=obj)
        return ListingImageSerializer(images, many=True, context=self.context).data
