package com.resqlink.api.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    public record HealthResponse(String status, String service, Instant timestamp) {
    }

    @GetMapping
    public HealthResponse health() {
        return new HealthResponse("ok", "resqlink-api", Instant.now());
    }
}
