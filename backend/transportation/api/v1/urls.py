from django.urls import path

from transportation.api.v1.views import (
    TransportationsListAPIView,
    TransporterListCreateAPIView,
    TransporterRetrieveUpdateDestroyAPIView,
    TransportationJobsListAPIView,
    TransportationChargesSlabListCreateAPIView,
    TransportationChargesSlabListAPIView,
    TransporterChargesSlabRetrieveUpdateDestroyAPIView,
    InactiveTransportationChargesSlabListAPIView,
    UpdateInactiveTransportationChargesSlabAPIView,
    TransportationJobCreateAPIView,
    TransportationUpdateJobTrackingStatusAPIView,
    TransporterNewJobsListAPIView,
    TransporterAcceptedJobsListAPIView,
    TransporterCompletedJobsListAPIView,
    TransporterAcceptJobAPIView, TransportationAcceptedJobRetrieveUpdateDestroyAPIView,
)


urlpatterns = [
    path("list/", TransportationsListAPIView.as_view(), name="transportation_list"),
    path("transporter/", TransporterListCreateAPIView.as_view(), name="transporter_list_create"),
    path("transporter/<int:pk>/", TransporterRetrieveUpdateDestroyAPIView.as_view(), name="transporter_detail"),
    path("jobs/", TransportationJobsListAPIView.as_view(), name="transportation_jobs_list"),
    path("dealer-charges-slab/", TransportationChargesSlabListAPIView.as_view(), name="transportation_charges_slab_list"),
    path("charges-slab/", TransportationChargesSlabListCreateAPIView.as_view(), name="transportation_slab_list_create"),
    path("charges-slab/<int:pk>/", TransporterChargesSlabRetrieveUpdateDestroyAPIView.as_view(), name="transportation_slab_detail"),
    path("inactive-charges-slab/", InactiveTransportationChargesSlabListAPIView.as_view(), name="inactive_charges_slab_list"),
    path("inactive-charges-slab/<int:pk>/", UpdateInactiveTransportationChargesSlabAPIView.as_view(),name="update_inactive_charges_slab"),
    path("new-jobs/", TransporterNewJobsListAPIView.as_view(), name="transporter_new_jobs"),
    path("accepted-jobs/", TransporterAcceptedJobsListAPIView.as_view(), name="transportation_accepted_jobs"),
    path("accepted-jobs/<int:pk>/", TransportationAcceptedJobRetrieveUpdateDestroyAPIView.as_view(), name="transportation_accepted_job_detail"),
    path("completed-jobs/", TransporterCompletedJobsListAPIView.as_view(), name="transportation_completed_jobs"),
    path("accept-job/", TransporterAcceptJobAPIView.as_view(), name="transportation_accept_job"),
    path("create-jobs/", TransportationJobCreateAPIView.as_view(), name="transportation_create_jobs"),
    path("job/<int:pk>/", TransportationUpdateJobTrackingStatusAPIView.as_view(), name="transportation_job_update_tracking"),
]
