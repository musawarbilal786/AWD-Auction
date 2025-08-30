from django.contrib import admin

from inspections.models import InspectionRequest, Inspector, InspectorWorkingDay, VehicleInspectionReport, CarAttributes


@admin.register(InspectionRequest)
class InspectionRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "vin",
        "odometer",
    )
    raw_id_fields = ("dealer", "inspection_location", "created_by", "updated_by",)


@admin.register(Inspector)
class InspectorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "email",
    )
    raw_id_fields = ("user", "created_by", "updated_by",)


@admin.register(InspectorWorkingDay)
class InspectorWorkingDayAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "day",
    )

@admin.register(VehicleInspectionReport)
class VehicleInspectionRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )

@admin.register(CarAttributes)
class CarAttributesAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )
