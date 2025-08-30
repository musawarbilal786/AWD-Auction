from rest_framework.permissions import BasePermission


class IsSellerUserPermission(BasePermission):
    def has_permission(self, request, view):
        is_admin_user = request.user.role.name == "SELLER"  or request.user.role.name == "BOTH"
        is_role_active = request.user.role.status == 1

        return is_admin_user and is_role_active
