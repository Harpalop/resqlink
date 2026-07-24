package com.resqlink.api.notification;

import com.resqlink.api.contact.EmergencyContact;
import com.resqlink.api.emergency.Emergency;
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
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final RestTemplate rest;
    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final String appUrl;

    public SmsService(
            @Value("${TWILIO_ACCOUNT_SID:}") String accountSid,
            @Value("${TWILIO_AUTH_TOKEN:}") String authToken,
            @Value("${TWILIO_FROM_NUMBER:}") String fromNumber,
            @Value("${VITE_PUBLIC_APP_URL:http://localhost:5173}") String appUrl,
            RestTemplateBuilder builder) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
        this.appUrl = appUrl;
        this.rest = builder.build();
    }

    @Async
    public void sendSosAlert(User user, Emergency emergency, List<EmergencyContact> contacts) {
        if (contacts.isEmpty()) return;

        String mapsLink = (emergency.getLatitude() != null && emergency.getLongitude() != null)
                ? String.format("https://maps.google.com/maps?q=%.5f,%.5f",
                emergency.getLatitude(), emergency.getLongitude())
                : "Location not available";

        String medicalIdLink = appUrl + "/m/" + user.getId();

        String smsBody = String.format(
                "EMERGENCY SOS from %s\n" +
                "Type: %s\n" +
                "Ref: %s\n" +
                "Location: %s\n" +
                "Medical ID: %s\n\n" +
                "This is an automated alert from ResQLink.",
                user.getFullName(),
                emergency.getType().name().replace('_', ' '),
                emergency.getReference(),
                mapsLink,
                medicalIdLink
        );

        for (EmergencyContact contact : contacts) {
            String phone = contact.getPhone();
            if (phone == null || phone.isBlank()) continue;

            try {
                sendSms(phone, smsBody);
                log.info("SOS SMS sent to {} ({})", contact.getName(), phone);
            } catch (Exception e) {
                log.warn("Failed to send SMS to {} ({}) — {}", contact.getName(), phone, e.getMessage());
            }
        }
    }

    private void sendSms(String to, String body) {
        if (accountSid == null || accountSid.isBlank() || fromNumber == null || fromNumber.isBlank()) {
            log.info("\n=== SMS (no Twilio config — logging only) ===\nTo: {}\nBody: {}\n===\n",
                    to, body);
            return;
        }

        String url = UriComponentsBuilder
                .fromHttpUrl("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json")
                .build()
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(accountSid, authToken);

        String formBody = UriComponentsBuilder.newInstance()
                .queryParam("From", fromNumber)
                .queryParam("To", to)
                .queryParam("Body", body)
                .build()
                .encode()
                .toUriString()
                .substring(1); // remove leading '?'

        rest.postForEntity(url, new HttpEntity<>(formBody, headers), String.class);
    }
}
