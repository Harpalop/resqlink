package com.resqlink.api.gamification;

import com.resqlink.api.blood.DonorProfileRepository;
import com.resqlink.api.contact.EmergencyContactRepository;
import com.resqlink.api.emergency.EmergencyRepository;
import com.resqlink.api.family.FamilyMemberRepository;
import com.resqlink.api.profile.MedicalProfileRepository;
import com.resqlink.api.profile.dto.ProfileResponse;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * Achievements are computed live from actual activity — no extra tables needed.
 */
@RestController
@RequestMapping("/api/v1/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final MedicalProfileRepository profileRepository;
    private final EmergencyContactRepository contactRepository;
    private final EmergencyRepository emergencyRepository;
    private final DonorProfileRepository donorRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public record Achievement(String id, String title, String description,
                              boolean unlocked, int points) {
    }

    public record AchievementSummary(int totalPoints, int level, String levelName,
                                     int unlockedCount, List<Achievement> achievements) {
    }

    private static final String[] LEVEL_NAMES =
            {"Newcomer", "Guardian", "Protector", "Lifesaver", "Hero", "Legend"};

    @GetMapping
    @Transactional(readOnly = true)
    public AchievementSummary getAchievements(@AuthenticationPrincipal User user) {
        int completion = profileRepository.findByUserId(user.getId())
                .map(profile -> ProfileResponse.from(profile).completionPercent())
                .orElse(0);
        long contacts = contactRepository.countByUserId(user.getId());
        long emergencies = emergencyRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId()).size();
        var donor = donorRepository.findByUserId(user.getId());
        int donations = donor.map(profile -> profile.getDonationCount()).orElse(0);
        boolean inFamily = !familyMemberRepository.findByUserId(user.getId()).isEmpty();

        List<Achievement> achievements = new ArrayList<>(List.of(
                new Achievement("first-steps", "First Steps",
                        "Create your ResQLink account", true, 10),
                new Achievement("identity", "Identity Ready",
                        "Complete 50% of your medical profile", completion >= 50, 20),
                new Achievement("fully-armed", "Fully Prepared",
                        "Complete 100% of your medical profile", completion >= 100, 40),
                new Achievement("safety-net", "Safety Net",
                        "Add your first emergency contact", contacts >= 1, 20),
                new Achievement("inner-circle", "Inner Circle",
                        "Add 3 or more emergency contacts", contacts >= 3, 30),
                new Achievement("responder", "Responder",
                        "Use the Smart SOS system", emergencies >= 1, 25),
                new Achievement("donor-heart", "Donor at Heart",
                        "Register as a blood donor", donor.isPresent(), 30),
                new Achievement("lifeblood", "Lifeblood",
                        "Log your first blood donation", donations >= 1, 50),
                new Achievement("triple-saver", "Triple Saver",
                        "Log 3 blood donations", donations >= 3, 80),
                new Achievement("family-first", "Family First",
                        "Join or create a family safety group", inFamily, 30)
        ));

        int totalPoints = achievements.stream()
                .filter(Achievement::unlocked)
                .mapToInt(Achievement::points)
                .sum();
        int level = Math.min(totalPoints / 60, LEVEL_NAMES.length - 1);
        long unlockedCount = achievements.stream().filter(Achievement::unlocked).count();

        return new AchievementSummary(totalPoints, level + 1, LEVEL_NAMES[level],
                (int) unlockedCount, achievements);
    }
}
