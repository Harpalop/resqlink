package com.resqlink.api.notification;

import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public record NotificationRow(UUID id, String type, String title, String body,
                                  boolean read, Instant createdAt) {
    }

    public record UnreadCount(long unread) {
    }

    @GetMapping
    public List<NotificationRow> list(@AuthenticationPrincipal User user) {
        return notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(notification -> new NotificationRow(
                        notification.getId(),
                        notification.getType().name(),
                        notification.getTitle(),
                        notification.getBody(),
                        notification.isRead(),
                        notification.getCreatedAt()))
                .toList();
    }

    @GetMapping("/unread-count")
    public UnreadCount unreadCount(@AuthenticationPrincipal User user) {
        return new UnreadCount(notificationRepository.countByUserIdAndReadFalse(user.getId()));
    }

    @PostMapping("/mark-all-read")
    @Transactional
    public UnreadCount markAllRead(@AuthenticationPrincipal User user) {
        notificationRepository.markAllRead(user.getId());
        return new UnreadCount(0);
    }
}
