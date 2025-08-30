from django.contrib import admin

from users.models import User, Role, Dealership, Transporter, DealerLocation


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "email"
    )

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
    )

@admin.register(Dealership)
class DealershipAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "dealership_name",
        "dealership_type",
    )

@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "business_name",
    )


@admin.register(DealerLocation)
class DealerLocationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "address",
        "zip",
        "email",
        "phone",
    )
    raw_id_fields = ("city", "state", "dealership", "user", "created_by", "updated_by",)