package com.resqlink.api.profile;

import com.resqlink.api.profile.dto.PublicMedicalIdResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public, unauthenticated endpoint used by first responders who scan a
 * Smart Medical ID QR code. Exposes only what the owner has enabled.
 */
@RestController
@RequestMapping("/api/v1/medical-id")
@RequiredArgsConstructor
public class PublicMedicalIdController {

    private final ProfileService profileService;

    @GetMapping("/{token}")
    public PublicMedicalIdResponse getPublicMedicalId(@PathVariable String token) {
        return profileService.getPublicMedicalId(token);
    }
}
