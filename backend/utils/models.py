from django.db import models


class City(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    state = models.ForeignKey("utils.State", related_name="cities", on_delete=models.SET_NULL, null=True, blank=True)
    # is_active = models.BooleanField(default=True)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", related_name="created_cities", on_delete=models.CASCADE, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_cities", on_delete=models.CASCADE, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name


class State(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    country = models.ForeignKey("utils.Country", related_name="states", on_delete=models.SET_NULL, null=True, blank=True)
    status = models.IntegerField(default=0)
    # is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey("users.User", related_name="created_states", on_delete=models.CASCADE, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_states", on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.name


class Country(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    status = models.IntegerField(default=0)
    # is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", related_name="created_countries", on_delete=models.CASCADE, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_countries", on_delete=models.CASCADE, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Countries"

    def __str__(self):
        return self.name
