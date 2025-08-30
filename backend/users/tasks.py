import os
from django.template.loader import render_to_string
from django.conf import settings
from dotenv import load_dotenv

from utils.tasks import send_email

load_dotenv()


def send_dealership_registration_request(user):
    admin_user = os.environ.get("ADMIN_USER")
    base_url = os.environ.get("BASE_URL")

    to_email = [admin_user]
    subject = "Dealership Registration Request"
    message = render_to_string("users/register_user.html", {"email": user.email})
    send_email(subject, message, to_email)
