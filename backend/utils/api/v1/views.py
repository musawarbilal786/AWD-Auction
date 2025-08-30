from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.settings import api_settings
from rest_framework.permissions import AllowAny

from users.permissions import IsAdminUserPermission
from utils.api.v1.serializers import CitySerializer, StateSerializer, CountrySerializer
from utils.models import City, State, Country


class StateListCreateAPIView(ListCreateAPIView):
    serializer_class = StateSerializer
    queryset = State.objects.filter(status=1)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permission() for permission in api_settings.DEFAULT_PERMISSION_CLASSES + [IsAdminUserPermission]]

        return [AllowAny()]

class CountryListCreateAPIView(ListCreateAPIView):
    serializer_class = CountrySerializer
    queryset = Country.objects.filter(status=1)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permission() for permission in api_settings.DEFAULT_PERMISSION_CLASSES + [IsAdminUserPermission]]

        return [AllowAny()]

    def perform_create(self, serializer):
        instance = serializer.save()

        instance.created_by = self.request.user
        instance.updated_by = self.request.user
        instance.save()


class CityListCreateAPIView(ListCreateAPIView):
    serializer_class = CitySerializer
    queryset = City.objects.filter(status=1)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permission() for permission in api_settings.DEFAULT_PERMISSION_CLASSES + [IsAdminUserPermission]]

        return [AllowAny()]
