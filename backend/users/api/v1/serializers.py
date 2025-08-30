from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.contrib.auth import get_user_model

from inspections.models import Inspector
from users.models import Dealership, Role, DealerLocation, Transporter
from utils.api.v1.serializers import StateSerializer, CitySerializer
from utils.models import State, City

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
        )

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True, write_only=True)
    password = serializers.CharField(max_length=255, required=True, write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]

        user = get_object_or_404(User, email=email)

        if not check_password(password, user.password):
            raise serializers.ValidationError({"error": "Incorrect password"})

        if not user.status == 1 or user.is_active == False:
            raise serializers.ValidationError({"error": "User account is inactive"})

        attrs['user'] = user

        return attrs


class DealershipRegistrationSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(max_length=255, required=True)
    contact_preference = serializers.CharField(max_length=255, default="Phone")
    dealership_name = serializers.CharField(max_length=255, required=True)
    street_name = serializers.CharField(max_length=255, required=True)
    tax_id = serializers.CharField(max_length=255, required=True)
    website = serializers.CharField(max_length=255)
    city_name = serializers.CharField(max_length=255, required=True, write_only=True)
    city = CitySerializer(read_only=True)
    dealer_license = serializers.FileField(required=True)
    business_license = serializers.FileField(required=True)
    retail_certificate = serializers.FileField(required=True)
    state_id = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), write_only=True)
    state = StateSerializer(read_only=True)
    zipcode = serializers.CharField(max_length=255, required=True)
    dealership_type = serializers.IntegerField(required=True)
    dealership_interest = serializers.IntegerField(required=True)
    no_of_locations = serializers.CharField(max_length=255, required=True)
    cars_in_stock = serializers.IntegerField(required=True)
    referral_code = serializers.CharField(max_length=255)
    #missing field hear about awd
    text_update = serializers.IntegerField()

    class Meta:
        model = Dealership
        fields = (
            "id",
            "phone_number",
            "contact_preference",
            "dealership_name",
            "street_name",
            "tax_id",
            "website",
            "city_name",
            "city",
        "dealer_license",
        "business_license",
        "retail_certificate",
        "state_id",
        "state",
        "zipcode",
        "dealership_type",
        "dealership_interest",
        "no_of_locations",
        "cars_in_stock",
        "referral_code",
        "text_update",
        )


class BuyerSellerRegistrationSerializer(serializers.ModelSerializer):
    dealer = DealershipRegistrationSerializer(read_only=True)
    first_name = serializers.CharField(max_length=255, required=True)
    last_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField()
    mobile_no = serializers.CharField(max_length=50)
    phone_number = serializers.CharField(max_length=255, required=True, write_only=True)
    contact_preference = serializers.CharField(max_length=255, default="Phone", write_only=True)
    dealership_name = serializers.CharField(max_length=255, required=True, write_only=True)
    street_name = serializers.CharField(max_length=255, required=True, write_only=True)
    tax_id = serializers.CharField(max_length=255, required=True, write_only=True)
    website = serializers.CharField(max_length=255, write_only=True)
    city_name = serializers.CharField(max_length=255, required=True, write_only=True)
    city = CitySerializer(read_only=True)
    dealer_license = serializers.FileField(required=True, write_only=True)
    business_license = serializers.FileField(required=True, write_only=True)
    retail_certificate = serializers.FileField(required=True, write_only=True)
    state_id = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), write_only=True)
    zipcode = serializers.CharField(max_length=255, required=True, write_only=True)
    dealership_type = serializers.IntegerField(required=True, write_only=True)
    dealership_interest = serializers.IntegerField(required=True, write_only=True)
    no_of_locations = serializers.CharField(max_length=255, required=True, write_only=True)
    cars_in_stock = serializers.IntegerField(required=True, write_only=True)
    referral_code = serializers.CharField(max_length=255, write_only=True)
    # missing field hear about awd
    text_update = serializers.IntegerField(write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "mobile_no",
            "phone_number",
            "dealer",
            "contact_preference",
            "dealership_name",
            "street_name",
            "tax_id",
            "website",
            "city_name",
            "city",
            "dealer_license",
            "business_license",
            "retail_certificate",
            "state_id",
            "zipcode",
            "dealership_type",
            "dealership_interest",
            "no_of_locations",
            "cars_in_stock",
            "referral_code",
            "text_update",
        )

    def validate(self, attrs):
        users_email = User.objects.values_list("email", flat=True).distinct()

        if attrs["email"] in users_email:
            raise serializers.ValidationError({"error": "Email already exists"})

        return attrs

    def create(self, validated_data):
        city, created = City.objects.get_or_create(name=validated_data.get("city_name"), defaults={"status": 1})

        dealership = Dealership.objects.create(
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            email=validated_data.get("email"),
            dealership_name=validated_data.get("dealership_name"),
            street_name=validated_data.get("street_name"),
            phone_number=validated_data.get("phone_number"),
            tax_id=validated_data.get("tax_id"),
            website=validated_data.get("website"),
            city=city,
            dealer_license=validated_data.get("dealer_license"),
            business_license=validated_data.get("business_license"),
            retail_certificate=validated_data.get("retail_certificate"),
            state=validated_data.get("state_id"),
            zipcode=validated_data.get("zipcode"),
            dealership_type=validated_data.get("dealership_type"),
            dealership_interest=validated_data.get("dealership_interest"),
            no_of_locations=validated_data.get("no_of_locations"),
            cars_in_stock=validated_data.get("cars_in_stock"),
            referral_code=validated_data.get("referral_code"),
            text_update=validated_data.get("text_update"),
        )

        if validated_data["dealership_interest"] == 1:
            role_name = "SELLER"
        elif validated_data["dealership_interest"] == 2:
            role_name = "BUYER"
        else:
            role_name = "BOTH"

        role = Role.objects.get(name=role_name, status=1)
        
        user = User.objects.create(
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            email=validated_data.get("email"),
            mobile_no=validated_data.get("mobile_no"),
            dealer=dealership,
            role=role,
        )

        dealership_location_title = validated_data.get("dealership_name") + " " + city.name
        is_main = False if DealerLocation.objects.filter(dealership=dealership).exists() else True

        DealerLocation.objects.create(
            user=user,
            dealership=dealership,
            title=dealership_location_title,
            address=validated_data.get("street_name"),
            zip=validated_data.get("zipcode"),
            city=city,
            state=validated_data.get("state_id"),
            email=validated_data.get("email"),
            phone=validated_data.get("phone_number"),
            is_main=is_main,
        )

        return user


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "description",
            "is_fixed",
            "status",
        )


class UsersListSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "mobile_no",
            "status",
            "role",
        )

class UserDetailSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    password = serializers.CharField(max_length=255, write_only=True)
    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "personal_email",
            "mobile_no",
            "address",
            "password",
            "status",
            "role",
        )

    def validate(self, attrs):
        user_id = self.context['request'].parser_context['kwargs'].get('pk')
        user = User.objects.get(id=user_id)

        if not user:
            raise serializers.ValidationError({"user": "User not found"})

        if attrs.get('status') and not attrs.get('password') and not user.password:
            raise serializers.ValidationError({"password": "Password is required"})

        return attrs

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)

        if validated_data.get("password"):
            instance.set_password(validated_data.get('password'))
            instance.save()

        return instance


class UserAddSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=255, required=True)
    last_name = serializers.CharField(max_length=255, required=True)
    password = serializers.CharField(max_length=255, required=True, write_only=True)
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.filter(name__in=["SUPER_ADMIN", "ADMIN", "MANAGER", "INSPECTOR"], status=1, is_active=True), required=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "personal_email",
            "mobile_no",
            "status",
            "address",
            "role_id",
            "role",
            "password",
        )

    def validate(self, attrs):
        users_email = User.objects.values_list("email", flat=True).distinct()

        if attrs["email"] in users_email:
            raise serializers.ValidationError({"error": "Email already exists"})

        if attrs.get("role_name") in ["BUYER", "SELLER", "BOTH"]:
            raise serializers.ValidationError({"error": "Role shouldn't be BUYER or SELLER"})

        return attrs

    def create(self, validated_data):
        # role, created = Role.objects.get_or_create(
        #     name = validated_data.get('role_name'),
        #     defaults = {"status": 1}
        #     )

        user = User.objects.create(
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
            email=validated_data.get("email"),
            mobile_no=validated_data.get("mobile_no"),
            role=validated_data.get("role_id"),
            status=1
        )

        if validated_data.get("role_id").name == "INSPECTOR":
            Inspector.objects.create(
                user=user,
                first_name=validated_data.get("first_name"),
                last_name=validated_data.get("last_name"),
                email=validated_data.get("email"),
                phone_number=validated_data.get("mobile_no"),
                state=1,
                created_by=self.context["request"].user
            )

        user.set_password(validated_data.get('password'))
        user.save()

        return user


class DealershipSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=255, required=True)
    last_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    # password = serializers.CharField(write_only=True)
    contact_preference = serializers.CharField(max_length=255, default="Phone")
    approved = serializers.IntegerField(required=True)
    website = serializers.CharField(max_length=255)
    dealer_license = serializers.FileField(required=True)
    business_license = serializers.FileField(required=True)
    retail_certificate = serializers.FileField(required=True)
    dealership_type = serializers.IntegerField(required=True)
    dealership_interest = serializers.IntegerField(required=True)
    seller_fees_type_id = serializers.CharField(required=True)
    city_name = serializers.CharField(max_length=255, required=True, write_only=True)
    city = CitySerializer(read_only=True)
    state_id = serializers.PrimaryKeyRelatedField(queryset=State.objects.all())
    state = StateSerializer(read_only=True)
    zipcode = serializers.CharField(max_length=255, required=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)

    class Meta:
        model = Dealership
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            # "password",
            "phone_number",
            "ext",
            "cell_number",
            "contact_preference",
            "approved",
            "dealership_type",
            "dealership_interest",
            "seller_fees_type_id",
            "dealership_name",
            "street_name",
            "city_name",
            "city",
            "state_id",
            "state",
            "zipcode",
            "website",
            "no_of_locations",
            "cars_in_stock",
            "dealer_license",
            "business_license",
            "retail_certificate",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def create(self, validated_data):
        if validated_data.get("city_name"):
            city_name = validated_data.pop("city_name")
            city, created = City.objects.get_or_create(name=city_name, defaults={"status": 1})
            validated_data["city"] = city

        if validated_data.get("state_id"):
            state = validated_data.pop("state_id")
            validated_data["state"] = state

        instance = super().create(validated_data)

        instance.created_by = self.context["request"].user
        instance.save()

        # dealership_location_title = validated_data.get("dealership_name") + city.name
        # is_main = False if DealerLocation.objects.filter(dealership=instance).exists() else True
        # created_by = self.context["request"].user
        #
        # DealerLocation.objects.create(
        #     user=user,
        #     dealership=instance,
        #     title=dealership_location_title,
        #     address=validated_data.get("street_name"),
        #     zip=validated_data.get("zipcode"),
        #     city=city,
        #     state=validated_data.get("state_id"),
        #     email=validated_data.get("email"),
        #     phone=validated_data.get("phone_number"),
        #     is_main=is_main,
        #     created_by=created_by
        # )

        return instance

    def update(self, instance, validated_data):
        if validated_data.get("city_name"):
            city_name = validated_data.pop("city_name")
            city, created = City.objects.get_or_create(name=city_name, defaults={"status": 1})
            validated_data["city"] = city

        if validated_data.get("state_id"):
            state = validated_data.pop("state_id")
            validated_data["state"] = state

        if validated_data.get("approved") == 4:
            instance.dealership_locations.all().update(is_approved=1)

        # if validated_data.get("password") and instance.users.exists():
        #     user = instance.users.first()
        #     password = validated_data.pop("password")
        #     user.set_password(password)
        #     user.status = 1
        #     user.save(update_fields=["password", "status"])

        instance.updated_by = self.context["request"].user
        instance = super().update(instance, validated_data)

        return instance


class DealerLocationSerializer(serializers.ModelSerializer):
    is_approved = serializers.IntegerField(default=0)
    is_main = serializers.IntegerField(default=0)
    dealership = DealershipSerializer(read_only=True)
    user = UserDetailSerializer(read_only=True)
    city_name = serializers.CharField(max_length=255, write_only=True, required=True)
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), required=True)
    city = CitySerializer(read_only=True)
    state_detail = StateSerializer(read_only=True)


    class Meta:
        model = DealerLocation
        fields = (
            "id",
            "title",
            "address",
            "zip",
            "email",
            "phone",
            "is_approved",
            "is_main",
            "user",
            "dealership",
            "city_name",
            "city",
            "state",
            "state_detail",
        )

    def create(self, validated_data):
        dealership = self.context["request"].user.dealer

        city_name = validated_data.pop("city_name")
        city, created = City.objects.get_or_create(name=city_name, defaults={"status": 1})

        validated_data["city"] = city
        validated_data["dealership"] = dealership
        validated_data["user"] = self.context["request"].user
        validated_data["created_by"] = self.context["request"].user

        return super().create(validated_data)


class RestoreInactiveUserSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = User
        fields = (
            "id",
            "is_active",
        )


class RestoreInactiveRoleSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = Role
        fields = (
            "id",
            "is_active",
        )


class RestoreInactiveDealershipSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=True)

    class Meta:
        model = Dealership
        fields = (
            "id",
            "is_active",
        )


class TransporterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transporter
        fields = "__all__"
