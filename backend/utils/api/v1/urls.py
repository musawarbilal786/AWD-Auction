from django.urls import path

from utils.api.v1.views import CountryListCreateAPIView, StateListCreateAPIView, CityListCreateAPIView

urlpatterns = [
    path("countries/", CountryListCreateAPIView.as_view(), name="countries_list_create"),
    path("cities/", CityListCreateAPIView.as_view(), name="cities_list_create"),
    path("states/", StateListCreateAPIView.as_view(), name="states_list_create"),
]
