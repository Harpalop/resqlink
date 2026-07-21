package com.resqlink.api.blood.dto;

import com.resqlink.api.blood.BloodRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BloodRequestCreate(
        @NotBlank(message = "Blood group is required")
        @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group")
        String bloodGroup,

        @NotNull(message = "Units are required")
        @Min(value = 1, message = "At least 1 unit")
        @Max(value = 20, message = "At most 20 units")
        Integer units,

        @NotNull(message = "Urgency is required")
        BloodRequest.Urgency urgency,

        @NotBlank(message = "Hospital name is required")
        @Size(max = 120)
        String hospitalName,

        @NotBlank(message = "City is required")
        @Size(min = 2, max = 80)
        String city,

        @Size(max = 120)
        String patientName,

        @Pattern(regexp = "^[+0-9 ()-]{7,20}$", message = "Enter a valid phone number")
        String contactPhone,

        @Size(max = 1000)
        String note
) {
}
