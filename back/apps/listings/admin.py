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
    list_display = ('id', 'title', 'host', 'price', 'location', 'state', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'location', 'host__username', 'host__email')
    list_filter = ('state', 'is_active', 'created_at', 'region', 'district')
    list_editable = ('state', 'is_active')  # Allow quick editing from list view
    readonly_fields = ('created_at', 'updated_at')
    # inlines = [ListingImage]
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'host', 'price')
        }),
        ('Location', {
            'fields': ('region', 'district', 'location', 'location_link')
        }),
        ('Details', {
            'fields': ('rooms', 'floor_of_this_apartment', 'total_floor_of_building', 'phone_number', 'type')
        }),
        ('Status', {
            'fields': ('state', 'is_active'),
            'description': 'Change state to ACCEPTED to show on homepage'
        }),
        ('For Whom', {
            'fields': ('for_whom',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_listings', 'reject_listings', 'set_to_checking']
    
    def approve_listings(self, request, queryset):
        updated = queryset.update(state='ACCEPTED')
        self.message_user(request, f'{updated} listing(s) approved successfully.')
    approve_listings.short_description = "Approve selected listings"
    
    def reject_listings(self, request, queryset):
        updated = queryset.update(state='REJECTED')
        self.message_user(request, f'{updated} listing(s) rejected.')
    reject_listings.short_description = "Reject selected listings"
    
    def set_to_checking(self, request, queryset):
        updated = queryset.update(state='CHECKING')
        self.message_user(request, f'{updated} listing(s) set to checking.')
    set_to_checking.short_description = "Set to checking status"


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('icon', 'name',)
    search_fields = ('name',)