from django.db.models import TextChoices


class ContactPreference(TextChoices):
    PHONE = "Phone", "Phone"
    TEXT = "Text", "Text"
    EMAIL = "Email", "Email"


class DealershipType(TextChoices):
    FRANCHISE = "Franchise", "Franchise"
    INDEPENDENT = "Independent", "Independent"
    WHOLESALE = "Wholesale", "Wholesale"
    COMMERCIAL = "Commercial", "Commercial"
