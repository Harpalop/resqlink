package com.resqlink.api.auth;

import com.resqlink.api.auth.dto.AuthResponse;
import com.resqlink.api.auth.dto.LoginRequest;
import com.resqlink.api.auth.dto.RegisterRequest;
import com.resqlink.api.auth.dto.UserResponse;
import com.resqlink.api.common.exception.ApiException;
import com.resqlink.api.security.JwtService;
import com.resqlink.api.user.Role;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    /** Roles that can be chosen at public registration. Everything else requires admin approval. */
    private static final Set<Role> SELF_REGISTER_ROLES =
            Set.of(Role.CITIZEN, Role.DOCTOR, Role.NURSE, Role.VOLUNTEER, Role.NGO);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .role(resolveRole(request.role()))
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        Claims claims;
        try {
            claims = jwtService.parseClaims(refreshToken);
        } catch (JwtException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        if (!jwtService.isRefreshToken(claims)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Provided token is not a refresh token");
        }

        User user = userRepository.findByEmail(jwtService.extractUsername(claims))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account no longer exists"));
        return buildAuthResponse(user);
    }

    private Role resolveRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return Role.CITIZEN;
        }
        Role role;
        try {
            role = Role.valueOf(requestedRole.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown role: " + requestedRole);
        }
        if (!SELF_REGISTER_ROLES.contains(role)) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Role " + role + " requires administrator verification");
        }
        return role;
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.of(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                UserResponse.from(user)
        );
    }
}
