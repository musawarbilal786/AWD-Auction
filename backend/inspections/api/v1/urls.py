from django.urls import path

from inspections.api.v1.views import InspectionRequestListCreateAPIView, InspectionRequestAdminListAPIView, \
    InspectionRequestDetailAPIView, InspectionAssignCarAttributesAPIView, InspectorListCreateAPIView, \
    AssignInspectorAPIView, InspectorRetrieveUpdateAPIView, InspectorAssignedTasksListAPIView, InspectionReportAPIView, \
    InspectorTaskRetrieveAPIView, MarkCompleteInspectionReportAPIView, SpecialityVehicleRequestListAPIView, \
    SpecialityVehicleApproveAPIView, SendToAuctionAPIView, UnAssignInspectorAPIView, InspectionReportDetailAPIView, \
    CarAttributesListAPIView, UpdateManualDeliveredAPIView

urlpatterns = [
    path("requests/", InspectionRequestListCreateAPIView.as_view(), name="inspection_request_list_create"),
    path("admin-requests/", InspectionRequestAdminListAPIView.as_view(), name="admin_inspection_request_list"),
    path("requests/<int:pk>/", InspectionRequestDetailAPIView.as_view(), name="inspection_request_detail"),
    path("assign-car-attributes/<int:pk>/", InspectionAssignCarAttributesAPIView.as_view(), name="inspection_assign_car_attributes"),
    path("inspectors/", InspectorListCreateAPIView.as_view(), name="inspector_list_create"),
    path("inspector/<int:pk>/", InspectorRetrieveUpdateAPIView.as_view(), name="inspector_update_detail"),
    path("request/<int:pk>/assign-inspector/", AssignInspectorAPIView.as_view(), name="assign_inspector"),
    path("request/<int:pk>/unassign-inspector/", UnAssignInspectorAPIView.as_view(), name="unassign_inspector"),
    path("inspector-tasks/", InspectorAssignedTasksListAPIView.as_view(), name="inspector_assigned_tasks_list"),
    path("inspector-task/<int:pk>/", InspectorTaskRetrieveAPIView.as_view(), name="inspector_task_retrieve"),
    path("inspection-report/<int:pk>/", InspectionReportAPIView.as_view(), name="inspection_report"),
    path("admin/inspection-report/<int:pk>/", InspectionReportDetailAPIView.as_view(), name="admin_inspection_report"),
    path("inspection-report/<int:pk>/mark-complete/", MarkCompleteInspectionReportAPIView.as_view(), name="mark_complete_inspection_report"),
    path("speciality-vehicle/requests/", SpecialityVehicleRequestListAPIView.as_view(), name="speciality_vehicle_requests"),
    path("speciality-vehicle/<int:pk>/approve/", SpecialityVehicleApproveAPIView.as_view(), name="speciality_vehicle_approve"),
    path("send-to-auctions/", SendToAuctionAPIView.as_view(), name="send_to_auctions"),
    path("car-attributes/", CarAttributesListAPIView.as_view(), name="car_attributes_list"),
    path("<int:pk>/manual-delivered/", UpdateManualDeliveredAPIView.as_view(), name="update_manual_delivered"),
]