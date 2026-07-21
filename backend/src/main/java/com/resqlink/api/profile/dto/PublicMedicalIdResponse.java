package com.resqlink.api.profile.dto;

import com.resqlink.api.contact.EmergencyContact;
import com.resqlink.api.profile.MedicalProfile;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

public record PublicMedicalIdResponse(
        String fullName,
        Integer age,
        String gender,
        String bloodGroup,
        Integer heightCm,
        Integer weightKg,
        String allergies,
        String medicalConditions,
        String medications,
        boolean organDonor,
        String emergencyNotes,
        String insuranceProvider,
        String insurancePolicyNumber,
        List<ContactInfo> emergencyContacts
) {
    public record ContactInfo(String name, String phone, String relationship, int priority) {
        public static ContactInfo from(EmergencyContact contact) {
            return new ContactInfo(
                    contact.getName(),
                    contact.getPhone(),
                    contact.getRelationship(),
                    contact.getPriority()
            );
        }
    }

    public static PublicMedicalIdResponse from(MedicalProfile profile, List<EmergencyContact> contacts) {
        LocalDate dateOfBirth = profile.getDateOfBirth();
        Integer age = dateOfBirth == null
                ? null
                : Period.between(dateOfBirth, LocalDate.now()).getYears();

        return new PublicMedicalIdResponse(
                profile.getUser().getFullName(),
                age,
                profile.getGender(),
                profile.getBloodGroup(),
                profile.getHeightCm(),
                profile.getWeightKg(),
                profile.getAllergies(),
                profile.getMedicalConditions(),
                profile.getMedications(),
                profile.isOrganDonor(),
                profile.getEmergencyNotes(),
                profile.getInsuranceProvider(),
                profile.getInsurancePolicyNumber(),
                contacts.stream().map(ContactInfo::from).toList()
        );
    }
}
