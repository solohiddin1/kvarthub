from django.urls import path
from .views import (
    AddCardView,
    ListCardsView,
    CardRetrieveView,
    CardUpdateView,
    CardDeleteView,
    TransactionListView,
    ChargeCardView
)

app_name = 'payment'

urlpatterns = [
    path('cards/', ListCardsView.as_view(), name='list-cards'),
    path('cards/add/', AddCardView.as_view(), name='add-card'),
    path('cards/<int:pk>/', CardRetrieveView.as_view(), name='card-retrieve'),
    path('cards/<int:pk>/update/', CardUpdateView.as_view(), name='card-update'),
    path('cards/<int:pk>/delete/', CardDeleteView.as_view(), name='card-delete'),
    path('transactions/', TransactionListView.as_view(), name='transactions'),
    path('charge/', ChargeCardView.as_view(), name='charge-card'),
]
