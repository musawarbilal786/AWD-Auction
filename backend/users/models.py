# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has on_delete set to the desired behavior
#   * Remove managed = False lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from users.managers import CustomUserManager
from users.choices import ContactPreference, DealershipType


class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    personal_email = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(unique=True, max_length=255)
    mobile_no = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    role = models.ForeignKey("users.Role", related_name="users", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    is_staff = models.IntegerField(blank=True, null=True)
    dealer = models.ForeignKey("users.Dealership", related_name="users", on_delete=models.CASCADE, null=True, blank=True)
    dealer_user_role = models.CharField(max_length=256, blank=True, null=True)
    fcm_token = models.CharField(max_length=255, blank=True, null=True)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    password = models.CharField(max_length=255)
    remember_token = models.CharField(max_length=100, blank=True, null=True)
    device_token = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="created_users")
    updated_by = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_users")
    status = models.IntegerField(default=0)
    deleted_at = models.DateTimeField(blank=True, null=True)
    is_transporter = models.IntegerField(blank=True, null=True)
    transporter = models.OneToOneField("users.Transporter", related_name="user", on_delete=models.CASCADE, null=True, blank=True)
    stripe_id = models.CharField(max_length=255, blank=True, null=True)
    pm_type = models.CharField(max_length=255, blank=True, null=True)
    pm_last_four = models.CharField(max_length=4, blank=True, null=True)
    trial_ends_at = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return self.first_name + " " + self.last_name


class Role(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_fixed = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey("users.User", related_name="created_roles", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_roles", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.name


class Dealership(models.Model):
    id = models.BigAutoField(primary_key=True)
    stripe_account_id = models.TextField(blank=True, null=True)
    dealership_type = models.IntegerField(blank=True, null=True)
    dealership_interest = models.IntegerField(blank=True, null=True)
    seller_fees_type_id = models.CharField(max_length=255, blank=True, null=True)
    cars_in_stock = models.IntegerField(blank=True, null=True)
    no_of_locations = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    dealership_name = models.CharField(max_length=255, blank=True, null=True)
    street_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.ForeignKey("utils.City", related_name="dealerships", on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey("utils.State", related_name="dealerships", on_delete=models.SET_NULL, null=True, blank=True)
    zipcode = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    ext = models.CharField(max_length=255, blank=True, null=True)
    cell_number = models.CharField(max_length=255, blank=True, null=True)
    language_preference = models.CharField(max_length=255, blank=True, null=True)
    contact_preference = models.CharField(max_length=255, choices=ContactPreference.choices, default=ContactPreference.PHONE)
    is_active = models.BooleanField(default=True)
    approved = models.IntegerField(default=0)
    status = models.IntegerField(default=0)
    dealer_license = models.FileField(upload_to="dealer_licence", blank=True, null=True)
    business_license = models.FileField(upload_to="business_licence", blank=True, null=True)
    tax_id = models.CharField(max_length=255, blank=True, null=True)
    text_update = models.IntegerField(blank=True, null=True)
    password_created = models.IntegerField(blank=True, null=True)
    retail_certificate = models.FileField(upload_to="retail_certificates", blank=True, null=True)
    referral_code = models.CharField(max_length=255, blank=True, null=True)
    applied_code = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey("users.User", related_name="created_dealerships", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_dealerships", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.dealership_name


class DealerLocation(models.Model):
    user = models.ForeignKey("users.User", related_name="dealership_locations", on_delete=models.CASCADE)
    dealership = models.ForeignKey("users.Dealership", related_name="dealership_locations", on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    zip = models.CharField(max_length=255, blank=True, null=True)
    city = models.ForeignKey("utils.City", related_name="dealer_locations", on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey("utils.State", related_name="dealer_locations", on_delete=models.SET_NULL, null=True, blank=True)
    email = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=255, blank=True, null=True)
    dealer_license = models.TextField(blank=True, null=True)
    business_license = models.TextField(blank=True, null=True)
    retail_certificate = models.TextField(blank=True, null=True)
    is_main = models.IntegerField(blank=True, null=True)
    is_approved = models.IntegerField(blank=True, null=True)
    ticket_id = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", related_name="created_dealer_location", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_dealer_location", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Dealer Locations"

    def __str__(self):
        return self.title


class Transporter(models.Model):
    stripe_account_id = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    street_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.ForeignKey("utils.City", related_name="transporters", on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey("utils.State", related_name="transporters", on_delete=models.SET_NULL, null=True, blank=True)
    zipcode = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    ext = models.CharField(max_length=255, blank=True, null=True)
    cell_number = models.CharField(max_length=255, blank=True, null=True)
    approved = models.IntegerField(default=0)
    status = models.IntegerField(default=0)
    created_by = models.ForeignKey("users.User", related_name="created_transporters", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_transporters", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# class Modules(models.Model):
#     name = models.CharField(max_length=255, blank=True, null=True)
#     slug = models.CharField(max_length=255, blank=True, null=True)
#     parent_id = models.ForeignKey("self", related_name="child_modules", on_delete=models.SET_NULL, null=True, blank=True)
#     for_role_id = models.ForeignKey("users.Role", related_name="modules", )
#     have_child = models.IntegerField()
#     icon_class = models.CharField(max_length=255, blank=True, null=True)
#     sort_by = models.FloatField(blank=True, null=True)
#     status = models.IntegerField()
#     display = models.IntegerField()
#     created_at = models.DateTimeField(blank=True, null=True)
#     updated_at = models.DateTimeField(blank=True, null=True)
#     created_by = models.IntegerField(blank=True, null=True)
#     updated_by = models.IntegerField(blank=True, null=True)
#
#     class Meta:
#         managed = False
#         db_table = 'modules'
#
#
# class ModulesOptions(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     module_id = models.IntegerField()
#     name = models.CharField(max_length=255, blank=True, null=True)
#     key = models.CharField(max_length=255, blank=True, null=True)
#     created_at = models.DateTimeField(blank=True, null=True)
#     updated_at = models.DateTimeField(blank=True, null=True)
#     created_by = models.IntegerField(blank=True, null=True)
#     updated_by = models.IntegerField(blank=True, null=True)
#
#     class Meta:
#         managed = False
#         db_table = 'modules_options'
#
#
# class ModulesOptionsPermissions(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     module_id = models.IntegerField(blank=True, null=True)
#     module_option_id = models.IntegerField()
#     role_id = models.IntegerField()
#     created_at = models.DateTimeField(blank=True, null=True)
#     updated_at = models.DateTimeField(blank=True, null=True)
#     created_by = models.IntegerField(blank=True, null=True)
#     updated_by = models.IntegerField(blank=True, null=True)
#
#     class Meta:
#         managed = False
#         db_table = 'modules_options_permissions'