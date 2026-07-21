package com.resqlink.api.blood.dto;

import com.resqlink.api.blood.BloodRequest;

import java.time.Instant;
import java.util.UUID;

public record BloodRequestResponse(
        UUID id,
        String bloodGroup,
        int units,
        BloodRequest.Urgency urgency,
        BloodRequest.Status status,
        String hospitalName,
        String city,
        String patientName,
        String contactPhone,
        String note,
        String requesterName,
        boolean mine,
        Instant createdAt
) {
    public static BloodRequestResponse from(BloodRequest request, UUID currentUserId) {
        return new BloodRequestResponse(
                request.getId(),
                request.getBloodGroup(),
                request.getUnits(),
                request.getUrgency(),
                request.getStatus(),
                request.getHospitalName(),
                request.getCity(),
                request.getPatientName(),
                request.getContactPhone(),
                request.getNote(),
                request.getRequester().getFullName(),
                request.getRequester().getId().equals(currentUserId),
                request.getCreatedAt()
        );
    }
}
