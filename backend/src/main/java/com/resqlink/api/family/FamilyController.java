package com.resqlink.api.family;

import com.resqlink.api.family.dto.FamilyDtos.CheckInRequest;
import com.resqlink.api.family.dto.FamilyDtos.CreateGroupRequest;
import com.resqlink.api.family.dto.FamilyDtos.GroupResponse;
import com.resqlink.api.family.dto.FamilyDtos.JoinRequest;
import com.resqlink.api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/family")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @GetMapping("/groups")
    public List<GroupResponse> getMyGroups(@AuthenticationPrincipal User user) {
        return familyService.getMyGroups(user);
    }

    @PostMapping("/groups")
    public ResponseEntity<GroupResponse> createGroup(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateGroupRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(familyService.createGroup(user, request));
    }

    @PostMapping("/groups/join")
    public GroupResponse joinGroup(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody JoinRequest request
    ) {
        return familyService.joinGroup(user, request);
    }

    @PostMapping("/groups/{groupId}/check-in")
    public GroupResponse checkIn(
            @AuthenticationPrincipal User user,
            @PathVariable UUID groupId,
            @Valid @RequestBody CheckInRequest request
    ) {
        return familyService.checkIn(user, groupId, request);
    }

    @DeleteMapping("/groups/{groupId}/membership")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal User user,
            @PathVariable UUID groupId
    ) {
        familyService.leaveGroup(user, groupId);
        return ResponseEntity.noContent().build();
    }
}
