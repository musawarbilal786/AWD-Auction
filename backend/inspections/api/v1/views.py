import datetime
import json
from collections import defaultdict

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.settings import api_settings
from rest_framework.response import Response

from auctions.permissions import IsBuyerUserPermission
from communications.choices import PriorityChoices
from communications.models import Notification
from users.models import User
from users.permissions import IsAdminUserPermission, IsInspectorPermission
from inspections.permissions import IsSellerUserPermission
from inspections.models import InspectionRequest, Inspector, VehicleInspectionReport, CarAttributes
from inspections.api.v1.serializers import InspectionRequestSerializer, InspectionAssignCarAttributesSerializer, \
    InspectorSerializer, AssignInspectorSerializer, InspectionUpdateSerializer, VehicleInspectionSerializer, \
    VehicleInspectionDetailSerializer, MarkInspectionRequestCompleteSerializer, SpecialityVehicleApproveSerializer, \
    InspectionRequestUpdateSerializer, ManualDeliveredSerializer
from auctions.models import Auctions
from auctions.api.v1.serializers import SendToAuctionSerializer
from utils.cloudinary import upload_file


class InspectionRequestListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        return InspectionRequest.objects.filter(dealer__users=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        admin_user = User.objects.filter(role__name="SUPER_ADMIN").first()

        instance = serializer.save()

        if instance.has_red or instance.title_branded:
            instance.has_green = False
        
        if instance.mechanical_issue == 1 or instance.frame_damage == 1 or instance.factory_emissions_modified == 1 or instance.driveability_issue == 1:
            instance.has_yellow = True

        if instance.title_absent:
            instance.has_blue = True

        Notification.objects.create(
            title="Inspection Request Created",
            text=f"A new inspection request with request id {instance.id} has been created by user {user.email}",
            priority=PriorityChoices.HIGH,
            user=admin_user
        )

        instance.save()


class InspectionRequestAdminListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        queryset = InspectionRequest.objects.filter(dealer__is_active=True)
        status = self.request.query_params.get("status")

        if status == "Requests":
            queryset = queryset.filter(status__in=[0,1])
        elif status == "Pending":
            queryset = queryset.filter(status__in=[2,3])
        elif status == "Approved":
            queryset = queryset.filter(status=4, inspection_status=1)
        elif status == "Denied":
            queryset = queryset.filter(status=4, inspection_status=0)

        return queryset


class InspectionRequestDetailAPIView(RetrieveUpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    queryset = InspectionRequest.objects.filter(dealer__is_active=True)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return InspectionRequestSerializer
        return InspectionRequestUpdateSerializer


class InspectionAssignCarAttributesAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectionAssignCarAttributesSerializer
    queryset = InspectionRequest.objects.filter(dealer__is_active=True)

    def perform_update(self, serializer):
        instance = serializer.save()

        car_attributes = []

        car_fields = [
            ('year', instance.year),
            ('make', instance.make),
            ('model', instance.model),
            ('trim', instance.trim),
            ('series', instance.series),
            ('cylinders', instance.cylinders),
            ('transmission', instance.transmission),
            ('drivetrain', instance.drivetrain),
            ('rough', instance.rough),
            ('average', instance.average),
            ('clean', instance.clean),
        ]

        for field, value in car_fields:
            if value:
                if not CarAttributes.objects.filter(key=field, value=value).exists():
                    car_attributes.append(CarAttributes(
                        key=field,
                        value=value
                    ))

        if car_attributes:
            CarAttributes.objects.bulk_create(car_attributes)


class InspectorListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectorSerializer
    queryset = Inspector.objects.all()


class InspectorRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectionUpdateSerializer
    queryset = Inspector.objects.all()


class AssignInspectorAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = AssignInspectorSerializer
    queryset = InspectionRequest.objects.filter(dealer__is_active=True)

    def perform_update(self, serializer):
        instance = serializer.save(status=2)

        Notification.objects.create(
            title="Inspector Assigned",
            text=f"You have been assigned as an inspector for inspection request with id {instance.id}",
            priority=PriorityChoices.MEDIUM,
            user=instance.inspector_assigned.user
        )

        super().perform_update(serializer)


class UnAssignInspectorAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    queryset = InspectionRequest.objects.filter(dealer__is_active=True)
    serializer_class = AssignInspectorSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.inspector_assigned = None
        instance.status = 0
        instance.save()

        return Response({"detail": "Inspector unassigned successfully."}, status=status.HTTP_200_OK)



class InspectorAssignedTasksListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsInspectorPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        return InspectionRequest.objects.filter(inspector_assigned__in=self.request.user.inspector.all(), dealer__is_active=True)


class InspectorTaskRetrieveAPIView(RetrieveAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsInspectorPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        return InspectionRequest.objects.filter(inspector_assigned__in=self.request.user.inspector.all())


class InspectionReportDetailAPIView(RetrieveAPIView):
    serializer_class = VehicleInspectionDetailSerializer
    queryset = VehicleInspectionReport.objects.all()


class InspectionReportAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsInspectorPermission]

    def get(self, request, pk):
        inspection_report = VehicleInspectionReport.objects.filter(request_id=pk).first()

        if not inspection_report:
            return Response({"error": "Inspection Report not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(VehicleInspectionDetailSerializer(inspection_report).data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        inspector = request.user.inspector.first()
        inspection_request = InspectionRequest.objects.get(id=pk)
        dealer_id = inspection_request.dealer

        data = request.data.copy()
        json_fields = [
            'exterior', 'interior', 'mechanical', 'wheels',
            'warning_lights', 'frame', 'drivability'
        ]
        new_parsed_data = {}

        for field in json_fields:
            value = data.get(field)
            if value:
                try:
                    if isinstance(value, list):
                        value = value[0]

                    new_parsed_data[field] = json.loads(value)
                except json.JSONDecodeError:
                    return Response({field: 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = VehicleInspectionSerializer(data=new_parsed_data, context={'request': request, 'view': self})

        if serializer.is_valid(raise_exception=True):
            data = serializer.validated_data
            # Todo later
            # auction_id = inspection_request.auction_id
            try:
                report = VehicleInspectionReport.objects.get(request_id=inspection_request)
                is_update = True
            except VehicleInspectionReport.DoesNotExist:
                report = VehicleInspectionReport()
                is_update = False

            # Sections to populate
            sections = ["exterior", "interior", "mechanical", "wheels", "warning_lights", "frame", "drivability"]
            images_dict = {
                "exterior": {},
                "interior": {},
                "mechanical": {},
                "wheels": {},
                "warning_lights": {},
                "demage_and_rust": {}
            }

            # Upload each FILE field by its prefix
            for name, file in request.FILES.items():
                for section in images_dict:
                    if name.startswith(section):
                        url = upload_file(file, f"auctions/{inspection_request}/{section}")
                        images_dict[section][name] = url

            # Upload demage and rust files
            demage_images = []
            for file in request.FILES.getlist('demage_files'):
                url = upload_file(file, f"auctions/{inspection_request}/demages")
                demage_images.append(url)

            rust_images = []
            for file in request.FILES.getlist('rust_files'):
                url = upload_file(file, f"auctions/{inspection_request}/demages")
                rust_images.append(url)

            # Upload obdii files
            obdii_images = []
            for file in request.FILES.getlist('obdii_files'):
                url = upload_file(file, f"auctions/{inspection_request}/obdii")
                obdii_images.append(url)

            # Prepare structured JSON fields
            exterior = data.get("exterior") or {}
            interior = data.get("interior") or {}
            mechanical = data.get("mechanical") or {}
            wheels = data.get("wheels") or {}
            warning_lights = data.get("warning_lights") or {}
            frame = data.get("frame") or {}
            drivability = data.get("drivability") or {}

            exterior["images"] = images_dict.get("exterior") if images_dict.get("exterior") else None
            interior["images"] = images_dict.get("interior") if images_dict.get("interior") else None
            mechanical["images"] = images_dict.get("mechanical") if images_dict.get("mechanical") else None
            wheels["images"] = images_dict.get("wheels") if images_dict.get("wheels") else None
            warning_lights["images"] = {"obdii_files": obdii_images, **images_dict.get("warning_lights")}
            demage_and_rust = {
                "demage_notes": data.get("demage_notes", ""),
                "rust_notes": data.get("rust_notes", ""),
                "images": {
                    "demage_files": demage_images,
                    "rust_files": rust_images
                }
            }

            report.request_id = inspection_request
            report.dealer_id = dealer_id
            report.inspector_id = inspector
            report.exterior = json.dumps(exterior)
            report.interior = json.dumps(interior)
            report.mechanical = json.dumps(mechanical)
            report.demage_and_rust = json.dumps(demage_and_rust)
            report.wheels = json.dumps(wheels)
            report.warning_lights = json.dumps(warning_lights)
            report.frame = json.dumps(frame)
            report.drivability = json.dumps(drivability)
            report.yellow = int(data.get("yellow", False))
            report.red = int(data.get("red", False))
            report.green = int(data.get("green", False))
            report.purple = int(inspection_request.title_absent == 1)

            if not is_update:
                report.created_by = self.request.user
                report.created_at = datetime.datetime.now()
            else:
                report.updated_by = self.request.user
                report.updated_at = datetime.datetime.now()

            report.save()

            inspection_request.status = 3
            inspection_request.inspection_status = 1
            inspection_request.inspected_date = datetime.datetime.now()
            inspection_request.save()

            return Response({"success": True, "message": "Inspection submitted!"})
        else:
            return Response(serializer.errors, status=400)


class MarkCompleteInspectionReportAPIView(RetrieveUpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsInspectorPermission]
    serializer_class = MarkInspectionRequestCompleteSerializer
    lookup_field = "pk"

    def get_object(self):
        return get_object_or_404(InspectionRequest, Q(id=self.kwargs.get("pk"), inspector_assigned=self.request.user.inspector.first()))

    def perform_update(self, serializer):
        instance = serializer.save(status=4)
        dealer_user = instance.dealer.users.first()

        Notification.objects.create(
            title="Inspection Report Generated",
            text=f"Inspection report has been generated by inspector for inspection request with id {instance.id}. Now you can send your vehicle to Auction",
            priority=PriorityChoices.MEDIUM,
            user=dealer_user
        )

        super().perform_update(serializer)


class SpecialityVehicleRequestListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        return InspectionRequest.objects.filter(status=1, dealer__is_active=True)


class SpecialityVehicleApproveAPIView(RetrieveUpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return InspectionRequestSerializer
        return SpecialityVehicleApproveSerializer

    def get_object(self):
        return get_object_or_404(InspectionRequest, Q(id=self.kwargs.get("pk")), status=1)

    def perform_update(self, serializer):
        instance = serializer.save(status=0)

        super().perform_update(serializer)


class SendToAuctionAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]
    serializer_class = SendToAuctionSerializer
    queryset = Auctions.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        admin_user = User.objects.filter(role__name="SUPER_ADMIN").first()

        Notification.objects.create(
            title="Vehicle Sent To Auction",
            text=f"Vehicle with Auction id {instance.auction_id} has been sent to auction and added in the Run List.",
            priority=PriorityChoices.LOW,
            user=admin_user
        )

class CarAttributesListAPIView(APIView):
    def get(self, request, *args, **kwargs):
        car_attributes_dict = defaultdict(list)

        car_attributes = CarAttributes.objects.all()

        for attribute in car_attributes:
            if attribute.value not in car_attributes_dict[attribute.key]:
                car_attributes_dict[attribute.key].append(attribute.value)

        car_attributes_dict = dict(car_attributes_dict)

        return Response(car_attributes_dict, status=status.HTTP_200_OK)


class UpdateManualDeliveredAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = ManualDeliveredSerializer

    def get_object(self):
        buyer = self.request.user.dealer

        return get_object_or_404(InspectionRequest, Q(buyer_id=buyer, is_sold=1, status__gte=6))
