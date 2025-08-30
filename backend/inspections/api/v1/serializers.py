from rest_framework import serializers
from django.utils.crypto import get_random_string

from arbitration.api.v1.serializers import ArbitrationTicketSerializer
from inspections.models import InspectionRequest, Inspector, InspectorWorkingDay, VehicleInspectionReport, \
    ManualDelivery, ManualAttachment
from users.models import Dealership, DealerLocation, User, Role
from users.api.v1.serializers import DealershipSerializer, DealerLocationSerializer, UserDetailSerializer
from utils.models import State


class InspectorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all())
    user = UserDetailSerializer(read_only=True)
    days = serializers.ListField(write_only=True)

    class Meta:
        model = Inspector
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "dob",
            "cnic",
            "phone_number",
            "whatsapp_number",
            "state",
            "password",
            "working_hrs",
            "shift_start",
            "shift_end",
            "days",
            "user",
        )

    def validate(self, attrs):
        if User.objects.filter(email=attrs.get("email")).exists():
            raise serializers.ValidationError({"error": "Email already exists"})

        if not Role.objects.filter(name="INSPECTOR", is_active=True).exists():
            raise serializers.ValidationError({"error": "Role Inspector doesn't exists"})

        return attrs

    def create(self, validated_data):
        role = Role.objects.filter(name="INSPECTOR").first()
        days = validated_data.pop("days")
        password = validated_data.pop("password")
        admin_user = self.context["request"].user

        user = User.objects.create(
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            email=validated_data.get("email"),
            mobile_no=validated_data.get("phone_number"),
            role=role,
            status=1,
            created_by=admin_user
        )
        user.set_password(password)
        user.save(update_fields=["password"])

        inspector = Inspector.objects.create(
            **validated_data,
            user=user,
            created_by=admin_user
        )

        days_data = []

        for day in days:
            days_data.append(InspectorWorkingDay(user=user, inspector=inspector, day=day, created_by=self.context["request"].user))

        InspectorWorkingDay.objects.bulk_create(days_data)

        return inspector


class InspectionUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    password = serializers.CharField(write_only=True)
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all())
    user = UserDetailSerializer(read_only=True)
    days = serializers.ListField(write_only=True)

    class Meta:
        model = Inspector
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "password",
            "dob",
            "cnic",
            "phone_number",
            "whatsapp_number",
            "state",
            "working_hrs",
            "shift_start",
            "shift_end",
            "days",
            "user",
        )

    def update(self, instance, validated_data):
        validated_data["updated_by"] = self.context["request"].user
        instance = super().update(instance, validated_data)

        if validated_data.get("password") and instance.user:
            password = validated_data.pop("password")
            instance.user.set_password(password)
            instance.user.status = 1
            instance.user.save(update_fields=["password", "status"])

        if validated_data.get("days"):
            for day in validated_data.get("days"):
                created_day, is_created = InspectorWorkingDay.objects.get_or_create(user=instance.user, inspector=instance, day=day, defaults={"created_by": self.context["request"].user})

        return instance

class VehicleInspectionSerializer(serializers.ModelSerializer):
    exterior = serializers.DictField(required=False)
    interior = serializers.DictField(required=False)
    mechanical = serializers.DictField(required=False)
    wheels = serializers.DictField(required=False)
    warning_lights = serializers.DictField(required=False)
    frame = serializers.DictField(required=False)
    drivability = serializers.DictField(required=False)
    demage_notes = serializers.CharField(required=False, allow_blank=True)
    rust_notes = serializers.CharField(required=False, allow_blank=True)
    yellow = serializers.BooleanField(required=False, default=False)
    demage_files = serializers.ListField(
        child=serializers.FileField(), required=False, allow_empty=True
    )
    rust_files = serializers.ListField(
        child=serializers.FileField(), required=False, allow_empty=True
    )
    obdii_files = serializers.ListField(
        child=serializers.FileField(), required=False, allow_empty=True
    )

    class Meta:
        model = VehicleInspectionReport
        fields = (
            "id",
            "exterior",
            "interior",
            "mechanical",
            "wheels",
            "warning_lights",
            "frame",
            "drivability",
            "demage_notes",
            "rust_notes",
            "yellow",
            "demage_files",
            "rust_files",
            "obdii_files",
        )

    def validate(self, attrs):
        request_id = self.context['view'].kwargs.get("pk")
        inspector = Inspector.objects.filter(user=self.context["request"].user).first()

        if not inspector:
            raise serializers.ValidationError({"error": "Inspector doesn't exists for following user"})

        if not InspectionRequest.objects.filter(id=request_id, inspector_assigned=inspector).exists():
            raise serializers.ValidationError({"error": "Inspection request doesn't belongs to following inspector or it doesn't exists"})

        return attrs


class VehicleReportLightsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleInspectionReport
        fields = (
            "id",
            "red",
            "yellow",
            "green",
            "purple",
        )


class InspectionRequestSerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(read_only=True)
    year = serializers.CharField(max_length=255, read_only=True)
    make = serializers.CharField(max_length=255, read_only=True)
    model = serializers.CharField(max_length=255, read_only=True)
    status = serializers.IntegerField(read_only=True)
    inspection_status = serializers.IntegerField(read_only=True)
    rough = serializers.CharField(max_length=255, read_only=True)
    average = serializers.CharField(max_length=255, read_only=True)
    clean = serializers.CharField(max_length=255, read_only=True)
    transmission = serializers.CharField(max_length=255, read_only=True)
    drivetrain = serializers.CharField(max_length=255, read_only=True)
    reserve_price = serializers.CharField(max_length=255, read_only=True)
    lights = serializers.SerializerMethodField(read_only=True)
    has_blue = serializers.BooleanField(read_only=True)
    has_yellow = serializers.BooleanField(read_only=True)
    inspection_reports = VehicleReportLightsSerializer(read_only=True)
    inspector_assigned = InspectorSerializer(read_only=True)
    dealer = DealershipSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    inspection_location_id = serializers.PrimaryKeyRelatedField(queryset=DealerLocation.objects.all(), write_only=True)
    inspection_location = DealerLocationSerializer(read_only=True)
    arbitration_ticket_id = ArbitrationTicketSerializer(read_only=True)

    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "auction_id",
            "auction_date",
            "auction_status",
            "vin",
            "stock_no",
            "odometer",
            "year",
            "make",
            "model",
            "trim",
            "series",
            "cylinders",
            "transmission",
            "drivetrain",
            "older_model",
            "days_on_lot",
            "description",
            "blackbook_data",
            "expected_price",
            "reserve_price",
            "ready_to_sell",
            "live_appraisal",
            "auction_type",
            "rough",
            "average",
            "clean",
            "status",
            "inspection_status",
            "inspected_date",
            "unknown_mileage",
            "title_absent",
            "title_branded",
            "mechanical_issue",
            "frame_damage",
            "factory_emissions_modified",
            "driveability_issue",
            "flood_damage",
            "is_special",
            "speciality_notes",
            "speciality_approval",
            "speciality_ticket_id",
            "inspector_assigned",
            "inspector_reject_reason",
            "dealer",
            "buyer_id",
            "buyer_confirmed",
            "is_sold",
            "auction_won_id",
            "payment_on_clearance",
            "payment_received",
            "payment_id",
            "arbitration_expire_date",
            "arbitration_taken",
            "arbitration_claim_requested",
            "arbitration_ticket_id",
            "vehicle_delivery_location",
            "title_delivery_location",
            "transportation_taken",
            "transport_job_id",
            "manual_delivered",
            "via_api",
            "created_at",
            "updated_at",
            "deleted_at",
            "lights",
            "inspection_reports",
            "has_blue",
            "has_red",
            "has_yellow",
            "has_green",
            "inspection_location_id",
            "inspection_location",
        )

    def validate(self, attrs):
        if attrs.get("inspection_location_id").dealership.id != self.context["request"].user.dealer.id:
            raise serializers.ValidationError({"error": "Dealership location doesn't belongs to request user"})

        if not self.context["request"].user.is_active or not self.context["request"].user.dealer.is_active:
            raise serializers.ValidationError({"error": "User or Dealership is inactive"})

        if attrs.get("red") == 1 and attrs.get("green") == 1:
            raise serializers.ValidationError({"error": "Vehicle cannot be red and green at the same time"})

        return attrs

    def create(self, validated_data):
        validated_data["dealer"] = self.context["request"].user.dealer
        inspection_location_id = validated_data.pop("inspection_location_id")
        validated_data["inspection_location"] = inspection_location_id
        validated_data["auction_id"] = get_random_string(10, allowed_chars="0123456789")

        if validated_data.get("is_special") == 1:
            validated_data["status"] = 1

        return super().create(validated_data)

    def get_lights(self, obj):
        lights = []

        if obj.title_absent == 1:
            lights.append("blue")

        if obj.has_red or obj.title_branded == 1:
            lights.append("red")

        if obj.has_green and "red" not in lights:
            lights.append("green")

        if obj.mechanical_issue == 1 or obj.frame_damage == 1 or obj.factory_emissions_modified == 1 or obj.driveability_issue == 1:
            lights.append("yellow")

        return lights


class InspectionAssignCarAttributesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "year",
            "make",
            "model",
            "trim",
            "series",
            "cylinders",
            "transmission",
            "drivetrain",
            "rough",
            "average",
            "clean"
        )


class AssignInspectorSerializer(serializers.ModelSerializer):
    inspector_assigned = serializers.PrimaryKeyRelatedField(queryset=Inspector.objects.all(), write_only=True, required=True)

    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "inspector_assigned",
        )


class VehicleInspectionDetailSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    dealer_id = DealershipSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    inspector_id = InspectorSerializer(read_only=True)

    class Meta:
        model = VehicleInspectionReport
        fields = "__all__"


class MarkInspectionRequestCompleteSerializer(serializers.ModelSerializer):
    inspection_status = serializers.IntegerField(required=True)

    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "status",
            "inspection_status"
        )


class SpecialityVehicleApproveSerializer(serializers.ModelSerializer):
    expected_price = serializers.CharField(required=True)

    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "expected_price",
            "reserve_price",
            "status",
        )

class InspectionRequestUpdateSerializer(serializers.ModelSerializer):
    reserve_price = serializers.IntegerField(required=True)

    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "auction_id",
            "reserve_price",
        )


class ManualDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualDelivery
        fields = "__all__"


class ManualAttachmentSerializer(serializers.ModelSerializer):
    manual_delivery_id = ManualDeliverySerializer()

    class Meta:
        model = ManualAttachment
        fields = "__all__"


class ManualDeliveredSerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(read_only=True)
    status = serializers.IntegerField(read_only=True)
    manual_delivered = serializers.IntegerField(read_only=True)
    attachment = serializers.FileField(required=True, write_only=True)
    manual_delivery = ManualDeliverySerializer(read_only=True)

    class Meta:
        model = InspectionRequest
        fields = (
            "id",
            "auction_id",
            "status",
            "manual_delivered",
            "attachment",
            "manual_delivery",
        )

    def update(self, instance, validated_data):
        buyer_user = self.context["request"].user

        manual_attachment = validated_data.pop("attachment")

        validated_data["status"] = 8
        validated_data["manual_delivered"] = 1

        manual_delivery = ManualDelivery.objects.create(
            # Delivery date not confirmed right now
            # delivered_date=data['deliveredDate'],
            auction_id=instance.auction_id,
            request_id=instance,
            recipient_first_name=buyer_user.first_name,
            recipient_last_name=buyer_user.last_name,
            recipient_email=buyer_user.email,
            recipient_contact_number=buyer_user.mobile_no,
        )

        ManualAttachment.objects.create(
            manual_delivery_id=manual_delivery,
            file=manual_attachment
        )

        return super().update(instance, validated_data)
