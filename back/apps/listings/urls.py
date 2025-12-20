from django.urls import path

from apps.listings.views import (
    ListingCreateView,
    ListingsListView,
    ListingRetrieveView,
    ListingUpdateView,
    ListingDestroyView
)

urlpatterns = [
    # List all listings
    path('listings/', ListingsListView.as_view(), name='listing_list'),
    
    # Create a new listing
    path('listings/create/', ListingCreateView.as_view(), name='listing_create'),
    
    # Retrieve a listing by ID
    path('listings/<int:id>/', ListingRetrieveView.as_view(), name='listing_retrieve'),
    
    # Update a listing by ID
    path('listings/<int:id>/update/', ListingUpdateView.as_view(), name='listing_update'),
    
    # Delete a listing by ID
    path('listings/<int:id>/delete/', ListingDestroyView.as_view(), name='listing_delete'),
]