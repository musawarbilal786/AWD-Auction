# from dj_rest_auth.serializers import LoginSerializer
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.settings import api_settings
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from dj_rest_auth.views import LoginView


from users.api.v1.serializers import BuyerSellerRegistrationSerializer, UsersListSerializer, UserDetailSerializer, LoginSerializer, UserAddSerializer, RoleSerializer, DealershipSerializer, DealerLocationSerializer, RestoreInactiveUserSerializer, RestoreInactiveRoleSerializer, RestoreInactiveDealershipSerializer
from users.models import Role, Dealership, DealerLocation
from users.permissions import IsAdminUserPermission
from users.tasks import send_dealership_registration_request

User = get_user_model()

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = RefreshToken.for_user(serializer.validated_data.get('user'))

        user_serializer = UserDetailSerializer(serializer.validated_data.get('user'))

        data = {"refresh": str(refresh_token), "access": str(refresh_token.access_token), "user": user_serializer.data}

        return Response(data)


class RegisterAPIView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BuyerSellerRegistrationSerializer
    queryset = User.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()

        send_dealership_registration_request(instance)


class UsersListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = UsersListSerializer
    queryset = User.objects.filter(is_active=True).exclude(role__name__in=["BUYER", "SELLER", "BOTH"])


class UserRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = UserDetailSerializer
    queryset = User.objects.filter(is_active=True).exclude(role__name__in=["BUYER", "SELLER", "BOTH"])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({"detail": "User deactivated successfully."}, status=status.HTTP_204_NO_CONTENT)


class InactiveUsersListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = UsersListSerializer
    queryset = User.objects.filter(is_active=False).exclude(role__name__in=["BUYER", "SELLER", "BOTH"])


class DeleteInactiveUserAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RestoreInactiveUserSerializer
    queryset = User.objects.filter(is_active=False).exclude(role__name__in=["BUYER", "SELLER", "BOTH"])


class UserAddAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = UserAddSerializer
    queryset = User.objects.all()


class RoleListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RoleSerializer
    queryset = Role.objects.filter(is_active=True).exclude(name__in=["BUYER", "SELLER", "BOTH"])


class RoleRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RoleSerializer
    queryset = Role.objects.filter(is_active=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({"detail": "Role deactivated successfully."}, status=status.HTTP_204_NO_CONTENT)


class InactiveRoleListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RoleSerializer
    queryset = Role.objects.filter(is_active=False).exclude(name__in=["BUYER", "SELLER", "BOTH"])


class DeleteInactiveRoleAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RestoreInactiveRoleSerializer
    queryset = Role.objects.filter(is_active=False).exclude(name__in=["BUYER", "SELLER", "BOTH"])

    
class DealershipListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = DealershipSerializer

    def get_queryset(self):
        queryset = Dealership.objects.filter(is_active=True)
        status = self.request.query_params.get("approved")
        if status is not None:
            queryset = queryset.filter(approved=status)
        return queryset


class DealershipRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = DealershipSerializer
    queryset = Dealership.objects.filter(is_active=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({"detail": "Dealership deactivated successfully."}, status=status.HTTP_204_NO_CONTENT)


class InactiveDealershipListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = DealershipSerializer
    queryset = Dealership.objects.filter(is_active=False)


class DeleteInactiveDealershipAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RestoreInactiveDealershipSerializer
    queryset = Dealership.objects.filter(is_active=False)

    
class DealershipLocationListCreateAPIView(ListCreateAPIView):
    serializer_class = DealerLocationSerializer

    def get_queryset(self):
        return DealerLocation.objects.filter(user=self.request.user)
