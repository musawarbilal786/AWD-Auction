from rest_framework import serializers

from utils.models import State, City, Country


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            "id",
            "name",
            "code",
            "status",
        )


class StateSerializer(serializers.ModelSerializer):
    country_id = serializers.PrimaryKeyRelatedField(queryset=Country.objects.filter(status=1), write_only=True)
    country = CountrySerializer(read_only=True)

    class Meta:
        model = State
        fields = (
            "id",
            "name",
            "code",
            "status",
            "country",
            "country_id",
        )

    def create(self, validated_data):
        if validated_data.get("country_id"):
            country = validated_data.pop("country_id")
            validated_data["country"] = country

        return super().create(validated_data)


class CitySerializer(serializers.ModelSerializer):
    state_id = serializers.PrimaryKeyRelatedField(queryset=State.objects.filter(status=1), write_only=True)
    state = StateSerializer(read_only=True)

    class Meta:
        model = City
        fields = (
            "id",
            "name",
            "code",
            "status",
            "state",
            "state_id",
        )

    def create(self, validated_data):
        if validated_data.get("state_id"):
            state = validated_data.pop("state_id")
            validated_data["state"] = state

        return super().create(validated_data)
