import os
import uuid
from os import write

from django.conf import settings
from rest_framework import serializers

from auctions.models import AuctionWon
from inspections.api.v1.serializers import InspectionRequestSerializer
from inspections.models import InspectionRequest, VehicleInspectionReport
from transportation.models import TransportationJob, TransporterDocument, TransportationJobTracking, \
    TransportationJobTrackingStatusMsg, TransportationChargesSlab
from users.api.v1.serializers import DealershipSerializer, DealerLocationSerializer, TransporterSerializer, \
    UserSerializer, RoleSerializer
from users.models import Transporter, User, Role, DealerLocation
from utils.api.v1.serializers import CitySerializer, StateSerializer
from utils.google_maps import calculate_distance
from utils.models import State, City


class TransportationJobTrackingStatusMsgSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportationJobTrackingStatusMsg
        fields = '__all__'


class TransportationChargesSlabSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportationChargesSlab
        fields = "__all__"


class TransportationJobSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    inspection_reports = serializers.SerializerMethodField()
    dealer_id = DealershipSerializer(read_only=True)
    auction_id = serializers.CharField(max_length=255, allow_blank=True, required=False)
    buyer_id = DealershipSerializer(read_only=True)
    transporter_id = TransporterSerializer(read_only=True)
    pickup_location = DealerLocationSerializer(read_only=True)
    drop_location = DealerLocationSerializer(read_only=True)
    transportation_slab_id = TransportationChargesSlabSerializer(read_only=True)

    class Meta:
        model = TransportationJob
        fields = [
            'id',
            'request_id',
            'dealer_id',
            'auction_id',
            'buyer_id',
            'transporter_id',
            'pickup_location',
            'drop_location',
            'distance',
            'charges_per_mile',
            'transport_charges',
            'transportation_slab_id',
            'buyer_dual_gate_key',
            'seller_dual_gate_key',
            'pickup_type',
            'pickup_time',
            'drop_time',
            'status',
            'tracking_status',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
            'deleted_at',
            'inspection_reports'
        ]

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None

class TransportationJobTrackingSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    job_id = TransportationJobSerializer(read_only=True)

    class Meta:
        model = TransportationJobTracking
        fields = '__all__'


class TransporterDocumentSerializer(serializers.ModelSerializer):
    transporter_id = TransporterSerializer(read_only=True)

    class Meta:
        model = TransporterDocument
        fields = '__all__'


class TransporterCreateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=255, required=True)
    last_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    approved = serializers.IntegerField(required=True)
    website = serializers.CharField(max_length=255)
    commercial_driver_license = serializers.FileField(required=True, write_only=True)
    business_license = serializers.FileField(write_only=True)
    proof_of_insurance = serializers.FileField(write_only=True)
    motor_carrier = serializers.FileField(write_only=True)
    city_name = serializers.CharField(max_length=255, write_only=True)
    city = CitySerializer(read_only=True)
    state= serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), write_only=True)
    state_detail = StateSerializer(read_only=True)
    zipcode = serializers.CharField(max_length=255, required=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)

    class Meta:
        model = Transporter
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "business_name",
            "street_name",
            "zipcode",
            "city_name",
            "city",
            "state",
            "state_detail",
            "website",
            "phone_number",
            "ext",
            "cell_number",
            "approved",
            "status",
            "commercial_driver_license",
            "business_license",
            "proof_of_insurance",
            "motor_carrier",
            "created_by",
            "updated_by",
        )

    def validate(self, attrs):
            users_email = User.objects.values_list("email", flat=True).distinct()

            if attrs["email"] in users_email:
                raise serializers.ValidationError({"error": "Email already exists"})

            return attrs

    def create(self, validated_data):
            commercial_driver_license = validated_data.pop("commercial_driver_license", None)
            business_license = validated_data.pop("business_license", None)
            proof_of_insurance = validated_data.pop("proof_of_insurance", None)
            motor_carrier = validated_data.pop("motor_carrier", None)
            city_name = validated_data.pop("city_name")

            role, created = Role.objects.get_or_create(name="TRANSPORTER", defaults={"status": 1})
            city, created = City.objects.get_or_create(name=city_name, defaults={"status": 1})

            transporter = Transporter.objects.create(
                first_name=validated_data.get("first_name"),
                last_name=validated_data.get("last_name"),
                email=validated_data.get("email"),
                business_name=validated_data.get("business_name"),
                street_name=validated_data.get("street_name"),
                phone_number=validated_data.get("phone_number"),
                ext=validated_data.get("ext"),
                cell_number=validated_data.get("cell_number"),
                approved=validated_data.get("approved"),
                city=city,
                state=validated_data.get("state"),
                zipcode=validated_data.get("zipcode"),
                website=validated_data.get("website"),
            )

            # Create the associated user
            user = User.objects.create(
                first_name=validated_data.get("first_name"),
                last_name=validated_data.get("last_name"),
                email=validated_data.get("email"),
                mobile_no=validated_data.get("cell_number"),
                role=role,
                is_staff=0,
                is_transporter=1,
                transporter=transporter
            )

            transporter.user_id = user.id
            transporter.save()

            documents = {
                'commercial_driver_license': commercial_driver_license,
                'business_license': business_license,
                'proof_of_insurance': proof_of_insurance,
                'motor_carrier': motor_carrier,
            }

            for file_field, file in documents.items():
                if file:
                    TransporterDocument.objects.create(
                        transporter_id=transporter,
                        name=file_field,
                        document=file
                    )

            return transporter


class TransporterUpdateSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(max_length=255, required=True, write_only=True)
    city = CitySerializer(read_only=True)
    state_id = serializers.PrimaryKeyRelatedField(queryset=State.objects.all())
    state = StateSerializer(read_only=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    status = serializers.IntegerField(read_only=True)

    class Meta:
        model = Transporter
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "business_name",
            "street_name",
            "zipcode",
            "city",
            "city_name",
            "state_id",
            "state",
            "website",
            "phone_number",
            "ext",
            "cell_number",
            "approved",
            "status",
            "password",
            "confirm_password"
        )

    def validate(self, attrs):
        if attrs.get("password") and not attrs.get("confirm_password"):
            raise serializers.ValidationError({"error": "Confirm password is required"})

        if attrs.get("password") and attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"error": "Confirm password doesn't matches password"})

        return attrs


    def update(self, instance, validated_data):
        if validated_data.get("password"):
            password = validated_data.pop("password")
            confirm_password = validated_data.pop("confirm_password")

            instance.user.set_password(password)
            instance.user.save(update_fields=["password"])
            validated_data["status"] = 1

        return super().update(instance, validated_data)


class RestoreInactiveTransportationChargesSlabSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = TransportationChargesSlab
        fields = (
            "id",
            "is_active",
        )


class TransporterAcceptJobSerializer(serializers.Serializer):
    job_id = serializers.PrimaryKeyRelatedField(queryset=TransportationJob.objects.filter(transporter_id__isnull=True, status=0), required=True)

    def validate(self, attrs):
        transportation_job = attrs["job_id"]

        if transportation_job.transporter_id:
            raise serializers.ValidationError({"error": "Job already accepted"})

        return attrs


class TransporterJobCreateSerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(max_length=255, required=True)
    distance = serializers.CharField(max_length=255, read_only=True)
    duration = serializers.CharField(max_length=255, read_only=True)
    request_id = InspectionRequestSerializer(read_only=True)
    dealer_id = DealershipSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    transporter_id = TransporterSerializer(read_only=True)
    pickup_location = serializers.PrimaryKeyRelatedField(queryset=DealerLocation.objects.all(), write_only=True, required=True)
    drop_location = serializers.PrimaryKeyRelatedField(queryset=DealerLocation.objects.all(), write_only=True, required=True)
    pickup_location_detail = DealerLocationSerializer(read_only=True)
    drop_location_detail = DealerLocationSerializer(read_only=True)
    transportation_slab_id = serializers.PrimaryKeyRelatedField(queryset=TransportationChargesSlab.objects.all(), write_only=True, required=False)
    transportation_slab_id_detail = TransportationChargesSlabSerializer(read_only=True)

    class Meta:
        model = TransportationJob
        fields = (
            "id",
            "auction_id",
            "distance",
            "duration",
            "request_id",
            "dealer_id",
            "buyer_id",
            "transporter_id",
            "pickup_location",
            "drop_location",
            "pickup_location_detail",
            "drop_location_detail",
            "transportation_slab_id",
            "transportation_slab_id_detail",
        )

    def validate(self, attrs):
        if not AuctionWon.objects.filter(auction_id=attrs["auction_id"]).exists():
            raise serializers.ValidationError({"error": "No Auction Won exists"})

        if not InspectionRequest.objects.filter(auction_id=attrs["auction_id"], auction_won_id__isnull=False):
            raise serializers.ValidationError({"error": "No Inspection completed exists"})

        return attrs


    def create(self, validated_data):
        inspection_request = InspectionRequest.objects.get(auction_id=validated_data["auction_id"])
        pickup_location = validated_data.get("pickup_location")
        drop_location = validated_data.get("drop_location")

        distance, duration = calculate_distance(pickup_location, drop_location)

        validated_data["request_id"] = inspection_request
        validated_data["dealer_id"] = inspection_request.dealer
        validated_data["buyer_id"] = inspection_request.buyer_id
        validated_data["distance"] = distance if distance else None
        validated_data["duration"] = duration if duration else None
        validated_data["tracking_status"] = 0

        return super().create(validated_data)


class UpdateTrackingStatusSerializer(serializers.ModelSerializer):
    tracking_status = serializers.IntegerField(required=True)

    class Meta:
        model = TransportationJob
        fields = (
            "id",
            "tracking_status",
        )
