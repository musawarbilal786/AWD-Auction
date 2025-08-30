from rest_framework import serializers

from inspections.models import InspectionRequest, VehicleInspectionReport
from users.models import Dealership, User, DealerLocation
from auctions.models import Auctions, AuctionBids, AuctionProxies, AuctionOffers, AuctionNegotiations, AuctionWon
from inspections.api.v1.serializers import InspectionRequestSerializer, VehicleInspectionSerializer
from users.api.v1.serializers import DealershipSerializer, UserDetailSerializer, DealerLocationSerializer
from transportation.models import TransportationJob, TransportationJobTracking
from transportation.api.v1.serializers import TransportationJobSerializer, TransportationJobTrackingSerializer


class SendToAuctionSerializer(serializers.ModelSerializer):
    request_id = serializers.PrimaryKeyRelatedField(queryset=InspectionRequest.objects.all(), required=True)
    auction_type = serializers.IntegerField(required=True)
    reserve_price = serializers.CharField(required=True)
    credit_use_for_inspection_fee = serializers.IntegerField(required=True)
    credit_use_for_selling_fee = serializers.IntegerField(required=True)
    bid_start_from_price = serializers.CharField(read_only=True)

    class Meta:
        model = Auctions
        fields = (
            "id",
            "request_id",
            "reserve_price",
            "auction_type",
            "ready_to_sell",
            "credit_use_for_inspection_fee",
            "credit_use_for_selling_fee",
            "bid_start_from_price",

        )

    def validate(self, attrs):
        inspection_request = attrs["request_id"]

        if not self.context["request"].user.dealer == inspection_request.dealer:
            raise serializers.ValidationError({"error": "Inspection request doesn't belong to current user dealership"})

        if not self.context["request"].user.is_active or not self.context["request"].user.dealer.is_active:
            raise serializers.ValidationError({"error": "User or Dealership is inactive"})

        if Auctions.objects.filter(request_id=inspection_request).exists():
            raise serializers.ValidationError({"error": "Auction already exists for following inspection request"})

        if not inspection_request.auction_id:
            raise serializers.ValidationError({"error": "Inspection request auction id doesn't exists"})

        return attrs


    def create(self, validated_data):
        inspection_request = validated_data["request_id"]
        dealer = inspection_request.dealer
        reserve_price = float(validated_data.get("reserve_price"))

        if validated_data.get("auction_type") == 1:
            bid_start_from_price = 0.00
        elif validated_data.get("auction_type") == 2:
            bid_start_from_price = reserve_price / 2
        elif validated_data.get("auction_type") == 3:
            bid_start_from_price = reserve_price - 3000
            if bid_start_from_price < 0:
                bid_start_from_price = 0.00
        else:
            bid_start_from_price = 0.00  # Fallback

        auction_run_time = 600 # static for now
        inspection_request.count_down = auction_run_time
        inspection_request.count_down_duration_in_sec = auction_run_time
        inspection_request.auction_status = 1
        inspection_request.status = 20  # On Run List
        inspection_request.reserve_price = reserve_price
        inspection_request.ready_to_sell = validated_data.get("ready_to_sell", 1)
        inspection_request.auction_type = validated_data.get("auction_type")
        inspection_request.save()

        # Save auction
        auction, created = Auctions.objects.update_or_create(
            request_id=inspection_request,
            auction_id=inspection_request.auction_id,
            defaults={
                "auction_id": inspection_request.auction_id,
                "dealer_id": dealer,
                "expected_price": inspection_request.expected_price,
                "reserve_price": reserve_price,
                "ready_to_sell": validated_data.get("ready_to_sell", 1),
                "auction_type": validated_data.get("auction_type"),
                "bid_start_from_price": bid_start_from_price,
                "credit_use_for_inspection_fee": validated_data.get("credit_use_for_inspection_fee"),
                "credit_use_for_selling_fee": validated_data.get("credit_use_for_selling_fee"),
                "status": 0,
            }
        )

        return auction


class UpcomingAuctionsSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer()
    dealer_id = serializers.SerializerMethodField()
    inspection_reports = serializers.SerializerMethodField()
    created_by = UserDetailSerializer()
    updated_by = UserDetailSerializer()

    class Meta:
        model = Auctions
        fields = [
            "id",
            "auction_id",
            "request_id",
            "dealer_id",
            "last_bid_id",
            "last_proxy_id",
            "last_proxy_buyer_id",
            "expected_price",
            "reserve_price",
            "ready_to_sell",
            "live_appraisal",
            "auction_type",
            "bid_start_from_price",
            "won_type",
            "won_by_id",
            "won_bid_id",
            "won_at",
            "credit_use_for_inspection_fee",
            "credit_use_for_selling_fee",
            "credit_use_for_buying",
            "status",
            "created_by",
            "updated_by",
            "deleted_at",
            "created_at",
            "updated_at",
            "inspection_reports",
        ]

    def get_dealer_id(self, obj):
        if obj.dealer_id:
            return DealershipSerializer(obj.dealer_id).data
        return None

    def get_inspection_reports(self, obj):
        print(f"Request ID type: {type(obj.request_id)}")

        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)
        print("reports", reports)

        if reports.exists():
            return list(reports.values())

        return None


class AuctionsLiveSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer()
    inspection_reports = serializers.SerializerMethodField()
    last_bid_id = serializers.SerializerMethodField()

    class Meta:
        model = Auctions
        fields = (
            "id",
            "auction_id",
            "request_id",
            "inspection_reports",
            "last_bid_id",
            "last_proxy_id",
            "last_proxy_buyer_id",
            "expected_price",
            "reserve_price",
            "ready_to_sell",
            "live_appraisal",
            "auction_type",
            "bid_start_from_price",
            "won_type",
            "won_by_id",
            "won_bid_id",
            "won_at",
            "credit_use_for_inspection_fee",
            "credit_use_for_selling_fee",
            "credit_use_for_buying",
            "status",
            "created_by",
            "updated_by",
            "deleted_at",
            "created_at",
            "updated_at",
        )

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None

    def get_last_bid_id(self, obj):
        last_bid_id = AuctionBids.objects.filter(auction_id=obj.auction_id)

        if last_bid_id.exists():
            return list(last_bid_id.values())

        return None


class AuctionProxiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionProxies
        fields = (
            "id",
            "auction_id",
            "proxy_amount",
            "bid_amount",
            "is_expire",
        )

class AuctionBidsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionBids
        fields = (
            "id",
            "auction_id",
            "buyer_id",
            "buyer_user_id",
            "bid",
            "last_bid",
            "type",
            "status",
            "is_expired",
            "created_at",
        )

class MarketplaceSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer()
    last_bid_id = AuctionBidsSerializer(read_only=True)
    last_proxy_id = AuctionProxiesSerializer(read_only=True)
    class Meta:
        model = Auctions
        fields = (
            "id",
            "auction_id",
            "status",
            "last_bid_id",
            "last_proxy_id",
            "request_id",
            "expected_price",
            "reserve_price",
            "auction_type",
            "ready_to_sell",
        )


class BuyingCurrentBidsSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    inspection_reports = serializers.SerializerMethodField()
    last_bid_id = AuctionBidsSerializer(read_only=True)
    # auction_won_detail = serializers.SerializerMethodField()

    class Meta:
        model = Auctions
        fields = (
            "id",
            "auction_id",
            "expected_price",
            "reserve_price",
            "bid_start_from_price",
            "status",
            "won_at",
            "won_by_id",
            "won_bid_id",
            "last_bid_id",
            "request_id",
            # "auction_won_detail",
            "inspection_reports",
        )

    def get_offers(self, obj):
        offers = AuctionOffers.objects.filter(auction_id=obj.auction_id)

        return AuctionOfferSerializer(offers, many=True).data

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None

    # def get_auction_won_detail(self, obj):
    #     buyer = self.context["request"].user.dealer
    #
    #     auction_won = AuctionWon.objects.filter(buyer_id=buyer, auction_id=obj.auction_id)
    #
    #     if auction_won.exists():
    #         return AuctionWonSerializer(auction_won, many=True).data
    #
    #     return None


class ActiveBuyingAuctionSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    inspection_reports = serializers.SerializerMethodField()
    last_bid_id = AuctionBidsSerializer(read_only=True)
    offers = serializers.SerializerMethodField(read_only=True)
    # auction_won_detail = serializers.SerializerMethodField()

    class Meta:
        model = Auctions
        fields = (
            "id",
            "auction_id",
            "expected_price",
            "reserve_price",
            "bid_start_from_price",
            "status",
            "won_at",
            "won_by_id",
            "won_bid_id",
            # "auction_won_detail",
            "last_bid_id",
            "offers",
            "request_id",
            "inspection_reports",
        )

    def get_offers(self, obj):
        offers = AuctionOffers.objects.filter(auction_id=obj.auction_id)

        return AuctionOfferSerializer(offers, many=True).data

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None

    # def get_auction_won_detail(self, obj):
    #     buyer = self.context["request"].user.dealer
    #
    #     auction_won = AuctionWon.objects.filter(buyer_id=buyer, auction_id=obj.auction_id)
    #
    #     if auction_won.exists():
    #         return AuctionWonSerializer(auction_won, many=True).data
    #
    #     return None


class AuctionNegotiationSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    dealer_id = DealershipSerializer(read_only=True)
    inspection_reports = serializers.SerializerMethodField()
    bid_id = AuctionBidsSerializer(read_only=True)
    highest_offer = serializers.SerializerMethodField()

    class Meta:
        model = AuctionNegotiations
        fields = (
            "id",
            "auction_id",
            "bid_type",
            "amount",
            "changed_amount",
            "is_accepted",
            "is_rejected",
            "is_expire",
            "price_change_requested_by_buyer",
            "price_change_requested_by_seller",
            "bid_id",
            "highest_offer",
            "buyer_id",
            "dealer_id",
            "request_id",
            "inspection_reports",
            "created_at",
            "updated_at",
        )

    def get_highest_offer(self, obj):
        offers = AuctionOffers.objects.filter(auction_id=obj.auction_id)

        if offers.exists():
            highest_offer = offers.order_by("-amount").first()
            return AuctionOfferSerializer(highest_offer).data

        return None

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None


class AuctionNegotiationOfferUpdateSerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(read_only=True)
    price_change_requested_by_buyer = serializers.BooleanField()
    price_change_requested_by_seller = serializers.BooleanField()

    class Meta:
        model = AuctionOffers
        fields = (
            "auction_id",
            "amount",
            "is_accepted",
            "is_rejected",
            "price_change_requested_by_buyer",
            "price_change_requested_by_seller",
        )

    def validate(self, attrs):
        if attrs.get("price_change_requested_by_buyer") == True and attrs.get("price_change_requested_by_seller") == True:
            raise serializers.ValidationError({"error": "Price change request should be processed by buyer or seller at a time"})

        return attrs


class AuctionNegotiationUpdateSerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    price_change_requested_by_buyer = serializers.BooleanField()
    price_change_requested_by_seller = serializers.BooleanField()

    class Meta:
        model = AuctionNegotiations
        fields = (
            "auction_id",
            "amount",
            "changed_amount",
            "is_accepted",
            "is_rejected",
            "price_change_requested_by_buyer",
            "price_change_requested_by_seller",
        )

    def validate(self, attrs):
        if attrs.get("price_change_requested_by_buyer") == True and attrs.get("price_change_requested_by_seller") == True:
            raise serializers.ValidationError({"error": "Price change request should be processed by buyer or seller at a time"})

        return attrs


class SellingInNegotiationSerializer(ActiveBuyingAuctionSerializer):
    negotiation_offers = serializers.SerializerMethodField()

    class Meta:
        model = Auctions
        fields = ActiveBuyingAuctionSerializer.Meta.fields + (
            "negotiation_offers",
        )

    def get_negotiation_offers(self, obj):
        negotiation_offers = AuctionNegotiations.objects.filter(auction_id=obj.auction_id)

        return AuctionNegotiationSerializer(negotiation_offers).data


class AuctionCreateBidSerializer(serializers.ModelSerializer):
    buyer_user_id = UserDetailSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    auction_id = serializers.CharField(required=True)
    bid = serializers.IntegerField(required=True)
    last_bid = serializers.IntegerField(read_only=True)
    status = serializers.IntegerField(read_only=True)
    type = serializers.IntegerField(read_only=True)
    is_expired = serializers.IntegerField(read_only=True)

    class Meta:
        model = AuctionBids
        fields = (
            "id",
            "auction_id",
            "buyer_id",
            "buyer_user_id",
            "bid",
            "last_bid",
            "type",
            "status",
            "is_expired",
            "created_at",
        )

    def validate(self, attrs):
        if not Auctions.objects.filter(auction_id=attrs["auction_id"]).exists():
            raise serializers.ValidationError({"error": "No Auction exists"})

        if attrs["bid"] % 50 != 0 and attrs["bid"] % 100 != 0:
            raise serializers.ValidationError({"error": "Bid must be a multiple of 50 or 100"})

        if AuctionBids.objects.filter(auction_id=attrs["auction_id"], bid__gte=attrs["bid"]).exists():
            raise serializers.ValidationError({"error": "Enter bid amount greater than highest auction"})

        auction_bids = AuctionBids.objects.filter(auction_id=attrs["auction_id"])

        if auction_bids.exists() and auction_bids.last().buyer_user_id == self.context["request"].user:
            raise serializers.ValidationError({"error": "Buyer already have highest bid"})

        return attrs

    def create(self, validated_data):
        buyer_dealer = self.context["request"].user.dealer
        auction = Auctions.objects.get(auction_id=validated_data["auction_id"])
        auction.request_id.status = 21
        auction.request_id.buyer_id = buyer_dealer
        auction.request_id.save()

        buyer_user_id = self.context["request"].user
        buyer_id = buyer_user_id.dealer

        validated_data["request_id"] = auction.request_id
        validated_data["buyer_id"] = buyer_id
        validated_data["buyer_user_id"] = buyer_user_id

        auction_bid = AuctionBids.objects.create(**validated_data)

        auction.last_bid_id = auction_bid
        auction.save(update_fields=["last_bid_id"])

        return auction_bid

class AuctionOfferSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    dealer_id = DealershipSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    auction_id = serializers.CharField(required=True)
    amount = serializers.IntegerField(required=True)
    status = serializers.IntegerField(read_only=True)

    class Meta:
        model = AuctionOffers
        fields = (
            "id",
            "auction_id",
            "offer_type",
            "amount",
            "is_accepted",
            "is_rejected",
            "is_expire",
            "price_change_requested_by_buyer",
            "price_change_requested_by_seller",
            "status",
            "created_at",
            "buyer_id",
            "dealer_id",
            "request_id",
        )

    def validate(self, attrs):
        if not Auctions.objects.filter(auction_id=attrs["auction_id"]).exists():
            raise serializers.ValidationError({"error": "No Auction exists"})

        if AuctionBids.objects.filter(auction_id=attrs["auction_id"], bid__gte=attrs["amount"]).exists() or AuctionOffers.objects.filter(auction_id=attrs["auction_id"], amount__gte=attrs["amount"]).exists():
            raise serializers.ValidationError({"error": "Enter amount greater than highest bid/offer"})

        return attrs

    def create(self, validated_data):
        buyer_user_id = self.context["request"].user
        buyer_id = buyer_user_id.dealer

        auction = Auctions.objects.filter(auction_id=validated_data["auction_id"]).first()

        validated_data["dealer_id"] = auction.request_id.dealer
        validated_data["request_id"] = auction.request_id
        validated_data["buyer_id"] = buyer_id
        validated_data["created_by"] = buyer_user_id

        return super().create(validated_data)


class AuctionSoldSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    inspection_reports = serializers.SerializerMethodField()
    won_bid_id = AuctionBidsSerializer(read_only=True)
    offers = serializers.SerializerMethodField(read_only=True)
    bids = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Auctions
        fields = (
            "id",
            "auction_id",
            "expected_price",
            "reserve_price",
            "bid_start_from_price",
            "status",
            "won_at",
            "won_by_id",
            "won_bid_id",
            "last_bid_id",
            "offers",
            "bids",
            "request_id",
            "inspection_reports",
        )

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None

    def get_offers(self, obj):
        buyer_user = self.context["request"].user.dealer

        auction_offers = AuctionOffers.objects.filter(auction_id=obj.auction_id, buyer_id=buyer_user).order_by("-amount")

        if auction_offers.exists():
            return AuctionOfferSerializer(auction_offers.first()).data

        return None

    def get_bids(self, obj):
        buyer_user = self.context["request"].user.dealer

        auction_bids = AuctionBids.objects.filter(auction_id=obj.auction_id, buyer_id=buyer_user).order_by("-bid")

        if auction_bids.exists():
            return AuctionBidsSerializer(auction_bids.first()).data

        return None


class AuctionProxySerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(required=True)
    proxy_amount = serializers.IntegerField(required=True)
    request_id = InspectionRequestSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)

    class Meta:
        model = AuctionProxies
        fields = (
            "auction_id",
            "request_id",
            "buyer_id",
            "proxy_amount",
            "bid_amount",
            "is_expire",
            "created_at",
        )

    def validate(self, attrs):
        if not InspectionRequest.objects.filter(auction_id=attrs["auction_id"]).exists():
            raise serializers.ValidationError({"error": "Inspection Request doesn't exists"})

        auction = Auctions.objects.select_related("last_bid_id").filter(auction_id=attrs["auction_id"], status=1)

        if not auction:
            raise serializers.ValidationError({"error": "No live auction doesn't exists"})

        latest_auction = auction.first()
        latest_bid = latest_auction.last_bid_id

        if latest_bid and latest_bid.bid >= attrs["proxy_amount"]:
            raise serializers.ValidationError({"error": "Proxy amount is less than the highest bid"})

        return attrs


    def create(self, validated_data):
        user = self.context["request"].user
        dealer = user.dealer
        auction_id = validated_data.get("auction_id")
        inspection_request = InspectionRequest.objects.get(auction_id=auction_id)

        validated_data["request_id"] = inspection_request
        validated_data["buyer_id"] = dealer

        return super().create(validated_data)


