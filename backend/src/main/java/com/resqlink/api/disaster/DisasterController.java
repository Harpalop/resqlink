package com.resqlink.api.disaster;

import com.resqlink.api.user.User;
import com.resqlink.api.websocket.WebSocketPushService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@RestController
@RequestMapping("/api/v1/disasters")
@RequiredArgsConstructor
public class DisasterController {

    private final DisasterAlertRepository alertRepository;
    private final WebSocketPushService webSocketPushService;

    public record CreateAlertRequest(
            @NotNull DisasterAlert.Type type,
            @NotNull DisasterAlert.Severity severity,
            @NotBlank @Size(max = 120) String title,
            @NotBlank @Size(max = 500) String advice,
            @NotBlank @Size(max = 120) String region
    ) {
    }

    /** Public feed — only currently active alerts, newest first. */
    @GetMapping("/alerts")
    public List<DisasterAlert> activeAlerts() {
        return alertRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    /** Admin management view — every alert, including deactivated ones. */
    @GetMapping("/alerts/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DisasterAlert> allAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/alerts")
    @PreAuthorize("hasRole('ADMIN')")
    @jakarta.transaction.Transactional
    public ResponseEntity<DisasterAlert> createAlert(@Valid @RequestBody CreateAlertRequest request) {
        DisasterAlert alert = alertRepository.save(DisasterAlert.builder()
                .type(request.type())
                .severity(request.severity())
                .title(request.title())
                .advice(request.advice())
                .region(request.region())
                .build());
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        webSocketPushService.pushDisasterAlert(alert, "CREATED");
                    }
                });
        return ResponseEntity.status(HttpStatus.CREATED).body(alert);
    }

    @PutMapping("/alerts/{alertId}")
    @PreAuthorize("hasRole('ADMIN')")
    @jakarta.transaction.Transactional
    public DisasterAlert updateAlert(@PathVariable UUID alertId,
                                     @Valid @RequestBody CreateAlertRequest request) {
        DisasterAlert alert = findOrThrow(alertId);
        alert.setType(request.type());
        alert.setSeverity(request.severity());
        alert.setTitle(request.title());
        alert.setAdvice(request.advice());
        alert.setRegion(request.region());
        DisasterAlert saved = alertRepository.save(alert);
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        webSocketPushService.pushDisasterAlert(saved, "UPDATED");
                    }
                });
        return saved;
    }

    @PostMapping("/alerts/{alertId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @jakarta.transaction.Transactional
    public DisasterAlert deactivate(@PathVariable UUID alertId) {
        DisasterAlert alert = findOrThrow(alertId);
        alert.setActive(false);
        DisasterAlert saved = alertRepository.save(alert);
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        webSocketPushService.pushDisasterAlert(saved, "DEACTIVATED");
                    }
                });
        return saved;
    }

    @PostMapping("/alerts/{alertId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @jakarta.transaction.Transactional
    public DisasterAlert activate(@PathVariable UUID alertId) {
        DisasterAlert alert = findOrThrow(alertId);
        alert.setActive(true);
        DisasterAlert saved = alertRepository.save(alert);
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        webSocketPushService.pushDisasterAlert(saved, "ACTIVATED");
                    }
                });
        return saved;
    }

    private DisasterAlert findOrThrow(UUID alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> new com.resqlink.api.common.exception.ApiException(
                        HttpStatus.NOT_FOUND, "Alert not found"));
    }



    /** Seeds one sample alert so the UI has something to show. */
    @Component
    @RequiredArgsConstructor
    static class DisasterSeeder implements CommandLineRunner {
        private final DisasterAlertRepository alertRepository;

        @Override
        public void run(String... args) {
            if (alertRepository.count() > 0) {
                return;
            }
            alertRepository.save(DisasterAlert.builder()
                    .type(DisasterAlert.Type.HEATWAVE)
                    .severity(DisasterAlert.Severity.WARNING)
                    .title("Heatwave warning for Maharashtra")
                    .advice("Stay indoors 12–4 PM, drink water every hour, check on the elderly, and never leave children or pets in vehicles.")
                    .region("Maharashtra")
                    .build());
        }
    }
}
