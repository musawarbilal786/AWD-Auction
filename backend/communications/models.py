from django.db import models

from communications.choices import PriorityChoices


class Notification(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255)
    text = models.CharField(max_length=500)
    priority = models.CharField(
        max_length=6,
        choices=PriorityChoices.choices,
        default=PriorityChoices.LOW,
    )
    is_read = models.BooleanField(default=False)
    user = models.ForeignKey("users.User", related_name="notifications", on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title
