from rest_framework import serializers
from django.conf import settings

from apps.users.models import User

from .models import Card, Transaction, ListingDailyCharge


class CardSerializer(serializers.ModelSerializer):
    """Serializer for Card model"""
    
    class Meta:
        model = Card
        fields = ['id', 'card_number_last4', 'card_holder_name', 'expiry_month', 
                  'expiry_year', 'balance', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'balance', 'created_at', 'updated_at']
    
    def validate_expiry_month(self, value):
        """Validate expiry month is between 1-12"""
        if not 1 <= value <= 12:
            raise serializers.ValidationError("Expiry month must be between 1 and 12")
        return value
    
    def validate_expiry_year(self, value):
        """Validate expiry year is in the future"""
        from datetime import datetime
        current_year = datetime.now().year
        if value < current_year:
            raise serializers.ValidationError("Card has expired")
        return value
    
    def validate_card_number_last4(self, value):
        """Validate last 4 digits"""
        if not value.isdigit() or len(value) != 4:
            raise serializers.ValidationError("Must be exactly 4 digits")
        return value


class CardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new card with full card number"""
    card_number = serializers.CharField(max_length=16, write_only=True)
    card_created_initial_balance = settings.CARD_CREATED_INITIAL_BALANCE
    class Meta:
        model = Card
        fields = ['card_number', 'card_holder_name', 'expiry_month', 'expiry_year']
    
    def validate_card_number(self, value):
        """Validate card number is 16 digits"""
        if not value.isdigit() or len(value) != 16:
            raise serializers.ValidationError("Card number must be exactly 16 digits")
        return value
    
    def validate_expiry_month(self, value):
        """Validate expiry month is between 1-12"""
        if not 1 <= value <= 12:
            raise serializers.ValidationError("Expiry month must be between 1 and 12")
        return value
    
    def validate_expiry_year(self, value):
        """Validate expiry year is in the future"""
        from datetime import datetime
        current_year = datetime.now().year
        if value < current_year:
            raise serializers.ValidationError("Card has expired")
        return value
    
    def create(self, validated_data):
        """Create card with last 4 digits and initial balance"""
        from django.conf import settings
        
        card_number = validated_data.pop('card_number')
        validated_data['card_number_last4'] = card_number[-4:]
        validated_data['balance'] = settings.CARD_INITIAL_BALANCE
        
        card = Card.objects.create(**validated_data)
        
        # Create initial credit transaction
        Transaction.objects.create(
            user=card.user,
            card=card,
            amount=settings.CARD_INITIAL_BALANCE,
            transaction_type='initial_credit',
            status='completed',
            description='Initial credit on card addition'
        )
        
        return card


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    card_last4 = serializers.CharField(source='card.card_number_last4', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'card', 'card_last4', 'listing', 'listing_title', 
                  'amount', 'transaction_type', 'status', 'description', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ListingDailyChargeSerializer(serializers.ModelSerializer):
    """Serializer for ListingDailyCharge model"""
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    
    class Meta:
        model = ListingDailyCharge
        fields = ['id', 'listing', 'listing_title', 'user', 'amount', 
                  'charge_date', 'transaction', 'success', 'created_at']
        read_only_fields = ['id', 'user', 'transaction', 'success', 'created_at']
