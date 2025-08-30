import os
import stripe
import datetime
from datetime import timedelta
from datetime import datetime

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, RetrieveAPIView, UpdateAPIView, RetrieveUpdateAPIView
from rest_framework.settings import api_settings
from rest_framework.response import Response
# from djstripe.models import Customer
from rest_framework.permissions import IsAuthenticated

from auctions.permissions import IsBuyerUserPermission
from auctions.tasks import send_auction_bid_won_email, send_vehicle_sold_buyer_email, send_vehicle_sold_seller_email
from auctions.utils import handle_negotiation_bid
from communications.choices import PriorityChoices
from communications.models import Notification
from inspections.permissions import IsSellerUserPermission
from users.permissions import IsAdminUserPermission
from auctions.api.v1.serializers import UpcomingAuctionsSerializer, AuctionsLiveSerializer, MarketplaceSerializer, \
    ActiveBuyingAuctionSerializer, AuctionCreateBidSerializer, AuctionOfferSerializer, AuctionSoldSerializer, \
    AuctionWonSerializer, BuyingCurrentBidsSerializer, AuctionNegotiationSerializer, AuctionNegotiationUpdateSerializer, \
    AuctionNegotiationOfferUpdateSerializer, AuctionBuyNowSerializer, AuctionProxySerializer, \
    BuyerConfirmationSerializer, AuctionStopSerializer
from auctions.models import Auctions, AuctionBids, AuctionOffers, AuctionNegotiations, AuctionWon, AuctionProxies
from inspections.models import InspectionRequest
from inspections.api.v1.serializers import InspectionRequestSerializer
from auctions.api.v1.serializers import CheckoutSessionCreateSerializer
from django.conf import settings

stripe.api_key = settings.STRIPE_LIVE_SECRET_KEY if settings.STRIPE_LIVE_MODE else settings.STRIPE_TEST_SECRET_KEY

class UpcomingAuctionsListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = UpcomingAuctionsSerializer
    queryset = Auctions.objects.filter(request_id__auction_status=1)


class UpcomingAuctionRetrieveAPIView(RetrieveAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = UpcomingAuctionsSerializer

    def get_object(self):
        return get_object_or_404(Auctions, Q(id=self.kwargs.get("pk")), request_id__auction_status=1)


class AuctionsRunListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        return InspectionRequest.objects.filter(status=20).exclude(auctions__isnull=True).order_by('-id')


class AdminSendToAuctionAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]

    def post(self, request, *args, **kwargs):
        ids = request.data.get('ids', [])

        if not ids:
            return Response({"error": "No Inspection Request id's found"})

        for id in ids:
            try:
                inspection = get_object_or_404(InspectionRequest, id=id)
                inspection.status = 4
                inspection.auction_date = timezone.now()
                inspection.save()

                dealer_user = inspection.dealer.users.first()

                Auctions.objects.filter(request_id=inspection).update(status=1)

                Notification.objects.create(
                    title="Auction Live",
                    text=f"Your auction with auction id {inspection.auction_id} is live now",
                    priority=PriorityChoices.LOW,
                    user=dealer_user
                )

            except InspectionRequest.DoesNotExist:
                continue

        return Response({'detail': 'Sent to auction successfully.'}, status=status.HTTP_200_OK)


class AuctionsLiveListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = AuctionsLiveSerializer
    queryset = Auctions.objects.filter(status=1)


class AuctionsWonListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = InspectionRequestSerializer

    def get_queryset(self):
        return InspectionRequest.objects.select_related('dealer').filter(status__gte=4, status__lt=20).exclude(auction_id__isnull=True)


class MarketplaceListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = MarketplaceSerializer

    def get_queryset(self):
        user = self.request.user
        current_time = timezone.now()

        auctions = Auctions.objects.select_related('request_id').exclude(dealer_id=user.dealer_id).filter(status=1)

        valid_auctions = []

        # Iterate over each auction
        for auction in auctions:
            # Get all AuctionBids for this auction, ordered by created_at
            auction_bids = AuctionBids.objects.filter(auction_id=auction.auction_id).order_by('created_at')

            if auction_bids.exists():
                # Get the first bid's created_at timestamp
                first_bid_time = auction_bids.first().created_at

                # Check if the time difference between the first bid and the current UTC time is less than or equal to 10 minutes
                if current_time - first_bid_time <= timedelta(minutes=10):
                    valid_auctions.append(auction)
                else:
                    auction.status = 0
                    auction.save()

                    buyer_user = auction.last_bid_id.buyer_id.users.first()
                    seller_user = auction.dealer_id.users.first()

                    AuctionNegotiations.objects.create(
                        auction_id = auction.auction_id,
                        request_id = auction.request_id,
                        dealer_id = auction.dealer_id,
                        buyer_id = auction.last_bid_id.buyer_id,
                        bid_id = auction.last_bid_id,
                        amount = auction.last_bid_id.bid,
                        changed_amount = auction.last_bid_id.bid,
                        price_change_requested_by_buyer = True
                    )

                    Notification.objects.create(
                        title="Auction Bid Won",
                        text=f"Congratulations! You have won the bid with the highest bid of {auction.last_bid_id.bid} for auction {auction.auction_id}",
                        priority=PriorityChoices.MEDIUM,
                        user=buyer_user
                    )

                    Notification.objects.create(
                        title="Auction Bid Won",
                        text=f"A buyer named as {buyer_user.full_name} won the auction that have auction {auction.auction_id}",
                        priority=PriorityChoices.MEDIUM,
                        user=seller_user
                    )

                    send_auction_bid_won_email(auction.last_bid_id.buyer_user_id, auction.auction_id)
            else:
                valid_auctions.append(auction)

        return valid_auctions



class MarketplaceDetailAPIView(RetrieveAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = UpcomingAuctionsSerializer

    def get_object(self):
        user = self.request.user
        queryset = Auctions.objects.select_related('request_id').exclude(dealer_id=user.dealer_id).filter(status=1)

        return get_object_or_404(queryset, pk=self.kwargs.get("pk"))


class AuctionBuyingCurrentListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = BuyingCurrentBidsSerializer

    def get_queryset(self):
        user = self.request.user

        return Auctions.objects.select_related('request_id').exclude(dealer_id=user.dealer_id).filter(last_bid_id__buyer_user_id=user)


# Use Auction negotiation model here
class AuctionBuyingInNegotiationListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionNegotiationSerializer

    def get_queryset(self):
        user = self.request.user

        return AuctionNegotiations.objects.select_related('request_id').exclude(dealer_id=user.dealer_id).filter(request_id__status=21, buyer_id=user.dealer)


class AuctionBuyingWonListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = BuyingCurrentBidsSerializer

    def get_queryset(self):
        user = self.request.user

        return Auctions.objects.select_related('request_id').exclude(dealer_id=user.dealer_id).filter(status=0, last_bid_id__buyer_user_id=user)


class AuctionSellingCurrentListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]
    serializer_class = ActiveBuyingAuctionSerializer

    def get_queryset(self):
        user = self.request.user

        return Auctions.objects.select_related("request_id").filter(status=0, dealer_id=user.dealer, request_id__status__gt=4, last_bid_id__isnull=False)


# Use Auction negotiation model here
class AuctionSellingInNegotiationListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]
    serializer_class = AuctionNegotiationSerializer

    def get_queryset(self):
        user = self.request.user

        return AuctionNegotiations.objects.select_related("request_id").filter(dealer_id=user.dealer, request_id__status=21)

        # return Auctions.objects.select_related("request_id").filter(status=0, dealer_id=user.dealer, request_id__status=21)


class SellerNegotiationUpdateAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]
    serializer_class = AuctionNegotiationUpdateSerializer
    lookup_field = 'auction_id'

    def get_object(self):
        user = self.request.user
        auction_id = self.kwargs.get("auction_id")
        print(auction_id, "auction id")

        return get_object_or_404(AuctionNegotiations, Q(dealer_id=user.dealer, request_id__status=21, auction_id=auction_id))

    def perform_update(self, serializer):
        instance = serializer.save()
        handle_negotiation_bid(instance)


