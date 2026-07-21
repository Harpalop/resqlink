package com.resqlink.api.security;

import com.resqlink.api.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    public static final String CLAIM_TOKEN_TYPE = "token_type";
    public static final String TOKEN_TYPE_ACCESS = "access";
    public static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey secretKey;
    private final long accessTokenTtlMs;
    private final long refreshTokenTtlMs;

    public JwtService(
            @Value("${resqlink.security.jwt.secret}") String secret,
            @Value("${resqlink.security.jwt.access-token-ttl-ms}") long accessTokenTtlMs,
            @Value("${resqlink.security.jwt.refresh-token-ttl-ms}") long refreshTokenTtlMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTokenTtlMs = accessTokenTtlMs;
        this.refreshTokenTtlMs = refreshTokenTtlMs;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, accessTokenTtlMs, Map.of(
                CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS,
                "uid", user.getId().toString(),
                "role", user.getRole().name(),
                "name", user.getFullName()
        ));
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshTokenTtlMs, Map.of(
                CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH
        ));
    }

    private String buildToken(User user, long ttlMs, Map<String, Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(ttlMs)))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Parses and verifies the token signature and expiry.
     * Throws {@link io.jsonwebtoken.JwtException} when invalid.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(Claims claims) {
        return claims.getSubject();
    }

    public boolean isAccessToken(Claims claims) {
        return TOKEN_TYPE_ACCESS.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public boolean isRefreshToken(Claims claims) {
        return TOKEN_TYPE_REFRESH.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }
}
