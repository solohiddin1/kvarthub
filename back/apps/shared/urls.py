from django.urls import path
from .views import SharedView, RegionsListView, DistrictsListView

urlpatterns = [
    path('', SharedView.as_view(), name='shared-view'),
    path('regions/', RegionsListView.as_view(), name='regions-list'),
    path('districts/', DistrictsListView.as_view(), name='districts-list'),
]