class BuyerNegotiationUpdateAPIView(UpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionNegotiationUpdateSerializer
    lookup_field = 'auction_id'

    def get_object(self):
        user = self.request.user
        auction_id = self.kwargs.get("auction_id")
        print(auction_id, "auction id")

        return get_object_or_404(AuctionNegotiations, Q(buyer_id=user.dealer, request_id__status=21, auction_id=auction_id))

    def perform_update(self, serializer):
        instance = serializer.save()
        handle_negotiation_bid(instance)


# class BuyerNegotiationOfferUpdateAPIView(UpdateAPIView):
#     permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
#     serializer_class = AuctionNegotiationOfferUpdateSerializer


class AuctionSellingSoldListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]
    serializer_class = ActiveBuyingAuctionSerializer

    def get_queryset(self):
        user = self.request.user

        return Auctions.objects.select_related("request_id").filter(status=0, dealer_id=user.dealer, request_id__status__gt=4, last_bid_id__isnull=False)


class CreateAuctionBidCreateAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionCreateBidSerializer
    queryset = AuctionBids.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        buyer_user = instance.buyer_id.users.first()
        seller_user = instance.request_id.dealer.users.first()

        Notification.objects.create(
            title="You are the Highest Bidder",
            text=f"You are the highest bidder for auction {instance.auction_id}",
            priority=PriorityChoices.MEDIUM,
            user=buyer_user
        )

        Notification.objects.create(
            title="New Bid from buyer",
            text=f"A buyer has posted a bid of ${instance.bid} for auction {instance.auction_id}",
            priority=PriorityChoices.MEDIUM,
            user=seller_user
        )

        auction = get_object_or_404(Auctions, auction_id=instance.auction_id)
        auction_proxy = AuctionProxies.objects.filter(auction_id=instance.auction_id)

        if auction_proxy.exists():
            highest_proxy = auction_proxy.order_by("-proxy_amount").first()

            if instance.bid < highest_proxy.proxy_amount and instance.bid + 100 < highest_proxy.proxy_amount and instance.buyer_id != highest_proxy.buyer_id:
                new_auction_bid = AuctionBids.objects.create(
                    auction_id=instance.auction_id,
                    request_id=instance.request_id,
                    buyer_id=highest_proxy.buyer_id,
                    buyer_user_id=highest_proxy.created_by,
                    bid=instance.bid + 100,
                    status=0
                )

                Notification.objects.create(
                    title="You bid has been crossed",
                    text=f"A buyer has posted a bid of ${instance.bid + 100} higher than your bid ${instance.bid} for auction {instance.auction_id}",
                    priority=PriorityChoices.MEDIUM,
                    user=buyer_user
                )

                Notification.objects.create(
                    title="New Bid from buyer",
                    text=f"A buyer has posted a bid of ${instance.bid + 100} for auction {instance.auction_id}",
                    priority=PriorityChoices.MEDIUM,
                    user=seller_user
                )

                auction.last_bid_id = new_auction_bid
                auction.save()


class OfferNowListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = ActiveBuyingAuctionSerializer
    queryset = Auctions.objects.prefetch_related("request_id").filter(status=0, request_id__status=21)


class CreateAuctionOfferAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionOfferSerializer
    queryset = AuctionOffers.objects.all()