class AuctionBuyNowSerializer(serializers.ModelSerializer):
    auction_id = serializers.CharField(required=True)
    request_id = InspectionRequestSerializer(read_only=True)
    buyer_id = DealershipSerializer(read_only=True)
    bid_id = serializers.CharField(read_only=True)
    bid_price = serializers.FloatField(read_only=True)
    buyer_confirmation = serializers.IntegerField(read_only=True)
    won_type = serializers.IntegerField(read_only=True)
    is_expired = serializers.IntegerField(read_only=True)

    class Meta:
        model = AuctionWon
        fields = (
            "id",
            "auction_id",
            "request_id",
            "buyer_id",
            "bid_id",
            "bid_price",
            "buyer_confirmation",
            "won_type",
            "is_expired",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        auction = Auctions.objects.select_related("last_bid_id").filter(auction_id=attrs["auction_id"])

        if not auction.exists():
            raise serializers.ValidationError({"error": "No Auction exists"})

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        dealer = user.dealer
        auction_id = validated_data.get("auction_id")
        inspection_request = InspectionRequest.objects.get(auction_id=auction_id)

        validated_data["request_id"] = inspection_request
        validated_data["buyer_id"] = dealer

        return super().create(validated_data)


class AuctionWonSerializer(serializers.ModelSerializer):
    request_id = InspectionRequestSerializer(read_only=True)
    inspection_reports = serializers.SerializerMethodField()
    vehicle_delivery_location = serializers.SerializerMethodField()
    title_delivery_location = serializers.SerializerMethodField()
    transportation_job = serializers.SerializerMethodField()
    transportation_job_tracking = serializers.SerializerMethodField()

    class Meta:
        model = AuctionWon
        fields = (
            "id",
            "auction_id",
            "bid_id",
            "bid_price",
            "buyer_confirmation",
            "won_type",
            "is_expired",
            "created_at",
            "updated_at",
            "request_id",
            "title_delivery_location",
            "vehicle_delivery_location",
            "inspection_reports",
            "transportation_job",
            "transportation_job_tracking",
        )

    def get_inspection_reports(self, obj):
        reports = VehicleInspectionReport.objects.filter(request_id=obj.request_id)

        if reports.exists():
            return list(reports.values())

        return None

    def get_vehicle_delivery_location(self, obj):
        dealer = self.context["request"].user.dealer
        dealer_locations = DealerLocation.objects.filter(dealership=dealer)

        return DealerLocationSerializer(dealer_locations).data

    def get_title_delivery_location(self, obj):
        dealer = self.context["request"].user.dealer
        dealer_locations = DealerLocation.objects.filter(dealership=dealer)

        return DealerLocationSerializer(dealer_locations).data

    def get_transportation_job(self, obj):
        transportation_jobs = TransportationJob.objects.filter(auction_id=obj.auction_id, request_id__transportation_taken=1)

        return TransportationJobSerializer(transportation_jobs, many=True).data

    def get_transportation_job_tracking(self, obj):
        transportation_job_tracking = TransportationJobTracking.objects.filter(auction_id=obj.auction_id, request_id__transportation_taken=1)

        return TransportationJobTrackingSerializer(transportation_job_tracking, many=True).data


class BuyerConfirmationSerializer(serializers.Serializer):
    auction_id = serializers.CharField(required=True)
    request_id = serializers.PrimaryKeyRelatedField(queryset=InspectionRequest.objects.all())
    # Changing it for now
    # auction_won_id = serializers.PrimaryKeyRelatedField(queryset=AuctionWon.objects.all())
    auction_won_id = serializers.IntegerField()
    title_delivery_location = serializers.PrimaryKeyRelatedField(queryset=DealerLocation.objects.all())
    vehicle_delivery_location = serializers.PrimaryKeyRelatedField(queryset=DealerLocation.objects.all())


class AuctionStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auctions
        fields = (
            "id",
            "status"
        )


class CheckoutSessionCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default="usd", required=False)
    description = serializers.CharField(default="Vehicle Payment", required=False)
