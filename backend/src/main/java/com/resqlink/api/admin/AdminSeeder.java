package com.resqlink.api.admin;

import com.resqlink.api.user.Role;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a default admin account on first boot (dev convenience).
 * Override credentials via ADMIN_EMAIL / ADMIN_PASSWORD env vars in production.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${resqlink.admin.email:admin@resqlink.dev}")
    private String adminEmail;

    @Value("${resqlink.admin.password:admin12345}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }
        userRepository.save(User.builder()
                .fullName("ResQLink Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build());
        log.info("Seeded default admin account: {}", adminEmail);
    }
}
