from rest_framework.generics import ListAPIView
from communications.models import Notification
from communications.api.v1.serializers import NotificationSerializer

class NotificationListAPIView(ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        notifications = Notification.objects.filter(user=self.request.user).order_by('-created_at')

        Notification.objects.filter(user=self.request.user).update(is_read=True)

        return notifications
