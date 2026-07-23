package com.resqlink.api.emergency;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.contact.EmergencyContactRepository;
import com.resqlink.api.emergency.dto.EmergencyResponse;
import com.resqlink.api.emergency.dto.TriggerRequest;
import com.resqlink.api.notification.Notification;
import com.resqlink.api.notification.EmailService;
import com.resqlink.api.notification.NotificationService;
import com.resqlink.api.profile.MedicalProfileRepository;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class EmergencyService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmergencyRepository emergencyRepository;
    private final EmergencyContactRepository contactRepository;
    private final MedicalProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public EmergencyResponse trigger(User user, TriggerRequest request) {
        if (emergencyRepository
                .findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EmergencyStatus.ACTIVE)
                .isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "You already have an active emergency. Resolve or cancel it first.");
        }

        Emergency emergency = Emergency.builder()
                .reference(nextReference())
                .user(user)
                .type(request.type())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .accuracyMeters(request.accuracyMeters())
                .note(request.note())
                .build();

        emergency.addEvent("SOS triggered",
                request.type().name().replace('_', ' ') + " emergency reported");

        if (request.latitude() != null && request.longitude() != null) {
            emergency.addEvent("Location locked",
                    String.format("GPS %.5f, %.5f (±%.0f m)",
                            request.latitude(), request.longitude(),
                            request.accuracyMeters() == null ? 0 : request.accuracyMeters()));
        } else {
            emergency.addEvent("Location unavailable", "GPS permission denied or unsupported");
        }

        var contacts = contactRepository.findByUserIdOrderByPriorityAscCreatedAtAsc(user.getId());
        long emailed = contacts.stream()
                .filter(c -> c.getEmail() != null && !c.getEmail().isBlank())
                .count();
        emergency.addEvent("Contacts notified",
                contacts.isEmpty()
                        ? "No emergency contacts configured — add some in Contacts"
                        : emailed + " of " + contacts.size()
                        + " contact(s) alerted via email, SMS coming soon");

        profileRepository.findByUserId(user.getId())
                .filter(profile -> profile.isMedicalIdEnabled())
                .ifPresent(profile -> emergency.addEvent("Medical ID shared",
                        "Responders can access blood group, allergies and medications"));

        Emergency saved = emergencyRepository.save(emergency);
        notificationService.notify(user, Notification.Type.SOS,
                "SOS " + saved.getReference() + " activated",
                "Your " + request.type().name().replace('_', ' ').toLowerCase()
                        + " emergency is live. Responders and contacts are being alerted.");
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        emailService.sendSosAlert(user, saved, contacts.stream()
                                .filter(c -> c.getEmail() != null && !c.getEmail().isBlank())
                                .toList());
                    }
                });
        return EmergencyResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Optional<EmergencyResponse> getActive(User user) {
        return emergencyRepository
                .findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), EmergencyStatus.ACTIVE)
                .map(EmergencyResponse::from);
    }

    @Transactional(readOnly = true)
    public List<EmergencyResponse> getHistory(User user) {
        return emergencyRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(EmergencyResponse::summary)
                .toList();
    }

    @Transactional
    public EmergencyResponse close(User user, UUID emergencyId, boolean resolved) {
        Emergency emergency = emergencyRepository.findByIdAndUserId(emergencyId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Emergency not found"));

        if (emergency.getStatus() != EmergencyStatus.ACTIVE) {
            throw new ApiException(HttpStatus.CONFLICT, "This emergency is already closed");
        }

        emergency.setStatus(resolved ? EmergencyStatus.RESOLVED : EmergencyStatus.CANCELLED);
        emergency.setClosedAt(Instant.now());
        emergency.addEvent(resolved ? "Marked safe" : "SOS cancelled",
                resolved ? "The user confirmed they are safe" : "Cancelled by the user");

        notificationService.notify(user, Notification.Type.SOS,
                "Emergency " + emergency.getReference() + (resolved ? " resolved" : " cancelled"),
                resolved ? "Glad you're safe. The emergency has been closed."
                        : "The SOS was cancelled and responders were stood down.");

        return EmergencyResponse.from(emergencyRepository.save(emergency));
    }

    private String nextReference() {
        String reference;
        do {
            reference = "RQ-" + (1000 + RANDOM.nextInt(9000));
        } while (emergencyRepository.existsByReference(reference));
        return reference;
    }
}
