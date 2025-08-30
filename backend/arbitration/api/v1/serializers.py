from rest_framework import serializers

from arbitration.models import TicketArbitrationData, Ticket, TicketStatus, TicketTypes
from users.api.v1.serializers import DealershipSerializer


class TicketTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTypes
        fields = "__all__"


class TicketStatusSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    color = serializers.CharField(required=True)
    is_default = serializers.CharField(required=True)
    type_can_be_change = serializers.CharField(required=True)
    ticket_type = serializers.PrimaryKeyRelatedField(queryset=TicketTypes.objects.all(), write_only=True)
    ticket_type_detail = serializers.SerializerMethodField()

    class Meta:
        model = TicketStatus
        fields = (
            "id",
            "name",
            "color",
            "is_default",
            "type_can_be_change",
            "ticket_type",
            "ticket_type_detail",
        )

    def get_ticket_type_detail(self, obj):
        ticket_type = obj.ticket_type

        if ticket_type:
            return TicketTypesSerializer(ticket_type).data

        return None


class TicketSerializer(serializers.ModelSerializer):
    category_id = TicketTypesSerializer(read_only=True)
    status = TicketStatusSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    seller_id = DealershipSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = "__all__"


class ArbitrationTicketSerializer(serializers.ModelSerializer):
    ticket_id = TicketSerializer(read_only=True)

    class Meta:
        model = TicketArbitrationData
        fields = "__all__"


class CreateArbitrationTicketSerializer(serializers.Serializer):
    auction_id = serializers.CharField(required=True)
    issues = serializers.CharField(required=True)


class TicketTypeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketTypes
        fields = (
            "id",
            "name",
            "is_active",
        )


class RestoreInactiveTicketTypeSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = TicketTypes
        fields = (
            "id",
            "is_active",
        )


class TicketStatusDetailSerializer(serializers.ModelSerializer):
    ticket_type = TicketTypesSerializer(read_only=True)
    type_can_be_change = serializers.CharField(read_only=True)

    class Meta:
        model = TicketStatus
        fields = (
            "id",
            "name",
            "color",
            "is_active",
            "ticket_type",
            "type_can_be_change"
        )


class RestoreInactiveTicketStatusSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = TicketStatus
        fields = (
            "id",
            "is_active",
        )