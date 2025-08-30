import uuid

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.settings import api_settings
from rest_framework.response import Response

from auctions.api.v1.serializers import AuctionWonSerializer
from auctions.models import AuctionWon
from auctions.permissions import IsBuyerUserPermission
from inspections.models import InspectionRequest
from transportation.api.v1.serializers import TransporterCreateSerializer, TransporterUpdateSerializer, \
    TransportationJobSerializer, TransportationChargesSlabSerializer, \
    RestoreInactiveTransportationChargesSlabSerializer, TransporterAcceptJobSerializer, TransporterJobCreateSerializer, \
    UpdateTrackingStatusSerializer
from transportation.models import TransportationJob, TransportationChargesSlab, TransportationJobTracking
from transportation.permissions import IsTransporterPermission
from transportation.tasks import send_transportation_job_accepted, send_transportation_job_completed, \
    send_transportation_job_buyer_gate_key_email, send_transportation_job_seller_gate_key_email
from users.api.v1.serializers import TransporterSerializer
from users.models import Dealership, Transporter
from users.permissions import IsDealerPermission, IsAdminUserPermission


class TransportationsListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsDealerPermission]

    def get(self, request):
        active = request.query_params.get('active', '')

        user = request.user
        try:
            dealer = Dealership.objects.get(id=user.dealer_id)
        except Dealership.DoesNotExist:
            return Response({"error": "Dealer not found"}, status=404)

        queryset = AuctionWon.objects.filter(
            Q(buyer_id=dealer.id) | Q(request_id__dealer_id=dealer.id),
            request_id__is_sold=True,
            request_id__transportation_taken=True
        ).order_by('-id')


        if active == "delivered":
            queryset = queryset.filter(request_id__status=8)
        elif active == "active":
            queryset = queryset.exclude(request_id__status=8)

        serializer = AuctionWonSerializer(queryset, many=True)

        return Response({
            "results": serializer.data
        })


class TransporterListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    queryset = Transporter.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TransporterSerializer

        return TransporterCreateSerializer


class TransporterRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    queryset = Transporter.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TransporterSerializer

        return TransporterUpdateSerializer


class TransportationJobsListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TransportationJobSerializer

    def get_queryset(self):
        queryset = []

        if self.request.query_params.get("status") == "UnPicked":
            queryset = TransportationJob.objects.filter(transporter_id__isnull=True, status=0).order_by('-id')
        elif self.request.query_params.get("status") == "Accepted":
            queryset = TransportationJob.objects.filter(tracking_status__lte=5, status=1).order_by('-id')
        elif self.request.query_params.get("status") == "Ended":
            queryset = TransportationJob.objects.filter(tracking_status=6).order_by('-id')

        return queryset


class TransportationChargesSlabListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TransportationChargesSlabSerializer
    queryset = TransportationChargesSlab.objects.filter(is_active=True)


class TransportationChargesSlabListAPIView(ListAPIView):
    serializer_class = TransportationChargesSlabSerializer
    queryset = TransportationChargesSlab.objects.filter(is_active=True)


class TransporterChargesSlabRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TransportationChargesSlabSerializer
    queryset = TransportationChargesSlab.objects.filter(is_active=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({"detail": "Transportation Slab deactivated successfully."}, status=status.HTTP_204_NO_CONTENT)


class InactiveTransportationChargesSlabListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TransportationChargesSlabSerializer
    queryset = TransportationChargesSlab.objects.filter(is_active=False)


class UpdateInactiveTransportationChargesSlabAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RestoreInactiveTransportationChargesSlabSerializer
    queryset = TransportationChargesSlab.objects.filter(is_active=False)


class TransporterNewJobsListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsTransporterPermission]
    serializer_class = TransportationJobSerializer
    queryset = TransportationJob.objects.filter(transporter_id__isnull=True, status=0)


class TransporterAcceptedJobsListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsTransporterPermission]
    serializer_class = TransportationJobSerializer

    def get_queryset(self):
        return TransportationJob.objects.filter(tracking_status__lte=5, status=1, transporter_id__user=self.request.user)


class TransportationAcceptedJobRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsTransporterPermission]
    serializer_class = TransportationJobSerializer

    def get_object(self):
        return get_object_or_404(TransportationJob,Q(id=self.kwargs.get("pk"), tracking_status__lte=5, status=1, transporter_id__user=self.request.user))

class TransporterCompletedJobsListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsTransporterPermission]
    serializer_class = TransportationJobSerializer

    def get_queryset(self):
        return TransportationJob.objects.filter(tracking_status=6, transporter_id__user=self.request.user)


class TransporterAcceptJobAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsTransporterPermission]

    def post(self, request, *args, **kwargs):
        transporter = request.user.transporter

        serializer = TransporterAcceptJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transporter_job = serializer.validated_data.get("job_id")
        transporter_job.transporter_id = transporter
        transporter_job.status = 1
        transporter_job.buyer_dual_gate_key = str(uuid.uuid4().int)[:10]
        transporter_job.seller_dual_gate_key = str(uuid.uuid4().int)[:10]
        transporter_job.save()

        buyer_user = transporter_job.buyer_id.users.first()
        seller_user = transporter_job.dealer_id.users.first()

        send_transportation_job_accepted(request.user, transporter_job, transporter_job.auction_id)
        send_transportation_job_buyer_gate_key_email(buyer_user, transporter_job, transporter_job.auction_id)
        send_transportation_job_seller_gate_key_email(seller_user, transporter_job, transporter_job.auction_id)

        return Response({"response": "Job assigned successfully"}, status=status.HTTP_200_OK)


class TransportationJobCreateAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = TransporterJobCreateSerializer
    queryset = TransportationJob.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        instance = serializer.save()

        inspection_request = InspectionRequest.objects.get(auction_id=instance.auction_id)

        inspection_request.transportation_taken = 1
        inspection_request.transport_job_id = instance
        inspection_request.save()

        TransportationJobTracking.objects.create(
            auction_id=inspection_request.auction_id,
            request_id=inspection_request,
            job_id=instance,
            status=0,
            created_by=user.id
        )

        if instance.distance:
            distance = instance.distance.split(" ")
            distance_value = float(distance[0])
            distance_unit = distance[1]

            if distance_unit == "m":
                distance_value = distance_value / 1000
                distance_unit = "km"

            transportation_slab = TransportationChargesSlab.objects.filter(
                km_range_start__lte=distance_value,
                km_range_end__gte=distance_value,
                is_active=True,

            ).order_by('km_range_start').first()

            if transportation_slab:
                print("distance value", distance_value)
                print("charges per km", transportation_slab.transporter_charges_per_km)

                total_transport_charges = distance_value * float(transportation_slab.transporter_charges_per_km)

                instance.transportation_slab_id = transportation_slab
                instance.charges_per_mile = transportation_slab.transporter_charges_per_km
                instance.transport_charges = round(total_transport_charges, 2)

                instance.save()


class TransportationUpdateJobTrackingStatusAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsTransporterPermission]

    def get_object(self):
        transporter = self.request.user.transporter

        return get_object_or_404(TransportationJob, Q(status=1, transporter_id=transporter))

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TransportationJobSerializer

        return UpdateTrackingStatusSerializer

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.save()
        tracking_status = instance.tracking_status
        inspection_request = instance.request_id

        if tracking_status == 6:
            # Retrieve the transporter
            # transporter = Transporter.objects.filter(id=transport_job.transporter_id.id).first()
            # transport_charges = transport_job.transport_charges

            # Update InspectionRequest status
            inspection_request.status = 7
            inspection_request.save()

            send_transportation_job_completed(user, inspection_request.auction_id)

        # Update or create tracking entry
        if not TransportationJobTracking.objects.filter(job_id=instance, status=tracking_status).exists():
            TransportationJobTracking.objects.create(
                auction_id=instance.auction_id,
                request_id=inspection_request,
                job_id=instance,
                status=tracking_status,
                created_by=user
            )
