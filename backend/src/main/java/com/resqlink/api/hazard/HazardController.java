package com.resqlink.api.hazard;

import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.user.Role;
import com.resqlink.api.user.User;
import com.resqlink.api.websocket.WebSocketPushService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hazards")
@RequiredArgsConstructor
public class HazardController {

    private final HazardReportRepository hazardRepository;
    private final WebSocketPushService webSocketPushService;

    public record ReportRequest(
            @NotNull HazardReport.Type type,
            @NotNull HazardReport.Severity severity,
            @NotBlank @Size(max = 120) String title,
            @Size(max = 500) String description,
            @Min(-90) @Max(90) double latitude,
            @Min(-180) @Max(180) double longitude
    ) {}

    public record HazardDTO(UUID id, String reporterName, HazardReport.Type type,
                            HazardReport.Severity severity, String title, String description,
                            double latitude, double longitude, HazardReport.Status status,
                            String createdAt) {
        static HazardDTO from(HazardReport h) {
            return new HazardDTO(h.getId(), h.getUser().getFullName(), h.getType(),
                    h.getSeverity(), h.getTitle(), h.getDescription(),
                    h.getLatitude(), h.getLongitude(), h.getStatus(),
                    h.getCreatedAt().toString());
        }
    }

    @GetMapping("/active")
    @Transactional(readOnly = true)
    public List<HazardDTO> activeHazards() {
        return hazardRepository.findByStatusOrderByCreatedAtDesc(HazardReport.Status.ACTIVE)
                .stream().map(HazardDTO::from).toList();
    }

    @GetMapping("/all")
    @Transactional(readOnly = true)
    public List<HazardDTO> allHazards(@AuthenticationPrincipal User user) {
        if (user.getRole() != Role.ADMIN) {
            return hazardRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                    .stream().map(HazardDTO::from).toList();
        }
        return hazardRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(HazardDTO::from).toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<HazardDTO> report(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReportRequest request) {
        HazardReport report = hazardRepository.save(HazardReport.builder()
                .user(user)
                .type(request.type())
                .severity(request.severity())
                .title(request.title())
                .description(request.description())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .build());
        HazardDTO dto = HazardDTO.from(report);
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        webSocketPushService.pushHazardReport(report, "REPORTED");
                    }
                });
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}/resolve")
    @Transactional
    public HazardDTO resolve(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        HazardReport report = findManageable(user, id);
        report.setStatus(HazardReport.Status.RESOLVED);
        HazardDTO dto = HazardDTO.from(hazardRepository.save(report));
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        webSocketPushService.pushHazardReport(report, "RESOLVED");
                    }
                });
        return dto;
    }

    @PutMapping("/{id}/dismiss")
    @Transactional
    public HazardDTO dismiss(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        HazardReport report = findManageable(user, id);
        report.setStatus(HazardReport.Status.DISMISSED);
        HazardDTO dto = HazardDTO.from(hazardRepository.save(report));
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        webSocketPushService.pushHazardReport(report, "DISMISSED");
                    }
                });
        return dto;
    }

    private HazardReport findManageable(User user, UUID id) {
        HazardReport report = hazardRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Hazard report not found"));
        if (user.getRole() != Role.ADMIN && !report.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own reports");
        }
        return report;
    }
}
