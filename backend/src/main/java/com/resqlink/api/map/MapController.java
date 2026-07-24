package com.resqlink.api.map;

import com.resqlink.api.emergency.Emergency;
import com.resqlink.api.emergency.EmergencyRepository;
import com.resqlink.api.emergency.EmergencyStatus;
import com.resqlink.api.facility.EmergencyFacility;
import com.resqlink.api.facility.EmergencyFacilityRepository;
import com.resqlink.api.facility.EmergencyFacility.Type;
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

    private final EmergencyFacilityRepository facilityRepository;
    private final EmergencyRepository emergencyRepository;

    public record HospitalPin(UUID id, String name, String city, String phone,
                              boolean emergencyDept, boolean bloodBank, boolean open24x7,
                              double rating, double latitude, double longitude) {
        static HospitalPin from(EmergencyFacility f) {
            return new HospitalPin(f.getId(), f.getName(), f.getCity(), f.getPhone(),
                    f.isEmergencyDept(), f.isBloodBank(), f.isOpen24x7(), f.getRating(),
                    f.getLatitude(), f.getLongitude());
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
        List<HospitalPin> hospitals = facilityRepository
                .findByTypeInOrderByRatingDesc(List.of(Type.HOSPITAL)).stream()
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
