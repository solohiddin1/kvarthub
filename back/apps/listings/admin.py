from django.contrib import admin
from apps.listings.models import Listing, ListingImage, Facility, ForWhom

# Register your models here.

@admin.register(ForWhom)
class ForWhomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'image')
    search_fields = ('listing__title',)
    # model = Listing
    # extra = 1


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'host', 'price', 'location', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'location', 'host__username')
    list_filter = ('is_active', 'state', 'created_at')
    # inlines = [ListingImage]
    ordering = ('-created_at',)


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('icon', 'name',)
    search_fields = ('name',)