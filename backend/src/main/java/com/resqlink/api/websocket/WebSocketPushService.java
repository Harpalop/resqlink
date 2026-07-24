package com.resqlink.api.websocket;

import com.resqlink.api.disaster.DisasterAlert;
import com.resqlink.api.emergency.Emergency;
import com.resqlink.api.hazard.HazardReport;
import com.resqlink.api.notification.Notification;
import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Wraps SimpMessagingTemplate to push real-time events to connected WebSocket
 * clients. Every method in this class is a fire-and-forget broadcast — it never
 * throws, never blocks the caller.
 */
@Service
@RequiredArgsConstructor
public class WebSocketPushService {

    private final SimpMessagingTemplate messagingTemplate;

    /* ─── Notifications ───────────────────────────────────── */

    public void pushNotification(User user, Notification notification) {
        var dto = new NotificationPayload(
                notification.getId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getBody(),
                notification.getCreatedAt());
        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/notifications",
                dto);
    }

    /* ─── Emergencies / SOS ────────────────────────────────── */

    public void pushEmergencyToUser(User user, Emergency emergency) {
        var dto = new EmergencyPayload(
                emergency.getId(),
                emergency.getReference(),
                emergency.getType().name(),
                emergency.getStatus().name(),
                emergency.getLatitude(),
                emergency.getLongitude(),
                emergency.getCreatedAt());
        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/emergency",
                dto);
    }

    public void pushEmergencyToAdmins(Emergency emergency) {
        var dto = new EmergencyPayload(
                emergency.getId(),
                emergency.getReference(),
                emergency.getType().name(),
                emergency.getStatus().name(),
                emergency.getLatitude(),
                emergency.getLongitude(),
                emergency.getCreatedAt());
        messagingTemplate.convertAndSend("/topic/emergencies", dto);
    }

    /* ─── Disaster Alerts ──────────────────────────────────── */

    public void pushDisasterAlert(DisasterAlert alert, String action) {
        var dto = new DisasterPayload(
                action,
                alert.getId(),
                alert.getType().name(),
                alert.getSeverity().name(),
                alert.getTitle(),
                alert.getRegion(),
                alert.isActive());
        messagingTemplate.convertAndSend("/topic/disasters", dto);
    }

    /* ─── Hazard Reports ───────────────────────────────── */

    public void pushHazardReport(HazardReport report, String action) {
        messagingTemplate.convertAndSend("/topic/hazards", new HazardPayload(
                action, report.getId(), report.getType().name(), report.getSeverity().name(),
                report.getTitle(), report.getDescription(), report.getLatitude(),
                report.getLongitude(), report.getStatus().name()));
    }

    /* ─── Inner DTOs (sent as JSON over the wire) ──────────── */

    public record NotificationPayload(
            UUID id, String type, String title,
            String body, Instant createdAt) {
    }

    public record EmergencyPayload(
            UUID id, String reference, String type,
            String status, Double latitude, Double longitude,
            Instant createdAt) {
    }

    public record DisasterPayload(
            String action, UUID id, String type,
            String severity, String title, String region,
            boolean active) {
    }

    public record ChatMessagePayload(
            UUID roomId, UUID senderId, String senderName,
            String content, String createdAt) {
    }

    /* ─── Chat Messages ──────────────────────────────────── */

    public void pushChatMessage(UUID roomId, Object dto) {
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, dto);
    }

    public record HazardPayload(
            String action, UUID id, String type, String severity,
            String title, String description, double latitude,
            double longitude, String status) {
    }
}
