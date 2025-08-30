from rest_framework.permissions import BasePermission


class IsBuyerUserPermission(BasePermission):
    def has_permission(self, request, view):
        is_buyer_user = request.user.role.name == "BUYER" or request.user.role.name == "BOTH"
        is_role_active = request.user.role.status == 1 and request.user.is_active and request.user.role.is_active

        return is_buyer_user and is_role_active
