package com.resqlink.api.map;

import com.resqlink.api.emergency.Emergency;
import com.resqlink.api.emergency.EmergencyRepository;
import com.resqlink.api.emergency.EmergencyStatus;
import com.resqlink.api.hospital.Hospital;
import com.resqlink.api.hospital.HospitalRepository;
import com.resqlink.api.user.Role;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Aggregated geo-data for the live map. Hospitals are public to any signed-in
 * user; live SOS locations are privacy-scoped — admins see every active
 * emergency (command-centre view), everyone else sees only their own.
 */
@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {

    private final HospitalRepository hospitalRepository;
    private final EmergencyRepository emergencyRepository;

    public record HospitalPin(UUID id, String name, String city, String phone,
                              boolean emergencyDept, boolean bloodBank, boolean open24x7,
                              double rating, double latitude, double longitude) {
        static HospitalPin from(Hospital h) {
            return new HospitalPin(h.getId(), h.getName(), h.getCity(), h.getPhone(),
                    h.isEmergencyDept(), h.isBloodBank(), h.isOpen24x7(), h.getRating(),
                    h.getLatitude(), h.getLongitude());
        }
    }

    public record EmergencyPin(UUID id, String reference, String type,
                               double latitude, double longitude, Instant createdAt, boolean mine) {
        static EmergencyPin from(Emergency e, UUID viewerId) {
            return new EmergencyPin(e.getId(), e.getReference(), e.getType().name(),
                    e.getLatitude(), e.getLongitude(), e.getCreatedAt(),
                    e.getUser().getId().equals(viewerId));
        }
    }

    public record MapOverview(List<HospitalPin> hospitals, List<EmergencyPin> emergencies) {
    }

    @GetMapping("/overview")
    @Transactional(readOnly = true)
    public MapOverview overview(@AuthenticationPrincipal User user) {
        List<HospitalPin> hospitals = hospitalRepository.findTop50ByOrderByRatingDesc().stream()
                .filter(h -> h.getLatitude() != null && h.getLongitude() != null)
                .map(HospitalPin::from)
                .toList();

        boolean isAdmin = user.getRole() == Role.ADMIN;
        List<Emergency> active = isAdmin
                ? emergencyRepository.findByStatusOrderByCreatedAtDesc(EmergencyStatus.ACTIVE)
                : emergencyRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EmergencyStatus.ACTIVE);

        List<EmergencyPin> emergencies = active.stream()
                .filter(e -> e.getLatitude() != null && e.getLongitude() != null)
                .map(e -> EmergencyPin.from(e, user.getId()))
                .toList();

        return new MapOverview(hospitals, emergencies);
    }
}
