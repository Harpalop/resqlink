package com.resqlink.api.profile;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.contact.EmergencyContactRepository;
import com.resqlink.api.profile.dto.ProfileRequest;
import com.resqlink.api.profile.dto.ProfileResponse;
import com.resqlink.api.profile.dto.PublicMedicalIdResponse;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final MedicalProfileRepository profileRepository;
    private final EmergencyContactRepository contactRepository;

    @Transactional
    public ProfileResponse getProfile(User user) {
        return ProfileResponse.from(getOrCreate(user));
    }

    @Transactional
    public ProfileResponse updateProfile(User user, ProfileRequest request) {
        MedicalProfile profile = getOrCreate(user);

        profile.setBloodGroup(blankToNull(request.bloodGroup()));
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setGender(blankToNull(request.gender()));
        profile.setHeightCm(request.heightCm());
        profile.setWeightKg(request.weightKg());
        profile.setAllergies(blankToNull(request.allergies()));
        profile.setMedicalConditions(blankToNull(request.medicalConditions()));
        profile.setMedications(blankToNull(request.medications()));
        profile.setInsuranceProvider(blankToNull(request.insuranceProvider()));
        profile.setInsurancePolicyNumber(blankToNull(request.insurancePolicyNumber()));
        profile.setEmergencyNotes(blankToNull(request.emergencyNotes()));
        if (request.organDonor() != null) {
            profile.setOrganDonor(request.organDonor());
        }
        if (request.medicalIdEnabled() != null) {
            profile.setMedicalIdEnabled(request.medicalIdEnabled());
        }

        return ProfileResponse.from(profileRepository.save(profile));
    }

    @Transactional
    public ProfileResponse regeneratePublicToken(User user) {
        MedicalProfile profile = getOrCreate(user);
        profile.setPublicToken(MedicalProfile.newPublicToken());
        return ProfileResponse.from(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public PublicMedicalIdResponse getPublicMedicalId(String token) {
        MedicalProfile profile = profileRepository.findByPublicToken(token)
                .filter(MedicalProfile::isMedicalIdEnabled)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Medical ID not found or disabled"));

        return PublicMedicalIdResponse.from(
                profile,
                contactRepository.findByUserIdOrderByPriorityAscCreatedAtAsc(profile.getUser().getId())
        );
    }

    private MedicalProfile getOrCreate(User user) {
        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(MedicalProfile.builder()
                        .user(user)
                        .publicToken(MedicalProfile.newPublicToken())
                        .build()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
