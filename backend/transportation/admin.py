from django.contrib import admin

from transportation.models import TransportationJob, TransportationJobTracking, TransporterDocument, TransportationChargesSlab, TransportationJobTrackingStatusMsg

@admin.register(TransportationJob)
class TransportationJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TransporterDocument)
class TransportationDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TransportationJobTracking)
class TransportationJobTrackingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TransportationChargesSlab)
class TransportationChargesSlabAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )
