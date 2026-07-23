package com.resqlink.api.contact.dto;

import com.resqlink.api.contact.EmergencyContact;

import java.util.UUID;

public record ContactResponse(
        UUID id,
        String name,
        String phone,
        String email,
        String relationship,
        int priority
) {
    public static ContactResponse from(EmergencyContact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getName(),
                contact.getPhone(),
                contact.getEmail(),
                contact.getRelationship(),
                contact.getPriority()
        );
    }
}
