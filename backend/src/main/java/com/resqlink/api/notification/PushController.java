package com.resqlink.api.notification;

import com.resqlink.api.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/push")
@RequiredArgsConstructor
public class PushController {

    private final PushSubscriptionRepository subscriptionRepository;

    @Value("${resqlink.security.vapid.public-key}")
    private String vapidPublicKey;

    @GetMapping("/vapid-public-key")
    public ResponseEntity<Map<String, String>> getVapidPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", vapidPublicKey));
    }

    public record SubscribeRequest(String endpoint, String p256dh, String auth) {}

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@AuthenticationPrincipal User user, @RequestBody SubscribeRequest request) {
        Optional<PushSubscription> existing = subscriptionRepository.findByEndpoint(request.endpoint());
        
        if (existing.isPresent()) {
            PushSubscription sub = existing.get();
            if (!sub.getUser().getId().equals(user.getId())) {
                sub.setUser(user);
                subscriptionRepository.save(sub);
            }
        } else {
            PushSubscription newSub = PushSubscription.builder()
                    .user(user)
                    .endpoint(request.endpoint())
                    .p256dh(request.p256dh())
                    .auth(request.auth())
                    .build();
            subscriptionRepository.save(newSub);
        }
        
        return ResponseEntity.ok(Map.of("status", "subscribed"));
    }
}
