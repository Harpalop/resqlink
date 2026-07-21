package com.resqlink.api.dashboard;

import com.resqlink.api.blood.BloodRequest;
import com.resqlink.api.blood.BloodRequestRepository;
import com.resqlink.api.blood.DonorProfileRepository;
import com.resqlink.api.contact.EmergencyContactRepository;
import com.resqlink.api.emergency.Emergency;
import com.resqlink.api.emergency.EmergencyRepository;
import com.resqlink.api.emergency.EmergencyStatus;
import com.resqlink.api.profile.MedicalProfileRepository;
import com.resqlink.api.profile.dto.ProfileResponse;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final List<String> BLOOD_GROUPS =
            List.of("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-");

    private final UserRepository userRepository;
    private final MedicalProfileRepository profileRepository;
    private final EmergencyContactRepository contactRepository;
    private final EmergencyRepository emergencyRepository;
    private final DonorProfileRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;

    @Transactional(readOnly = true)
    public DashboardStats getStats(User user) {
        int completion = profileRepository.findByUserId(user.getId())
                .map(profile -> ProfileResponse.from(profile).completionPercent())
                .orElse(0);

        List<Emergency> myEmergencies = emergencyRepository
                .findTop20ByUserIdOrderByCreatedAtDesc(user.getId());
        long active = myEmergencies.stream()
                .filter(emergency -> emergency.getStatus() == EmergencyStatus.ACTIVE)
                .count();

        var myDonor = donorRepository.findByUserId(user.getId());

        return new DashboardStats(
                completion,
                (int) contactRepository.countByUserId(user.getId()),
                myEmergencies.size(),
                active,
                myDonor.isPresent(),
                myDonor.map(donor -> donor.getDonationCount()).orElse(0),
                userRepository.count(),
                donorRepository.countByAvailableTrue(),
                bloodRequestRepository
                        .findTop50ByStatusOrderByCreatedAtDesc(BloodRequest.Status.OPEN).size(),
                emergenciesLast7Days(myEmergencies),
                donorsByBloodGroup()
        );
    }

    private List<DashboardStats.DayCount> emergenciesLast7Days(List<Emergency> emergencies) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        Map<LocalDate, Long> byDay = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            byDay.put(today.minusDays(i), 0L);
        }
        for (Emergency emergency : emergencies) {
            Instant createdAt = emergency.getCreatedAt();
            if (createdAt == null) continue;
            LocalDate day = createdAt.atZone(zone).toLocalDate();
            byDay.computeIfPresent(day, (key, count) -> count + 1);
        }
        return byDay.entrySet().stream()
                .map(entry -> new DashboardStats.DayCount(
                        shortDay(entry.getKey().getDayOfWeek()), entry.getValue()))
                .toList();
    }

    private String shortDay(DayOfWeek day) {
        String name = day.name();
        return name.charAt(0) + name.substring(1, 3).toLowerCase();
    }

    private List<DashboardStats.GroupCount> donorsByBloodGroup() {
        List<DashboardStats.GroupCount> counts = new ArrayList<>();
        var allDonors = donorRepository.findAll();
        for (String group : BLOOD_GROUPS) {
            long count = allDonors.stream()
                    .filter(donor -> donor.isAvailable() && group.equals(donor.getBloodGroup()))
                    .count();
            counts.add(new DashboardStats.GroupCount(group, count));
        }
        return counts;
    }
}
