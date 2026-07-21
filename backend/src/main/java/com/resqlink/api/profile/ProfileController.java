package com.resqlink.api.profile;

import com.resqlink.api.profile.dto.ProfileRequest;
import com.resqlink.api.profile.dto.ProfileResponse;
import com.resqlink.api.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ProfileResponse getProfile(@AuthenticationPrincipal User user) {
        return profileService.getProfile(user);
    }

    @PutMapping
    public ProfileResponse updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileRequest request
    ) {
        return profileService.updateProfile(user, request);
    }

    @PostMapping("/medical-id/regenerate")
    public ProfileResponse regenerateToken(@AuthenticationPrincipal User user) {
        return profileService.regeneratePublicToken(user);
    }
}
