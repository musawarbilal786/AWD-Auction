from django.db import models


class Inspector(models.Model):
    user = models.ForeignKey("users.User", related_name="inspector", on_delete=models.CASCADE)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    cnic = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    whatsapp_number = models.CharField(max_length=255, blank=True, null=True)
    working_hrs = models.TimeField(blank=True, null=True)
    shift_start = models.TimeField(blank=True, null=True)
    shift_end = models.TimeField(blank=True, null=True)
    state = models.ForeignKey("utils.State", related_name="inspectors", on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey("users.User", related_name="created_inspector", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_inspector", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class InspectionRequest(models.Model):
    dealer = models.ForeignKey("users.Dealership", related_name="inspection_requests", on_delete=models.CASCADE)
    auction_id = models.CharField(max_length=256, blank=True, null=True)
    auction_date = models.DateTimeField(blank=True, null=True)
    auction_status = models.IntegerField(default=0)
    vin = models.CharField(max_length=255, blank=True, null=True)
    older_model = models.IntegerField(blank=True, null=True)
    stock_no = models.CharField(max_length=255, blank=True, null=True)
    days_on_lot = models.CharField(max_length=255, blank=True, null=True)
    inspection_location = models.ForeignKey("users.DealerLocation", related_name="inspection_requests", on_delete=models.SET_NULL, null=True, blank=True)
    year = models.CharField(max_length=255, blank=True, null=True)
    make = models.CharField(max_length=255, blank=True, null=True)
    model = models.CharField(max_length=255, blank=True, null=True)
    trim = models.CharField(max_length=255, blank=True, null=True)
    series = models.CharField(max_length=255, blank=True, null=True)
    cylinders = models.CharField(max_length=255, blank=True, null=True)
    transmission = models.CharField(max_length=255, blank=True, null=True)
    drivetrain = models.CharField(max_length=255, blank=True, null=True)
    odometer = models.CharField(max_length=255, blank=True, null=True)
    unknown_mileage = models.IntegerField(blank=True, null=True)
    title_absent = models.IntegerField(blank=True, null=True)
    title_branded = models.IntegerField(blank=True, null=True)
    mechanical_issue = models.IntegerField(blank=True, null=True)
    frame_damage = models.IntegerField(blank=True, null=True)
    factory_emissions_modified = models.IntegerField(blank=True, null=True)
    driveability_issue = models.IntegerField(blank=True, null=True)
    flood_damage = models.IntegerField(default=0)
    has_blue = models.BooleanField(default=0)
    has_red = models.BooleanField(default=0)
    has_yellow = models.BooleanField(default=0)
    has_green = models.BooleanField(default=0)
    description = models.TextField(blank=True, null=True)
    is_special = models.IntegerField(blank=True, null=True)
    speciality_notes = models.TextField(blank=True, null=True)
    expected_price = models.CharField(max_length=255, blank=True, null=True)
    reserve_price = models.TextField(blank=True, null=True)
    ready_to_sell = models.TextField(blank=True, null=True)
    live_appraisal = models.TextField(blank=True, null=True)
    auction_type = models.TextField(blank=True, null=True, db_comment='1 = start bidding $0 , 2 = start the bid at 50% of reserve price , 3 = $3,000 less than reserve price.')
    rough = models.CharField(max_length=255, blank=True, null=True)
    average = models.CharField(max_length=255, blank=True, null=True)
    clean = models.CharField(max_length=255, blank=True, null=True)
    blackbook_data = models.TextField(blank=True, null=True)
    status = models.IntegerField(default=0)
    inspection_status = models.IntegerField(blank=True, null=True)
    inspector_assigned = models.ForeignKey("inspections.Inspector", related_name="inspection_requests", on_delete=models.SET_NULL, null=True, blank=True)
    inspected_date = models.DateField(blank=True, null=True)
    inspector_reject_reason = models.TextField(blank=True, null=True)
    is_sold = models.IntegerField(blank=True, null=True)
    auction_won_id = models.OneToOneField("auctions.AuctionWon", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_id = models.ForeignKey("users.Dealership", related_name="buyer_inspection_requests", on_delete=models.SET_NULL, null=True, blank=True)
    buyer_confirmed = models.IntegerField(blank=True, null=True)
    payment_on_clearance = models.IntegerField(blank=True, null=True)
    payment_received = models.IntegerField(blank=True, null=True)
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    arbitration_expire_date = models.DateField(blank=True, null=True)
    title_delivery_location = models.ForeignKey("users.DealerLocation", related_name="title_delivery_location_inspection_request", on_delete=models.SET_NULL, null=True, blank=True)
    vehicle_delivery_location = models.ForeignKey("users.DealerLocation", related_name="vehicle_delivery_location_inspection_request", on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey("users.User", related_name="created_inspection_requests", on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey("users.User", related_name="updated_inspection_requests", on_delete=models.SET_NULL, null=True, blank=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    transportation_taken = models.IntegerField(blank=True, null=True)
    transport_job_id = models.OneToOneField("transportation.TransportationJob", on_delete=models.SET_NULL, null=True, blank=True)
    arbitration_taken = models.IntegerField(blank=True, null=True, db_comment='For extended arbitration 0f 30 days')
    arbitration_claim_requested = models.IntegerField(blank=True, null=True, db_comment='if buyer claim for arbitration')
    arbitration_ticket_id = models.OneToOneField("arbitration.TicketArbitrationData", on_delete=models.SET_NULL, null=True, blank=True)
    speciality_approval = models.IntegerField(blank=True, null=True, db_comment='1=approved 2=rejected')
    speciality_ticket_id = models.CharField(max_length=255, blank=True, null=True)
    manual_delivered = models.IntegerField()
    via_api = models.IntegerField()

    def __str__(self):
        return f"Inspection request {self.auction_id}"

    class Meta:
        verbose_name_plural = "Inspection Requests"


class InspectorAssignedRequest(models.Model):
    inspector = models.ForeignKey("inspections.Inspector", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_assigned_requests")
    schedule_day = models.ForeignKey("inspections.InspectorWeekScheduleDay", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_assigned_requests")
    request = models.ForeignKey("inspections.InspectionRequest", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_assigned_requests")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_inspector_assigned_requests")
    updated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_inspector_assigned_requests")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inspector Assigned Request"
        verbose_name_plural = "Inspector Assigned Requests"


class InspectorWeekScheduleDay(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_week_schedule_days")
    inspector = models.ForeignKey("inspections.Inspector", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_week_schedule_days")
    schedule = models.ForeignKey("inspections.InspectorWeekSchedule", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_week_schedule_days")
    week = models.IntegerField(blank=True, null=True)
    day = models.CharField(max_length=255, blank=True, null=True)
    available = models.IntegerField(blank=True, null=True)
    shift_start = models.TimeField(blank=True, null=True)
    shift_end = models.TimeField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_inspector_week_schedule_days")
    updated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_inspector_week_schedule_days")
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inspector Week Schedule Day"
        verbose_name_plural = "Inspector Week Schedule Days"


class InspectorWeekSchedule(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_week_schedules")
    inspector = models.ForeignKey("inspections.Inspector", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_week_schedules")
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_week_schedules")
    updated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_week_schedules")
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inspector Week Schedule"
        verbose_name_plural = "Inspector Week Schedules"


class InspectorWorkingDay(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_working_days")
    inspector = models.ForeignKey("inspections.Inspector", on_delete=models.SET_NULL, null=True, blank=True, related_name="inspector_working_days")
    day = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_working_days")
    updated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_working_days")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inspector Working Day"
        verbose_name_plural = "Inspector Working Days"


class VehicleInspectionReport(models.Model):
    id = models.BigAutoField(primary_key=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="inspection_reports", on_delete=models.CASCADE)
    dealer_id = models.ForeignKey("users.Dealership", related_name="inspection_reports", on_delete=models.CASCADE)
    inspector_id = models.ForeignKey("inspections.Inspector", related_name="inspection_reports", on_delete=models.CASCADE)
    exterior = models.TextField(blank=True, null=True)
    interior = models.TextField(blank=True, null=True)
    mechanical = models.TextField(blank=True, null=True)
    demage_and_rust = models.TextField(blank=True, null=True)
    wheels = models.TextField(blank=True, null=True)
    warning_lights = models.TextField(blank=True, null=True)
    frame = models.TextField(blank=True, null=True)
    drivability = models.TextField(blank=True, null=True)
    yellow = models.IntegerField(blank=True, null=True)
    red = models.IntegerField(blank=True, null=True)
    green = models.IntegerField(blank=True, null=True)
    purple = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_inspection_reports")
    updated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_inspection_reports")
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Vehicle Inspection Report"
        verbose_name_plural = "Vehicle Inspection Reports"


class InspectionSampleImages(models.Model):
    id = models.CharField(primary_key=True, max_length=255)
    field = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=255, blank=True, null=True)
    file = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="created_inspection_sample_images")
    updated_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_inspection_sample_images")
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)


class CarAttributes(models.Model):
    key = models.CharField(max_length=765, blank=True, null=True)
    value = models.CharField(max_length=765, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


class ManualDelivery(models.Model):
    auction_id = models.CharField(max_length=255, blank=True, null=True)
    request_id = models.ForeignKey("inspections.InspectionRequest", related_name="manual_deliveries", blank=True, null=True, on_delete=models.SET_NULL)
    delivered_date = models.DateField(blank=True, null=True)
    recipient_first_name = models.CharField(max_length=765, blank=True, null=True)
    recipient_last_name = models.CharField(max_length=765, blank=True, null=True)
    recipient_email = models.CharField(max_length=765, blank=True, null=True)
    recipient_contact_number = models.CharField(max_length=765, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Manual Delivery"
        verbose_name_plural = "Manual Deliveries"


class ManualAttachment(models.Model):
    manual_delivery_id = models.ForeignKey("inspections.ManualDelivery", related_name="attachments", blank=True, null=True, on_delete=models.SET_NULL)
    file = models.FileField(upload_to="manual-attachments", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Manual Attachment"
        verbose_name_plural = "Manual Attachments"
