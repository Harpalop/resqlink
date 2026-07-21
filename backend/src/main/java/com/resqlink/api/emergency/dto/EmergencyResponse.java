package com.resqlink.api.emergency.dto;

import com.resqlink.api.emergency.Emergency;
import com.resqlink.api.emergency.EmergencyEvent;
import com.resqlink.api.emergency.EmergencyStatus;
import com.resqlink.api.emergency.EmergencyType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EmergencyResponse(
        UUID id,
        String reference,
        EmergencyType type,
        EmergencyStatus status,
        Double latitude,
        Double longitude,
        Double accuracyMeters,
        String note,
        List<EventInfo> events,
        Instant createdAt,
        Instant closedAt
) {
    public record EventInfo(String label, String detail, Instant createdAt) {
        public static EventInfo from(EmergencyEvent event) {
            return new EventInfo(event.getLabel(), event.getDetail(), event.getCreatedAt());
        }
    }

    public static EmergencyResponse from(Emergency emergency) {
        return new EmergencyResponse(
                emergency.getId(),
                emergency.getReference(),
                emergency.getType(),
                emergency.getStatus(),
                emergency.getLatitude(),
                emergency.getLongitude(),
                emergency.getAccuracyMeters(),
                emergency.getNote(),
                emergency.getEvents().stream().map(EventInfo::from).toList(),
                emergency.getCreatedAt(),
                emergency.getClosedAt()
        );
    }

    /** History rows don't need the full timeline — keeps the payload small. */
    public static EmergencyResponse summary(Emergency emergency) {
        return new EmergencyResponse(
                emergency.getId(),
                emergency.getReference(),
                emergency.getType(),
                emergency.getStatus(),
                emergency.getLatitude(),
                emergency.getLongitude(),
                emergency.getAccuracyMeters(),
                emergency.getNote(),
                List.of(),
                emergency.getCreatedAt(),
                emergency.getClosedAt()
        );
    }
}
