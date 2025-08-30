from django.contrib import admin

from arbitration.models import TicketArbitrationData, Ticket, TicketAttachment, TicketComment, TicketTypes, TicketStatus


@admin.register(TicketArbitrationData)
class TicketArbitrationDataAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TicketTypes)
class TicketTypesAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )


@admin.register(TicketStatus)
class TicketStatusAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )