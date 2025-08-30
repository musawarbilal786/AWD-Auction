from django.db import models


class Auctions(models.Model):
    auction_id = models.CharField(unique=True, max_length=256, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="auctions", on_delete=models.SET_NULL, null=True, blank=True)
    dealer_id = models.ForeignKey("users.Dealership", related_name="auctions", on_delete=models.SET_NULL, null=True, blank=True)
    last_bid_id = models.OneToOneField("auctions.AuctionBids", on_delete=models.SET_NULL, null=True, blank=True)
    last_proxy_id = models.OneToOneField("auctions.AuctionProxies", on_delete=models.SET_NULL, null=True, blank=True)
    last_proxy_buyer_id = models.ForeignKey("users.Dealership", related_name="proxy_buyer_auctions", on_delete=models.SET_NULL, null=True, blank=True)
    expected_price = models.FloatField(blank=True, null=True)
    reserve_price = models.TextField(blank=True, null=True)
    ready_to_sell = models.TextField(blank=True, null=True)
    live_appraisal = models.TextField(blank=True, null=True)
    auction_type = models.TextField(blank=True, null=True, db_comment='1 = start bidding $0 , 2 = start the bid at 50% of reserve price , 3 = $3,000 less than reserve price.')
    bid_start_from_price = models.CharField(max_length=255)
    won_type = models.IntegerField(blank=True, null=True, db_comment='1= Bid, 2= Proxy Bid, 3 = Buy Now')
    won_by_id = models.ForeignKey("users.Dealership", related_name="buyer_auctions", on_delete=models.SET_NULL, null=True, blank=True)
    won_bid_id = models.OneToOneField("auctions.AuctionBids", related_name="won_auction", on_delete=models.SET_NULL, null=True, blank=True)
    won_at = models.DateTimeField(blank=True, null=True)
    credit_use_for_inspection_fee = models.IntegerField(blank=True, null=True)
    credit_use_for_selling_fee = models.IntegerField(blank=True, null=True)
    credit_use_for_buying = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(default=0)
    created_by = models.ForeignKey("users.User", related_name="created_auctions", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_auctions", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Auction {self.id}"


class AuctionBids(models.Model):
    auction_id = models.CharField(max_length=256, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="auction_bids", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="auction_bids", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_user_id = models.ForeignKey("users.User", related_name="buyer_user_auction_bids", on_delete=models.SET_NULL, null=True, blank=True)
    bid = models.IntegerField(blank=True, null=True)
    last_bid = models.IntegerField(blank=True, null=True)
    type = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    is_expired = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", related_name="created_auction_bids", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_auction_bids", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Auction Bid"
        verbose_name_plural = "Auction Bids"


class AuctionNegotiations(models.Model):
    auction_id = models.CharField(max_length=255, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="auction_negotiations", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="buyer_auction_negotiations", on_delete=models.SET_NULL, null=True, blank=True)
    dealer_id = models.ForeignKey("users.Dealership", related_name="seller_auction_negotiations", on_delete=models.SET_NULL, null=True, blank=True)
    bid_id = models.ForeignKey("auctions.AuctionBids", related_name="auction_negotiations", on_delete=models.SET_NULL, null=True, blank=True)
    bid_type = models.IntegerField(blank=True, null=True)
    amount = models.IntegerField(blank=True, null=True)
    changed_amount = models.IntegerField(blank=True, null=True)
    is_accepted = models.IntegerField(blank=True, null=True)
    is_rejected = models.IntegerField(blank=True, null=True)
    is_expire = models.IntegerField(blank=True, null=True)
    price_change_requested_by_buyer = models.BooleanField(default=False)
    price_change_requested_by_seller = models.BooleanField(default=False)
    created_by = models.ForeignKey("users.User", related_name="created_auction_negotiations", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_auction_negotiations", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Auction Negotiation"
        verbose_name_plural = "Auction Negotiations"


class AuctionOffers(models.Model):
    auction_id = models.CharField(max_length=255, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="auction_offers", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="buyer_auction_offers", on_delete=models.SET_NULL, null=True, blank=True)
    dealer_id = models.ForeignKey("users.Dealership", related_name="seller_auction_offers", on_delete=models.SET_NULL, null=True, blank=True)
    offer_type = models.IntegerField(blank=True, null=True)
    amount = models.IntegerField(blank=True, null=True)
    is_accepted = models.IntegerField(blank=True, null=True)
    is_rejected = models.IntegerField(blank=True, null=True)
    is_expire = models.IntegerField(blank=True, null=True)
    price_change_requested_by_buyer = models.BooleanField(default=False)
    price_change_requested_by_seller = models.BooleanField(default=False)
    created_by = models.ForeignKey("users.User", related_name="created_auction_offers", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_auction_offers", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Auction Offer"
        verbose_name_plural = "Auction Offers"


class AuctionProxies(models.Model):
    auction_id = models.CharField(max_length=255, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="auction_proxies", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="buyer_auction_proxies", on_delete=models.SET_NULL, null=True, blank=True)
    proxy_amount = models.IntegerField(blank=True, null=True)
    bid_amount = models.IntegerField(db_comment='this is the last heighest bid amount,if won by proxy then this amount will consider to pay.')
    is_expire = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", related_name="created_auction_proxies", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_auction_proxies", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Auction Proxy"
        verbose_name_plural = "Auction Proxies"


class AuctionWon(models.Model):
    auction_id = models.CharField(unique=True, max_length=256, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="auctions_won", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="buyer_auctions_won", on_delete=models.SET_NULL, null=True, blank=True)
    bid_id = models.CharField(max_length=255, blank=True, null=True)
    bid_price = models.FloatField(blank=True, null=True)
    buyer_confirmation = models.IntegerField(blank=True, null=True)
    won_type = models.IntegerField(blank=True, null=True, db_comment='1= Bid, 2= Proxy Bid, 3 = Buy Now')
    is_expired = models.IntegerField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Auction Won"
        verbose_name_plural = "Auctions Won"

# class AuctionViews(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     uid = models.CharField(max_length=255, blank=True, null=True)
#     auction_id = models.CharField(max_length=255, blank=True, null=True)
#     viewer_id = models.CharField(max_length=255, blank=True, null=True)
#     created_at = models.DateTimeField(blank=True, null=True)
#     updated_at = models.DateTimeField(blank=True, null=True)
#
#