from django.urls import path

from arbitration.api.v1.views import ArbitrationTicketCreateAPIView, TicketListAPIView, TicketStatusListCreateAPIView, \
    TicketTypeListCreateAPIView, TicketStatusDetailAPIView, TicketTypeDetailAPIView, InactiveTicketStatusListAPIView, \
    InactiveTicketTypeListAPIView, DeleteInactiveTicketStatusAPIView, DeleteInactiveTicketTypeAPIView, TicketDetailAPIView

urlpatterns = [
    path("request/", ArbitrationTicketCreateAPIView.as_view(), name="create_arbitration_request"),
    path("tickets/", TicketListAPIView.as_view(), name="tickets_list"),
    path("tickets/<int:pk>/", TicketDetailAPIView.as_view(), name="ticket_detail"),
    path("ticket-status/", TicketStatusListCreateAPIView.as_view(), name="ticket_status_list_create"),
    path("ticket-status/<int:pk>/", TicketStatusDetailAPIView.as_view(), name="ticket_status_detail"),
    path("inactive-ticket-status/", InactiveTicketStatusListAPIView.as_view(), name="inactive_ticket_status_list"),
    path("inactive-ticket-status/<int:pk>/", DeleteInactiveTicketStatusAPIView.as_view(), name="delete_inactive_ticket_status"),
    path("ticket-type/", TicketTypeListCreateAPIView.as_view(), name="ticket_type_list_create"),
    path("ticket-type/<int:pk>/", TicketTypeDetailAPIView.as_view(), name="ticket_type_detail"),
    path("inactive-ticket-type/", InactiveTicketTypeListAPIView.as_view(), name="inactive_ticket_type_list"),
    path("inactive-ticket-type/<int:pk>/", DeleteInactiveTicketTypeAPIView.as_view(), name="delete_inactive_ticket_type"),
]