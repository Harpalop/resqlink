package com.resqlink.api.blood;

import com.resqlink.api.blood.dto.BloodRequestCreate;
import com.resqlink.api.blood.dto.BloodRequestResponse;
import com.resqlink.api.blood.dto.DonorRequest;
import com.resqlink.api.blood.dto.DonorResponse;
import com.resqlink.api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blood")
@RequiredArgsConstructor
public class BloodController {

    private final BloodService bloodService;

    // ---- Donor profile ----

    @GetMapping("/donor/me")
    public ResponseEntity<DonorResponse> getMyDonorProfile(@AuthenticationPrincipal User user) {
        return bloodService.getMyDonorProfile(user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping("/donor/me")
    public DonorResponse registerOrUpdate(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DonorRequest request
    ) {
        return bloodService.registerOrUpdateDonor(user, request);
    }

    @PostMapping("/donor/me/donations")
    public DonorResponse recordDonation(@AuthenticationPrincipal User user) {
        return bloodService.recordDonation(user);
    }

    // ---- Search ----

    @GetMapping("/donors")
    public List<DonorResponse> searchDonors(
            @RequestParam String bloodGroup,
            @RequestParam(required = false) String city
    ) {
        return bloodService.searchDonors(bloodGroup, city);
    }

    // ---- Requests ----

    @GetMapping("/requests")
    public List<BloodRequestResponse> getOpenRequests(@AuthenticationPrincipal User user) {
        return bloodService.getOpenRequests(user);
    }

    @PostMapping("/requests")
    public ResponseEntity<BloodRequestResponse> createRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BloodRequestCreate request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bloodService.createRequest(user, request));
    }

    @PostMapping("/requests/{requestId}/fulfill")
    public BloodRequestResponse fulfill(
            @AuthenticationPrincipal User user,
            @PathVariable UUID requestId
    ) {
        return bloodService.closeRequest(user, requestId, true);
    }

    @PostMapping("/requests/{requestId}/close")
    public BloodRequestResponse close(
            @AuthenticationPrincipal User user,
            @PathVariable UUID requestId
    ) {
        return bloodService.closeRequest(user, requestId, false);
    }
}
