package com.resqlink.api.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final PushService pushService;
    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Send a push notification to all devices registered by the specified user.
     */
    public void sendPushToUser(UUID userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findByUserId(userId);
        if (subscriptions.isEmpty()) {
            return;
        }

        try {
            Map<String, String> payloadMap = Map.of(
                    "title", title,
                    "body", body,
                    "url", url != null ? url : "/"
            );
            String payload = objectMapper.writeValueAsString(payloadMap);

            for (PushSubscription sub : subscriptions) {
                sendToSubscription(sub, payload);
            }
        } catch (Exception e) {
            log.error("Failed to prepare push notification payload", e);
        }
    }

    /**
     * Send a push notification to all users in the system (e.g. for disaster alerts).
     */
    public void sendPushToAll(String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAll();
        if (subscriptions.isEmpty()) {
            return;
        }

        try {
            Map<String, String> payloadMap = Map.of(
                    "title", title,
                    "body", body,
                    "url", url != null ? url : "/"
            );
            String payload = objectMapper.writeValueAsString(payloadMap);

            for (PushSubscription sub : subscriptions) {
                sendToSubscription(sub, payload);
            }
        } catch (Exception e) {
            log.error("Failed to prepare push notification payload", e);
        }
    }

    private void sendToSubscription(PushSubscription sub, String payload) {
        try {
            nl.martijndwars.webpush.Subscription webPushSub = new nl.martijndwars.webpush.Subscription(
                    sub.getEndpoint(),
                    new nl.martijndwars.webpush.Subscription.Keys(sub.getP256dh(), sub.getAuth())
            );
            
            Notification notification = new Notification(webPushSub, payload);
            pushService.send(notification);
        } catch (Exception e) {
            log.warn("Failed to send push to endpoint {}: {}", sub.getEndpoint(), e.getMessage());
            // If the endpoint is no longer valid (e.g., 410 Gone), we should delete it
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                subscriptionRepository.delete(sub);
            }
        }
    }
}
