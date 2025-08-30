import os
from django.template.loader import render_to_string
from django.conf import settings
from dotenv import load_dotenv

from utils.tasks import send_email

load_dotenv()


def send_transportation_job_accepted(transporter, job,  auction_id):
    transporter_email = transporter.email
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [transporter_email]
    subject = "Transportation Job Accepted"
    message = render_to_string(
        "transportation/transportation_job_accepted.html",
        {
            "auction_id": auction_id,
            "job_id": job.id,
            "buyer_gate_key": job.buyer_dual_gate_key,
            "seller_gate_key": job.seller_dual_gate_key
        }
    )
    send_email(subject, message, to_email)


def send_transportation_job_completed(transporter, auction_id):
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [admin_user]
    subject = "Transportation Job Completed"
    message = render_to_string("transportation/transportation_job_completed.html", {"auction_id": auction_id})
    send_email(subject, message, to_email)


def send_transportation_job_buyer_gate_key_email(buyer, job, auction_id):
    buyer_email = buyer.email
    buyer_dual_gate_key = job.buyer_dual_gate_key
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [buyer_email]
    subject = "Buyer Dual Gate Key"
    message = render_to_string("transportation/buyer_gate_key.html", {"buyer_dual_gate_key": buyer_dual_gate_key, "auction_id": auction_id})
    send_email(subject, message, to_email)


def send_transportation_job_seller_gate_key_email(seller, job, auction_id):
    seller_email = seller.email
    seller_dual_gate_key = job.seller_dual_gate_key
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [seller_email]
    subject = "Seller Dual Gate Key"
    message = render_to_string("transportation/seller_gate_key.html", {"seller_dual_gate_key": seller_dual_gate_key, "auction_id": auction_id})
    send_email(subject, message, to_email)