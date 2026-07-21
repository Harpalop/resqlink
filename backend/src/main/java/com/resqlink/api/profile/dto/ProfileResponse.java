package com.resqlink.api.profile.dto;

import com.resqlink.api.profile.MedicalProfile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

public record ProfileResponse(
        String bloodGroup,
        LocalDate dateOfBirth,
        String gender,
        Integer heightCm,
        Integer weightKg,
        String allergies,
        String medicalConditions,
        String medications,
        String insuranceProvider,
        String insurancePolicyNumber,
        boolean organDonor,
        boolean medicalIdEnabled,
        String emergencyNotes,
        String publicToken,
        int completionPercent,
        Instant updatedAt
) {
    public static ProfileResponse from(MedicalProfile profile) {
        return new ProfileResponse(
                profile.getBloodGroup(),
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getHeightCm(),
                profile.getWeightKg(),
                profile.getAllergies(),
                profile.getMedicalConditions(),
                profile.getMedications(),
                profile.getInsuranceProvider(),
                profile.getInsurancePolicyNumber(),
                profile.isOrganDonor(),
                profile.isMedicalIdEnabled(),
                profile.getEmergencyNotes(),
                profile.getPublicToken(),
                completionPercent(profile),
                profile.getUpdatedAt()
        );
    }

    private static int completionPercent(MedicalProfile profile) {
        List<Object> fields = List.of(
                Objects.toString(profile.getBloodGroup(), ""),
                Objects.toString(profile.getDateOfBirth(), ""),
                Objects.toString(profile.getGender(), ""),
                Objects.toString(profile.getHeightCm(), ""),
                Objects.toString(profile.getWeightKg(), ""),
                Objects.toString(profile.getAllergies(), ""),
                Objects.toString(profile.getMedicalConditions(), ""),
                Objects.toString(profile.getMedications(), ""),
                Objects.toString(profile.getInsuranceProvider(), ""),
                Objects.toString(profile.getInsurancePolicyNumber(), "")
        );
        long filled = fields.stream().filter(value -> !value.toString().isBlank()).count();
        return (int) Math.round(filled * 100.0 / fields.size());
    }
}
