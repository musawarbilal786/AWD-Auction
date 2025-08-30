from logging import getLogger

from django.conf import settings
from django.core.mail import EmailMessage

logger = getLogger("awd")


def send_email(email_subject, email_message, to_email):
    email = EmailMessage(
        subject=email_subject,
        body=email_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to_email,
    )
    email.content_subtype = "html"

    try:
        email.send()
    except Exception as e:
        logger.exception(f"Failed to send email to {to_email}. Error {e}")
