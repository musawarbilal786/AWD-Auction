from django.urls import path

from communications.api.v1.views import NotificationListAPIView

urlpatterns = [
    path("notifications/", NotificationListAPIView.as_view(), name="notifications_list"),
]
