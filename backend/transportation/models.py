from django.db import models


class TransportationChargesSlab(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    km_range_start = models.IntegerField(max_length=256, blank=True, null=True)
    km_range_end = models.IntegerField(max_length=256, blank=True, null=True)
    buyer_charges_per_km = models.CharField(max_length=255, blank=True, null=True)
    transporter_charges_per_km = models.CharField(max_length=255, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Transportation Charges Slab"
        verbose_name_plural = "Transportation Charges Slab"


class TransportationJobTracking(models.Model):
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="transportation_job_tracking", on_delete=models.SET_NULL, null=True, blank=True)
    auction_id = models.CharField(max_length=255, blank=True, null=True)
    job_id = models.ForeignKey("transportation.TransportationJob", related_name="transportation_job_tracking", on_delete=models.SET_NULL, null=True, blank=True)
    status = models.IntegerField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Transportation Job Tracking"
        verbose_name_plural = "Transportation Job Tracking"


class TransportationJobTrackingStatusMsg(models.Model):
    status = models.CharField(max_length=255)
    msg = models.CharField(max_length=255)
    transporter_msg = models.CharField(max_length=255)
    buyer_msg = models.CharField(max_length=255)
    seller_msg = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Transportation Job Tracking Status Msg"
        verbose_name_plural = "Transportation Job Tracking Status Msgs"


class TransportationJob(models.Model):
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="transportation_jobs", on_delete=models.SET_NULL, null=True, blank=True)
    dealer_id = models.ForeignKey("users.Dealership", related_name="seller_transportation_jobs", on_delete=models.SET_NULL, null=True, blank=True)
    auction_id = models.CharField(max_length=255, blank=True, null=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="buyer_transportation_jobs", on_delete=models.SET_NULL, null=True, blank=True)
    transporter_id = models.ForeignKey("users.Transporter", related_name="jobs", on_delete=models.SET_NULL, null=True, blank=True)
    pickup_location = models.ForeignKey("users.DealerLocation", related_name="pickup_transportation_jobs", on_delete=models.SET_NULL, null=True, blank=True)
    drop_location = models.ForeignKey("users.DealerLocation", related_name="drop_transportation_jobs", on_delete=models.SET_NULL, null=True, blank=True)
    distance = models.CharField(max_length=255, blank=True, null=True)
    duration = models.CharField(max_length=255, blank=True, null=True)
    charges_per_mile = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    transport_charges = models.CharField(max_length=255, blank=True, null=True)
    transportation_slab_id = models.ForeignKey("transportation.TransportationChargesSlab", related_name="transportation_jobs", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_dual_gate_key = models.CharField(max_length=255, blank=True, null=True)
    seller_dual_gate_key = models.CharField(max_length=255, blank=True, null=True)
    pickup_type = models.CharField(max_length=255, blank=True, null=True)
    pickup_time = models.DateTimeField(blank=True, null=True)
    drop_time = models.DateTimeField(blank=True, null=True)
    status = models.IntegerField(default=0)
    tracking_status = models.IntegerField(default=0)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Transportation Job"
        verbose_name_plural = "Transportation Jobs"


class TransporterDocument(models.Model):
    transporter_id = models.ForeignKey("users.Transporter", related_name="documents", on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    document = models.FileField(upload_to="transportation", blank=True, null=True)
    issue_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    created_by = models.IntegerField(blank=True, null=True)
    updated_by = models.IntegerField(blank=True, null=True)

    class Meta:
        verbose_name = "Transportation Document"
        verbose_name_plural = "Transportation Documents"
