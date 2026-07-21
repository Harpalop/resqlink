package com.resqlink.api.family.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class FamilyDtos {

    private FamilyDtos() {
    }

    public record CreateGroupRequest(
            @NotBlank(message = "Group name is required")
            @Size(min = 2, max = 80, message = "Name must be 2–80 characters")
            String name
    ) {
    }

    public record JoinRequest(
            @NotBlank(message = "Invite code is required")
            @Size(min = 6, max = 8, message = "Invite codes are 6 characters")
            String inviteCode
    ) {
    }

    public record CheckInRequest(
            @Size(max = 120, message = "Note is too long")
            String note
    ) {
    }

    public record MemberResponse(
            UUID userId,
            String name,
            boolean owner,
            boolean me,
            Instant lastCheckInAt,
            String lastCheckInNote
    ) {
    }

    public record GroupResponse(
            UUID id,
            String name,
            String inviteCode,
            boolean owner,
            List<MemberResponse> members,
            Instant createdAt
    ) {
    }
}
