package com.resqlink.api.emergency;

import com.resqlink.api.emergency.dto.EmergencyResponse;
import com.resqlink.api.emergency.dto.TriggerRequest;
import com.resqlink.api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emergencies")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;

    @PostMapping
    public ResponseEntity<EmergencyResponse> trigger(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TriggerRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emergencyService.trigger(user, request));
    }

    @GetMapping("/active")
    public ResponseEntity<EmergencyResponse> getActive(@AuthenticationPrincipal User user) {
        return emergencyService.getActive(user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping
    public List<EmergencyResponse> getHistory(@AuthenticationPrincipal User user) {
        return emergencyService.getHistory(user);
    }

    @PostMapping("/{emergencyId}/resolve")
    public EmergencyResponse resolve(
            @AuthenticationPrincipal User user,
            @PathVariable UUID emergencyId
    ) {
        return emergencyService.close(user, emergencyId, true);
    }

    @PostMapping("/{emergencyId}/cancel")
    public EmergencyResponse cancel(
            @AuthenticationPrincipal User user,
            @PathVariable UUID emergencyId
    ) {
        return emergencyService.close(user, emergencyId, false);
    }
}
