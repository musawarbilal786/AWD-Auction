from datetime import datetime

from auctions.models import Auctions, AuctionWon, AuctionOffers, AuctionBids
from communications.choices import PriorityChoices
from communications.models import Notification


def handle_negotiation_bid(instance):
    auction_id = instance.auction_id
    inspection = instance.request_id
    buyer = instance.buyer_id
    bid_id = instance.bid_id
    auction = Auctions.objects.get(auction_id=auction_id)

    if instance.is_accepted and instance.is_accepted == 1:
        auction_won_data = {
            "auction_id": instance.auction_id,
            "request_id": instance.request_id,
            "buyer_id": instance.buyer_id,
            "bid_id": instance.bid_id,
            "bid_price": instance.changed_amount,
            "won_type": 1,
        }

        auction_won, _ = AuctionWon.objects.update_or_create(
            auction_id=instance.auction_id, defaults=auction_won_data
        )

        auction.won_at = datetime.now()
        auction.won_by_id = buyer
        auction.won_bid_id = bid_id
        auction.won_type = 1
        auction.save()

        inspection.buyer_id = buyer
        inspection.auction_won = auction_won
        inspection.auction_won_id = auction_won
        inspection.is_sold = 1

        inspection.status = 5
        inspection.save()

        instance.price_change_requested_by_buyer = False
        instance.price_change_requested_by_seller = False
        instance.save()

        buyer_user = buyer.users.first()
        seller_user = inspection.dealer.users.first()

        Notification.objects.create(
            title="Auction Won",
            text=f"Buyer and Seller agreed on a price ${instance.changed_amount} for auction {auction.auction_id}",
            priority=PriorityChoices.HIGH,
            user=buyer_user
        )

        Notification.objects.create(
            title="Auction Won",
            text=f"Buyer and Seller agreed on a price ${instance.changed_amount} for auction {auction.auction_id}",
            priority=PriorityChoices.HIGH,
            user=seller_user
        )

        # AuctionBids.objects.filter(id=bid_id.id, auction_id=auction_id).update(is_accepted=True)
        AuctionBids.objects.filter(auction_id=auction_id).exclude(id=bid_id.id).update(is_expired=True)
        AuctionOffers.objects.filter(auction_id=auction_id).update(is_expire=True)

    elif instance.is_rejected and instance.is_rejected == 1:
        bid_id.status = 0
        bid_id.save()

        instance.price_change_requested_by_buyer = False
        instance.price_change_requested_by_seller = False
        instance.save()

    else:
        instance.save()
