from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.api.v1.views import LoginAPIView, RegisterAPIView, UsersListAPIView, UserRetrieveUpdateDestroyAPIView, UserAddAPIView, RoleListCreateAPIView, DealershipListCreateAPIView, DealershipRetrieveUpdateDestroyAPIView, DealershipLocationListCreateAPIView, RoleRetrieveUpdateDestroyAPIView, InactiveUsersListAPIView, DeleteInactiveUserAPIView, InactiveRoleListAPIView, DeleteInactiveRoleAPIView, InactiveDealershipListAPIView, DeleteInactiveDealershipAPIView

urlpatterns = [
    path("login/", LoginAPIView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("admin/users-list/", UsersListAPIView.as_view(), name="admin_users_list"),
    path("admin/user/<int:pk>/", UserRetrieveUpdateDestroyAPIView.as_view(), name="admin_user_retrieve_update_destroy"),
    path("admin/add-user/", UserAddAPIView.as_view(), name="admin_add_user"),
    path("admin/inactive-users/", InactiveUsersListAPIView.as_view(), name="inactive_users_list"),
    path("admin/inactive-users/<int:pk>/delete/", DeleteInactiveUserAPIView.as_view(), name="delete_inactive_user"),
    path("role/", RoleListCreateAPIView.as_view(), name="role_list_create"),
    path("role/<int:pk>/", RoleRetrieveUpdateDestroyAPIView.as_view(), name="role_retrieve_update"),
    path("admin/inactive-role/", InactiveRoleListAPIView.as_view(), name="inactive_roles_list"),
    path("admin/inactive-role/<int:pk>/delete/", DeleteInactiveRoleAPIView.as_view(), name="delete_inactive_role"),
    path("dealership/", DealershipListCreateAPIView.as_view(), name="dealership_list_create"),
    path("dealership/<int:pk>/", DealershipRetrieveUpdateDestroyAPIView.as_view(), name="dealership_retrieve_update_destroy"),
    path("admin/inactive-dealership/", InactiveDealershipListAPIView.as_view(), name="inactive_dealership_list"),
    path("admin/inactive-dealership/<int:pk>/delete/", DeleteInactiveDealershipAPIView.as_view(), name="delete_inactive_dealership"),
    path("dealer-locations/", DealershipLocationListCreateAPIView.as_view(), name="dealer_location_list_create"),
]