class SoldListAPIView(ListAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionSoldSerializer

    def get_queryset(self):
        user = self.request.user

        return Auctions.objects.select_related('request_id').exclude(dealer_id=user.dealer_id).filter(status=0, request_id__status__gt=4, request_id__status__lt=20)


class AcceptNegotiationBidAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]

    def post(self, request):
        # Use Auction Negotiation here instead of Auction Bid
        # negotiation_id = serializer.validated_data.get("id")

        bid_id = request.data.get("id")
        auction_id = request.data.get("auction_id")

        negotiation = get_object_or_404(AuctionBids, id=bid_id, auction_id=auction_id)
        inspection = get_object_or_404(InspectionRequest, auction_id=auction_id)

        auction_won_data = {
            "auction_id": auction_id,
            "request_id": inspection,
            "buyer_id": negotiation.buyer_id,
            "bid_id": negotiation.id,
            "bid_price": negotiation.bid,
            # "won_type": negotiation.bid_type,
        }

        auction_won, _ = AuctionWon.objects.update_or_create(
            auction_id=auction_id, defaults=auction_won_data
        )

        inspection.buyer_id = negotiation.buyer_id
        inspection.auction_won = auction_won
        inspection.status = 5
        inspection.save()

        AuctionOffers.objects.filter(id=bid_id, auction_id=auction_id).update(is_accepted=True)
        AuctionOffers.objects.filter(auction_id=auction_id).exclude(id=bid_id).update(is_expire=True)
        AuctionOffers.objects.filter(auction_id=auction_id).update(is_expire=True)

        return Response({"response": "Auction Bid accepted"}, status=status.HTTP_200_OK)


class AcceptNegotiationOfferAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsSellerUserPermission]

    def post(self, request):
        offer_id = request.data.get("id")
        auction_id = request.data.get("auction_id")

        offer = get_object_or_404(AuctionOffers, id=offer_id, auction_id=auction_id)
        inspection = get_object_or_404(InspectionRequest, auction_id=auction_id)

        buyer_user = offer.buyer_id.users.first()
        seller_user = offer.dealer_id.users.first()

        auction_won_data = {
            "auction_id": auction_id,
            "request_id": inspection,
            "buyer_id": offer.buyer_id,
            "bid_id": offer.id,
            "bid_price": offer.amount,
            "won_type": 4,
        }

        auction_won, _ = AuctionWon.objects.update_or_create(
            auction_id=auction_id, defaults=auction_won_data
        )

        inspection.buyer_id = offer.buyer_id
        inspection.auction_won = auction_won
        inspection.status = 5
        inspection.save()

        AuctionOffers.objects.filter(id=offer_id, auction_id=auction_id).update(is_accepted=True)
        AuctionOffers.objects.filter(auction_id=auction_id).exclude(id=offer_id).update(is_expire=True)
        AuctionBids.objects.filter(auction_id=auction_id).update(is_expired=True)
        AuctionProxies.objects.filter(auction_id=auction_id).update(is_expire=True)
        # AuctionNegotiations.objects.filter(auction_id=auction_id).update(is_expire=True)

        Notification.objects.create(
            title="Auction Offer Won",
            text=f"Congratulations! You have won the auction with an offer of ${offer.amount} for auction id {auction_id}",
            priority=PriorityChoices.HIGH,
            user=buyer_user
        )

        return Response({"response": "Offer Accepted"}, status=status.HTTP_200_OK)


class BuyerConfirmationAPIView(APIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]

    def post(self, request):
        serializer = BuyerConfirmationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        auction_id = serializer.validated_data.get("auction_id")
        request_id = serializer.validated_data.get("request_id")
        # auction_won_id = serializer.validated_data.get("auction_won_id")

        # Temporary solution
        # auction_id = serializer.validated_data.get("auction_won_id")
        auction_won_id = AuctionWon.objects.filter(auction_id=auction_id).first()


        title_delivery_location = serializer.validated_data.get("title_delivery_location")
        vehicle_delivery_location = serializer.validated_data.get("vehicle_delivery_location")
        buyer_id = request.user.dealer
        buyer_user = buyer_id.users.first()

        request_id.buyer_id = buyer_id
        request_id.buyer_confirmed = True
        request_id.auction_won_id = auction_won_id
        request_id.title_delivery_location = title_delivery_location
        request_id.vehicle_delivery_location = vehicle_delivery_location
        request_id.status = 6

        request_id.save()

        # Update AuctionWon
        AuctionWon.objects.filter(auction_id=auction_id).update(
            buyer_confirmation=True
        )

        seller_user = request_id.dealer.users.first()

        Notification.objects.create(
            title="Auction Buyer Confirmed",
            text=f"Buyer {buyer_user.full_name} has been confirmed for auction id {auction_id}",
            priority=PriorityChoices.HIGH,
            user=seller_user
        )

        send_vehicle_sold_buyer_email(request.user, auction_id)
        send_vehicle_sold_seller_email(seller_user, auction_id)

        # Update AuctionTitles
        # AuctionTitles.objects.filter(auction_id=auction_id).update(
        #     title_delivery_location=title_delivery_location
        # )

        return Response({"message": "Your bid was submitted."}, status=status.HTTP_200_OK)


class BuyNowAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionBuyNowSerializer
    queryset = AuctionWon.objects.all()

    def perform_create(self, serializer):
        buyer = self.request.user.dealer

        instance = serializer.save()

        inspection_request = instance.request_id
        inspection_request.buyer_id = buyer
        inspection_request.auction_won = instance
        inspection_request.status = 5
        inspection_request.save()

        seller_user = inspection_request.dealer.users.first()

        auction = Auctions.objects.get(auction_id=instance.auction_id)
        auction.won_at = datetime.now()
        auction.won_by_id = buyer
        # auction.won_bid_id = bid_id
        auction.won_type = 3
        auction.status = 0
        auction.save()

        instance.buyer_id = buyer
        instance.bid_price = inspection_request.reserve_price
        instance.won_type = 3
        instance.save()

        AuctionOffers.objects.filter(auction_id=instance.auction_id).update(is_expire=True)
        AuctionBids.objects.filter(auction_id=instance.auction_id).update(is_expired=True)
        AuctionProxies.objects.filter(auction_id=instance.auction_id).update(is_expire=True)
        AuctionNegotiations.objects.filter(auction_id=instance.auction_id).update(is_expire=True)

        Notification.objects.create(
            title="Auction Vehicle Sold",
            text=f"Buyer {self.request.user.full_name} has purchased the vehicle for ${inspection_request.reserve_price} that have auction id {auction.auction_id}",
            priority=PriorityChoices.HIGH,
            user=seller_user
        )


class CreateAuctionProxyAPIView(CreateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsBuyerUserPermission]
    serializer_class = AuctionProxySerializer
    queryset = AuctionProxies.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.created_by = self.request.user
        instance.save()
        buyer = self.request.user.dealer

        auction = Auctions.objects.get(auction_id=instance.auction_id)

        latest_bid = auction.last_bid_id

        if latest_bid:
            bid_price = latest_bid.bid + 100
        else:
            bid_price = 100

        new_auction_bid = AuctionBids.objects.create(
            auction_id=instance.auction_id,
            request_id=instance.request_id,
            buyer_id=buyer,
            buyer_user_id=self.request.user,
            bid=bid_price,
            status=0
        )

        auction.last_proxy_id = instance
        auction.last_bid_id = new_auction_bid
        auction.last_proxy_buyer_id = instance.buyer_id
        auction.save()


class StopAuctionLiveAPIView(RetrieveUpdateAPIView):
    permission_classes = [*api_settings.DEFAULT_PERMISSION_CLASSES, IsAdminUserPermission]
    serializer_class = AuctionStopSerializer
    queryset = Auctions.objects.filter(status=1)
    lookup_field = "auction_id"
    lookup_url_kwarg = "auction_id"


class CheckoutSessionCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Create a Stripe Checkout Session for one-time payment
        """
        serializer = CheckoutSessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data.get("amount")
        currency = serializer.validated_data.get("currency", "usd")

        # Get or create a Stripe Customer
        # customer, _ = Customer.get_or_create(subscriber=request.user, livemode=settings.STRIPE_LIVE_MODE)

        # Create Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            # customer=customer.id,
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": serializer.validated_data.get("description", "Vehicle Payment"),
                        },
                        "unit_amount": int(amount * 100),  # Stripe expects amount in cents
                    },
                    "quantity": 1,
                }
            ],
            success_url=os.environ.get("BASE_URL") + "/?success=true",
            cancel_url=os.environ.get("BASE_URL") + "/?canceled=true",
            allow_promotion_codes=True,
        )

        return Response({"session_id": session.id}, status=status.HTTP_200_OK)
