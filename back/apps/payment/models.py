from django.db import models
from apps.users.models import User
from apps.listings.models import Listing


class Card(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cards')
    card_number_last4 = models.CharField(max_length=4, help_text="Last 4 digits of card")
    card_holder_name = models.CharField(max_length=255)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=500.00, help_text="Card balance in system")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.card_holder_name} - **** {self.card_number_last4}"


class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('initial_credit', 'Initial Credit'),
        ('listing_charge', 'Listing Charge'),
        ('daily_charge', 'Daily Charge'),
        ('refund', 'Refund'),
    ]
    
    TRANSACTION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    card = models.ForeignKey(Card, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.transaction_type} - {self.amount}"


class ListingDailyCharge(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='daily_charges')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    charge_date = models.DateField()
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
    success = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-charge_date']
        unique_together = ['listing', 'charge_date']
        
    def __str__(self):
        return f"{self.listing.title} - {self.charge_date} - {self.amount}"