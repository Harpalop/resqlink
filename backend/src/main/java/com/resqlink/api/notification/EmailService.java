package com.resqlink.api.notification;

import com.resqlink.api.contact.EmergencyContact;
import com.resqlink.api.emergency.Emergency;
import com.resqlink.api.profile.MedicalProfile;
import com.resqlink.api.profile.MedicalProfileRepository;
import com.resqlink.api.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Sends email alerts when an SOS is triggered.
 *
 * Uses the Resend API (https://resend.com) when {@code RESEND_API_KEY} is
 * configured. Falls back to logging when no key is present — the feature
 * works in development without any external setup.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API = "https://api.resend.com/emails";

    private final RestTemplate rest;
    private final String apiKey;
    private final String appUrl;
    private final MedicalProfileRepository profileRepository;

    public EmailService(
            @Value("${RESEND_API_KEY:}") String apiKey,
            @Value("${VITE_PUBLIC_APP_URL:http://localhost:5173}") String appUrl,
            RestTemplateBuilder builder,
            MedicalProfileRepository profileRepository) {
        this.apiKey = apiKey;
        this.appUrl = appUrl;
        this.rest = builder.build();
        this.profileRepository = profileRepository;
    }

    /**
     * Send an SOS alert email to every emergency contact who has an email
     * address. Runs on a separate thread so it never blocks the SOS trigger.
     */
    @Async
    public void sendSosAlert(User user, Emergency emergency, List<EmergencyContact> contacts) {
        for (var contact : contacts) {
            if (contact.getEmail() == null || contact.getEmail().isBlank()) {
                continue;
            }
            try {
                sendEmail(contact.getEmail(), contact.getName(),
                        "🆘 SOS Alert — " + user.getFullName() + " needs help",
                        buildSosBody(user, emergency));
            } catch (Exception e) {
                log.warn("Failed to send SOS email to {} ({})",
                        contact.getEmail(), e.getMessage());
            }
        }
    }

    private void sendEmail(String to, String toName, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("\n=== EMAIL (no API key — logging only) ===\nTo: {} ({})\nSubject: {}\n{}\n===================================",
                    to, toName, subject, html);
            return;
        }

        var headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        var body = Map.of(
                "from", "ResQLink <sos@resqlink.dev>",
                "to", List.of(to),
                "subject", subject,
                "html", html);

        var response = rest.postForEntity(
                RESEND_API,
                new HttpEntity<>(body, headers),
                String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("SOS email sent to {} ({})", to, toName);
        } else {
            log.warn("Resend API returned {}: {}", response.getStatusCode(), response.getBody());
        }
    }

    private String buildSosBody(User user, Emergency emergency) {
        String mapsLink = (emergency.getLatitude() != null && emergency.getLongitude() != null)
                ? String.format("https://maps.google.com/maps?q=%.5f,%.5f",
                emergency.getLatitude(), emergency.getLongitude())
                : "Location not available";

        String medicalIdLink = profileRepository.findByUserId(user.getId())
                .map(MedicalProfile::getPublicToken)
                .map(token -> appUrl + "/m/" + token)
                .orElse("Not available");

        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: #dc2626; color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                    <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY SOS</h1>
                    <p style="margin: 8px 0 0; opacity: 0.9;">%s</p>
                  </div>
                  <table style="width: 100%%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 12px; color: #666; width: 100px;">Person</td><td style="padding: 8px 12px; font-weight: 600;">%s</td></tr>
                    <tr style="background: #f8f8f8;"><td style="padding: 8px 12px; color: #666;">Reference</td><td style="padding: 8px 12px; font-weight: 600;">%s</td></tr>
                    <tr><td style="padding: 8px 12px; color: #666;">Type</td><td style="padding: 8px 12px; font-weight: 600;">%s</td></tr>
                    <tr style="background: #f8f8f8;"><td style="padding: 8px 12px; color: #666;">Status</td><td style="padding: 8px 12px; font-weight: 600; color: #dc2626;">ACTIVE</td></tr>
                    <tr><td style="padding: 8px 12px; color: #666;">Location</td><td style="padding: 8px 12px;"><a href="%s" style="color: #2563eb;">View on Google Maps →</a></td></tr>
                    <tr style="background: #f8f8f8;"><td style="padding: 8px 12px; color: #666;">Time</td><td style="padding: 8px 12px; font-weight: 600;">%s</td></tr>
                  </table>
                  <p style="margin-top: 24px; padding: 16px; background: #fef2f2; border-radius: 8px; font-size: 14px; color: #991b1b;">
                    This is an automated alert from <strong>ResQLink</strong>. Please contact the person above or check on them if possible.
                  </p>
                  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">
                    ResQLink — Smart Emergency Response &amp; Digital Healthcare Ecosystem
                  </p>
                </body>
                </html>
                """.formatted(
                emergency.getReference(),
                user.getFullName(),
                emergency.getReference(),
                emergency.getType().name().replace('_', ' ').toLowerCase(),
                mapsLink,
                java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy h:mm a"))
        );
    }
}
