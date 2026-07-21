package com.resqlink.api.emergency.dto;

import com.resqlink.api.emergency.EmergencyType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TriggerRequest(
        @NotNull(message = "Emergency type is required")
        EmergencyType type,

        @DecimalMin(value = "-90", message = "Invalid latitude")
        @DecimalMax(value = "90", message = "Invalid latitude")
        Double latitude,

        @DecimalMin(value = "-180", message = "Invalid longitude")
        @DecimalMax(value = "180", message = "Invalid longitude")
        Double longitude,

        Double accuracyMeters,

        @Size(max = 1000, message = "Note is too long")
        String note
) {
}
