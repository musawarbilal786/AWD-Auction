from django.db.models import Q
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.settings import api_settings
from rest_framework.response import Response

from arbitration.api.v1.serializers import ArbitrationTicketSerializer, CreateArbitrationTicketSerializer, \
    TicketSerializer, TicketStatusSerializer, TicketTypesSerializer, TicketStatusDetailSerializer, \
    TicketTypeDetailSerializer, RestoreInactiveTicketStatusSerializer, RestoreInactiveTicketTypeSerializer
from arbitration.models import Ticket, TicketArbitrationData, TicketAttachment, TicketComment, TicketStatus, TicketTypes
from auctions.permissions import IsBuyerUserPermission
from inspections.models import InspectionRequest
from users.permissions import IsAdminUserPermission
from utils.cloudinary import upload_file


class ArbitrationTicketCreateAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]

    def post(self, request):
        with transaction.atomic():
            buyer_user = self.request.user
            buyer_dealer_id = buyer_user.dealer

            serializer = CreateArbitrationTicketSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            auction_id = serializer.validated_data.get("auction_id")
            issues = serializer.validated_data.get("issues")

            inspection_request = get_object_or_404(InspectionRequest, Q(auction_id=auction_id))

            ticket_type, type_created = TicketTypes.objects.get_or_create(
                name="Arbitration",
                defaults={
                    "is_default": "Yes"
                }
            )

            ticket_status, status_created = TicketStatus.objects.get_or_create(
                name="New",
                defaults={
                    "color": "red",
                    "is_default": "Yes",
                    "ticket_type": ticket_type,
                    "type_can_be_change": "Yes"
                }
            )

            # Create the ticket
            ticket = Ticket.objects.create(
                auction_id=auction_id,
                name=buyer_dealer_id.dealership_name,
                email=buyer_user.email,
                buyer_id=buyer_dealer_id,
                seller_id=inspection_request.dealer,
                subject="Arbitration Request",
                message=issues,
                status=ticket_status,
                openedby=buyer_user.id,
                created_by=buyer_user,
                category_id=ticket_type
            )

            # Create the ticket arbitration data
            ticket_arbitration = TicketArbitrationData.objects.create(
                ticket_id=ticket,
                created_by=buyer_user
            )

            # Create ticket comment
            ticket_comment = TicketComment.objects.create(
                ticket_id=ticket,
                comment=issues,
                created_by=buyer_user
            )

            # Update inspection request
            inspection_request.arbitration_ticket_id = ticket_arbitration
            inspection_request.arbitration_taken = 1
            inspection_request.arbitration_claim_requested = 1
            inspection_request.save()

            # Handling file uploads and attachments
            ticket_attachments = []
            attachments_list = []

            print("attachment file", request.FILES.getlist('attachments'))


            for file in request.FILES.getlist('attachments'):
                url = upload_file(file, f"arbitration/{auction_id}/attachments")

                ticket_attachments.append(
                    TicketAttachment(
                        ticket_id=ticket,
                        arbitration_id=ticket_arbitration,
                        comment_id=ticket_comment,
                        file_from_type=0,
                        storage=1,
                        file_url=url,
                        created_by=buyer_user
                    )
                )
                attachments_list.append(url)

            # Bulk create attachments
            if ticket_attachments:
                TicketAttachment.objects.bulk_create(ticket_attachments)

            return Response({"response": "Arbitration ticket created successfully"}, status=status.HTTP_200_OK)


class TicketListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()


class TicketDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()


class TicketStatusListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketStatusSerializer
    queryset = TicketStatus.objects.filter(is_active=True)


class TicketStatusDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketStatusDetailSerializer
    queryset = TicketStatus.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class InactiveTicketStatusListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketStatusSerializer
    queryset = TicketStatus.objects.filter(is_active=False)


class DeleteInactiveTicketStatusAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RestoreInactiveTicketStatusSerializer
    queryset = TicketStatus.objects.filter(is_active=False)


class TicketTypeListCreateAPIView(ListCreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketTypesSerializer
    queryset = TicketTypes.objects.filter(is_active=True)


class TicketTypeDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketTypeDetailSerializer
    queryset = TicketTypes.objects.filter(is_active=True)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class InactiveTicketTypeListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = TicketTypesSerializer
    queryset = TicketTypes.objects.filter(is_active=False)


class DeleteInactiveTicketTypeAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = RestoreInactiveTicketTypeSerializer
    queryset = TicketTypes.objects.filter(is_active=False)
