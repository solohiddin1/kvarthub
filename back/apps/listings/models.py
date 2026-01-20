from django.db import models
from apps.users.models import BaseModel
# Create your models here.

class ForWhom(models.Model):
    """Choices for who the listing is available for"""
    FOR_WHOM_CHOICES = (
        ('BOYS', 'BOYS'),
        ('GIRLS', 'GIRLS'),
        ('FAMILY', 'FAMILY'),
        ('FOREIGNERS', 'FOREIGNERS'),
    )
    
    name = models.CharField(max_length=15, choices=FOR_WHOM_CHOICES, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "For Whom"

class Listing(BaseModel):
    state = (
        ('ACCEPTED', 'ACCEPTED'),
        ('REJECTED', 'REJECTED'),
    )

    for_whom_state = (
        ('BOYS', 'BOYS'),
        ('GIRLS', 'GIRLS'),
        ('FAMILY', 'FAMILY'),
        ('FOREIGNERS', 'FOREIGNERS'),
    )
    listing_type = (
        ('EMPTY', 'EMPTY'),  # Bush kvartira
        ('PARTNERSHIP', 'PARTNERSHIP'),  # Sheriklik
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    host = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='listings')
    location = models.CharField(max_length=255)
    location_link = models.URLField(max_length=500, null=True, blank=True)
    rooms = models.IntegerField(default=1)
    state = models.CharField(max_length=10, choices=state, default='ACCEPTED')
    for_whom = models.CharField(max_length=15, choices=for_whom_state, blank=True, null=True)
    type = models.CharField(max_length=15, choices=listing_type, blank=True, null=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    total_floor_of_building = models.IntegerField(null=True, blank=True)
    floor_of_this_apartment = models.IntegerField(null=True, blank=True)
    region = models.ForeignKey('shared.Region', on_delete=models.SET_NULL, null=True, blank=True)
    district = models.ForeignKey('shared.District', on_delete=models.SET_NULL, null=True, blank=True)

    is_active = models.BooleanField(default=True)


    def __str__(self):
        return self.title
    
class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listing/images')

    def __str__(self):
        return f"Image for {self.listing.title}"
    
class Facility(models.Model):
    icon = models.ImageField(upload_to='facility/icons', null=True, blank=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name