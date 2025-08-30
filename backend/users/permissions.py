from rest_framework.permissions import BasePermission


class IsAdminUserPermission(BasePermission):
    def has_permission(self, request, view):
        is_admin_user = request.user.role.name == "SUPER_ADMIN" or request.user.role.name == "ADMIN"
        is_role_active = request.user.role.status == 1

        return is_admin_user and is_role_active


class IsInspectorPermission(BasePermission):
    def has_permission(self, request, view):
        is_inspector_user = request.user.role.name == "INSPECTOR"
        has_inspector = request.user.inspector.exists()

        return is_inspector_user and has_inspector


class IsDealerPermission(BasePermission):
    def has_permission(self, request, view):
        is_admin_user = request.user.role.name == "SELLER"  or request.user.role.name == "BUYER" or request.user.role.name == "BOTH"
        is_role_active = request.user.role.status == 1

        return is_admin_user and is_role_active
