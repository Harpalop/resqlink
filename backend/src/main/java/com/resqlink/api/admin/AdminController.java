package com.resqlink.api.admin;

import com.resqlink.api.blood.BloodRequest;
import com.resqlink.api.blood.BloodRequestRepository;
import com.resqlink.api.blood.DonorProfileRepository;
import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.emergency.EmergencyRepository;
import com.resqlink.api.hospital.HospitalRepository;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EmergencyRepository emergencyRepository;
    private final DonorProfileRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final HospitalRepository hospitalRepository;

    public record AdminUserRow(UUID id, String fullName, String email, String role,
                               boolean enabled, Instant createdAt) {
    }

    public record PlatformStats(long users, long emergencies, long donors,
                                long openBloodRequests, long hospitals) {
    }

    @GetMapping("/stats")
    public PlatformStats stats() {
        return new PlatformStats(
                userRepository.count(),
                emergencyRepository.count(),
                donorRepository.count(),
                bloodRequestRepository
                        .findTop50ByStatusOrderByCreatedAtDesc(BloodRequest.Status.OPEN).size(),
                hospitalRepository.count());
    }

    @GetMapping("/users")
    public List<AdminUserRow> users() {
        return userRepository
                .findAll(PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(user -> new AdminUserRow(user.getId(), user.getFullName(), user.getEmail(),
                        user.getRole().name(), user.isEnabled(), user.getCreatedAt()))
                .toList();
    }

    @PostMapping("/users/{userId}/toggle-enabled")
    @Transactional
    public AdminUserRow toggleEnabled(@AuthenticationPrincipal User admin, @PathVariable UUID userId) {
        if (admin.getId().equals(userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "You cannot disable your own account");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return new AdminUserRow(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), user.isEnabled(), user.getCreatedAt());
    }
}
