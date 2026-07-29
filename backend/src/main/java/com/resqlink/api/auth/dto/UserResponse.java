package com.resqlink.api.auth.dto;

import com.resqlink.api.user.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String role,
        String profilePictureUrl,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getProfilePictureUrl(),
                user.getCreatedAt()
        );
    }
}
