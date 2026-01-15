from django.contrib import admin

from .models import Card, Transaction, ListingDailyCharge

# Register your models here.

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'card_number_last4', 'card_holder_name', 
                    'expiry_month', 'expiry_year', 'balance', 'is_active', 
                    'created_at', 'updated_at')
    list_filter = ('is_active', 'expiry_year')
    search_fields = ('user__email', 'card_holder_name', 'card_number_last4')
    # readonly_fields = ('created_at', 'updated_at')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'card', 'listing', 'amount', 
                    'transaction_type', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'created_at')
    search_fields = ('user__email', 'card__card_holder_name', 'listing__id')
    # readonly_fields = ('created_at', 'updated_at')

@admin.register(ListingDailyCharge)
class ListingDailyChargeAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'user', 'amount', 'charge_date', 'success')
    list_filter = ('success', 'charge_date')
    search_fields = ('user__email', 'listing__id')
    # readonly_fields = ('created_at', 'updated_at')