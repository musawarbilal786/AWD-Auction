import os
from django.template.loader import render_to_string
from django.conf import settings
from dotenv import load_dotenv

from utils.tasks import send_email

load_dotenv()


def send_vehicle_sold_buyer_email(buyer, auction_id):
    buyer_email = buyer.email
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [buyer_email]
    subject = "Vehicle Purchased Successfully"
    message = render_to_string("auctions/vehicle_sold_buyer.html", {"auction_id": auction_id})
    send_email(subject, message, to_email)


def send_vehicle_sold_seller_email(seller, auction_id):
    seller_email = seller.email
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [seller_email]
    subject = "Vehicle Sold Successfully"
    message = render_to_string("auctions/vehicle_sold_seller.html", {"auction_id": auction_id})
    send_email(subject, message, to_email)


def send_auction_bid_won_email(buyer, auction_id):
    admin_user = os.environ.get("ADMIN_USER")
    buyer_email = buyer.email
    base_url = os.environ.get("BASE_URL")

    to_email = [buyer_email]
    subject = "Auction Bid Won"
    message = render_to_string("auctions/bid_won.html", {"auction_id": auction_id})
    send_email(subject, message, to_email)
