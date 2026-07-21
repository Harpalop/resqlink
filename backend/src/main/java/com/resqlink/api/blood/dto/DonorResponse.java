package com.resqlink.api.blood.dto;

import com.resqlink.api.blood.DonorProfile;

import java.time.LocalDate;
import java.util.UUID;

public record DonorResponse(
        UUID id,
        String name,
        String bloodGroup,
        String city,
        boolean available,
        LocalDate lastDonationDate,
        int donationCount,
        boolean eligibleToDonate
) {
    /** Donors must wait 90 days between whole-blood donations. */
    public static DonorResponse from(DonorProfile donor) {
        LocalDate lastDonation = donor.getLastDonationDate();
        boolean eligible = lastDonation == null || lastDonation.plusDays(90).isBefore(LocalDate.now().plusDays(1));
        return new DonorResponse(
                donor.getId(),
                donor.getUser().getFullName(),
                donor.getBloodGroup(),
                donor.getCity(),
                donor.isAvailable(),
                lastDonation,
                donor.getDonationCount(),
                eligible
        );
    }
}
