package com.resqlink.api.notification;

import com.resqlink.api.user.User;
import com.resqlink.api.websocket.WebSocketPushService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Central hub other modules call to notify users. */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final WebSocketPushService webSocketPushService;

    @Transactional(propagation = Propagation.REQUIRED)
    public void notify(User user, Notification.Type type, String title, String body) {
        Notification saved = notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .build());

        // Push in real-time only after the DB transaction commits
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        webSocketPushService.pushNotification(user, saved);
                    }
                });
    }
}
