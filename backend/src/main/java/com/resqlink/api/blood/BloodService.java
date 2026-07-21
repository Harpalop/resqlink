package com.resqlink.api.blood;

import com.resqlink.api.blood.dto.BloodRequestCreate;
import com.resqlink.api.blood.dto.BloodRequestResponse;
import com.resqlink.api.blood.dto.DonorRequest;
import com.resqlink.api.blood.dto.DonorResponse;
import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BloodService {

    private final DonorProfileRepository donorRepository;
    private final BloodRequestRepository requestRepository;

    // ---- Donor profile ----

    @Transactional(readOnly = true)
    public Optional<DonorResponse> getMyDonorProfile(User user) {
        return donorRepository.findByUserId(user.getId()).map(DonorResponse::from);
    }

    @Transactional
    public DonorResponse registerOrUpdateDonor(User user, DonorRequest request) {
        DonorProfile donor = donorRepository.findByUserId(user.getId())
                .orElseGet(() -> DonorProfile.builder().user(user).build());

        donor.setBloodGroup(request.bloodGroup());
        donor.setCity(request.city().trim());
        if (request.available() != null) {
            donor.setAvailable(request.available());
        }
        donor.setLastDonationDate(request.lastDonationDate());

        return DonorResponse.from(donorRepository.save(donor));
    }

    @Transactional
    public DonorResponse recordDonation(User user) {
        DonorProfile donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "Register as a donor first"));
        donor.setDonationCount(donor.getDonationCount() + 1);
        donor.setLastDonationDate(java.time.LocalDate.now());
        return DonorResponse.from(donorRepository.save(donor));
    }

    // ---- Donor search ----

    @Transactional(readOnly = true)
    public List<DonorResponse> searchDonors(String bloodGroup, String city) {
        if (!BloodCompatibility.isValidGroup(bloodGroup)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid blood group: " + bloodGroup);
        }
        List<String> compatible = BloodCompatibility.donorsFor(bloodGroup);
        List<DonorProfile> donors = (city == null || city.isBlank())
                ? donorRepository.findTop50ByAvailableTrueAndBloodGroupInOrderByUpdatedAtDesc(compatible)
                : donorRepository.findTop50ByAvailableTrueAndBloodGroupInAndCityIgnoreCaseOrderByUpdatedAtDesc(
                        compatible, city.trim());
        return donors.stream().map(DonorResponse::from).toList();
    }

    // ---- Blood requests ----

    @Transactional(readOnly = true)
    public List<BloodRequestResponse> getOpenRequests(User user) {
        return requestRepository.findTop50ByStatusOrderByCreatedAtDesc(BloodRequest.Status.OPEN)
                .stream()
                .map(request -> BloodRequestResponse.from(request, user.getId()))
                .toList();
    }

    @Transactional
    public BloodRequestResponse createRequest(User user, BloodRequestCreate create) {
        BloodRequest request = BloodRequest.builder()
                .requester(user)
                .bloodGroup(create.bloodGroup())
                .units(create.units())
                .urgency(create.urgency())
                .hospitalName(create.hospitalName().trim())
                .city(create.city().trim())
                .patientName(create.patientName())
                .contactPhone(create.contactPhone())
                .note(create.note())
                .build();
        return BloodRequestResponse.from(requestRepository.save(request), user.getId());
    }

    @Transactional
    public BloodRequestResponse closeRequest(User user, UUID requestId, boolean fulfilled) {
        BloodRequest request = requestRepository.findByIdAndRequesterId(requestId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (request.getStatus() != BloodRequest.Status.OPEN) {
            throw new ApiException(HttpStatus.CONFLICT, "This request is already closed");
        }
        request.setStatus(fulfilled ? BloodRequest.Status.FULFILLED : BloodRequest.Status.CLOSED);
        request.setClosedAt(Instant.now());
        return BloodRequestResponse.from(requestRepository.save(request), user.getId());
    }
}
