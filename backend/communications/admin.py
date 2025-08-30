from django.contrib import admin

from communications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
    )
