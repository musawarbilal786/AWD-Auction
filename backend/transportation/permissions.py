from rest_framework.permissions import BasePermission


class IsTransporterPermission(BasePermission):
    def has_permission(self, request, view):
        is_transporter_user = request.user.is_transporter == 1

        has_transporter = is_transporter_user and request.user.transporter is not None

        return is_transporter_user and has_transporter
