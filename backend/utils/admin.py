from django.contrib import admin
from utils.models import City, State, Country


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "code",
        "status",
    )

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "code",
        "status",
    )


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "code",
        "status",
    )
