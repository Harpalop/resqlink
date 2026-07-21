package com.resqlink.api.profile.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ProfileRequest(
        @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Blood group must be one of A+, A-, B+, B-, AB+, AB-, O+, O-")
        String bloodGroup,

        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @Size(max = 30, message = "Gender is too long")
        String gender,

        @Min(value = 30, message = "Height looks too small")
        @Max(value = 260, message = "Height looks too large")
        Integer heightCm,

        @Min(value = 2, message = "Weight looks too small")
        @Max(value = 500, message = "Weight looks too large")
        Integer weightKg,

        @Size(max = 2000) String allergies,
        @Size(max = 2000) String medicalConditions,
        @Size(max = 2000) String medications,

        @Size(max = 120) String insuranceProvider,
        @Size(max = 60) String insurancePolicyNumber,

        Boolean organDonor,
        Boolean medicalIdEnabled,

        @Size(max = 2000) String emergencyNotes
) {
}
