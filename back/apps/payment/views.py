from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction as db_transaction
from .models import Card, Transaction, ListingDailyCharge
from .serializers import (
    CardSerializer, 
    CardCreateSerializer, 
    TransactionSerializer,
    ListingDailyChargeSerializer
)
from apps.shared.enum import ResultCodes
from apps.shared.utils import SuccessResponse, ErrorResponse
from apps.shared.utils import get_logger

logger = get_logger()


class AddCardView(generics.CreateAPIView):
    """Add a new card and automatically credit 500"""
    serializer_class = CardCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return SuccessResponse(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ListCardsView(generics.ListAPIView):
    """List user's cards"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(serializer.data)


class CardRetrieveView(generics.RetrieveAPIView):
    """Get a specific card"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return SuccessResponse(serializer.data)


class CardUpdateView(generics.UpdateAPIView):
    """Update a specific card"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return SuccessResponse(serializer.data)


class CardDeleteView(generics.DestroyAPIView):
    """Delete a specific card"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        listings = user.listings.filter(host=user, is_active=True)
        if listings.exists():
            return ErrorResponse(
                result=ResultCodes.CARD_IN_USE,
                # message={"error": "Cannot delete card linked to active listings, please deactivate listings first"}
            )
        self.perform_destroy(instance)
        return SuccessResponse({"message": "Card deleted successfully"})


class TransactionListView(generics.ListAPIView):
    """List user's transactions"""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(serializer.data)


class ChargeCardView(APIView):
    """Charge a user's card for a specific amount"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Charge card for a listing or other purpose
        Expected payload: {
            "card_id": int,
            "amount": float,
            "listing_id": int (optional),
            "description": str (optional)
        }
        """
        user = request.user
        card_id = request.data.get('card_id')
        amount = request.data.get('amount')
        listing_id = request.data.get('listing_id')
        description = request.data.get('description', '')
        
        # Validate inputs
        if not card_id or not amount:
            return ErrorResponse(
                result=ResultCodes.VALIDATION_ERROR,
                message={"error": "card_id and amount are required"}
            )
        
        try:
            amount = float(amount)
            if amount <= 0:
                return ErrorResponse(
                    result=ResultCodes.VALIDATION_ERROR,
                    message={"error": "Amount must be positive"}
                )
        except ValueError:
            return ErrorResponse(
                result=ResultCodes.VALIDATION_ERROR,
                message={"error": "Invalid amount format"}
            )
        
        # Get card
        try:
            card = Card.objects.get(id=card_id, user=user, is_active=True)
        except Card.DoesNotExist:
            return ErrorResponse(
                result=ResultCodes.CARD_NOT_FOUND,
                message={"error": "Card not found or inactive"}
            )
        
        # Check balance
        if card.balance < amount:
            return ErrorResponse(
                result=ResultCodes.INSUFFICIENT_BALANCE,
                message={"error": "Insufficient balance", "balance": str(card.balance)}
            )
        
        # Perform transaction
        with db_transaction.atomic():
            card.balance -= amount
            card.save()
            
            transaction_obj = Transaction.objects.create(
                user=user,
                card=card,
                listing_id=listing_id,
                amount=amount,
                transaction_type='listing_charge',
                status='completed',
                description=description
            )
            
            logger.info(f"Charged {amount} from card {card.id} for user {user.email}")
        
        return SuccessResponse({
            "message": "Payment successful",
            "transaction_id": transaction_obj.id,
            "remaining_balance": str(card.balance)
        })

