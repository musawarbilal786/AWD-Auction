from django.contrib import admin

from auctions.models import Auctions, AuctionBids, AuctionOffers, AuctionNegotiations, AuctionWon

@admin.register(Auctions)
class AuctionsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "request_id",
    )
# Register your models here.

@admin.register(AuctionBids)
class AuctionBidsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
    )

@admin.register(AuctionOffers)
class AuctionOffersAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )

@admin.register(AuctionWon)
class AuctionWonAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "auction_id",
    )

@admin.register(AuctionNegotiations)
class AuctionNegotiationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
    )
