package com.dimitar.***REMOVED***vice;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final Duration tokenTtl;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.ttl-minutes:15}") int ttlMinutes) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("jwt.secret must be configured");
        }

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret must be at least 32 bytes (256 bits) for HS256");
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.tokenTtl = Duration.ofMinutes(ttlMinutes);
    }

    public String createJwt(Long userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer("eventora")
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(tokenTtl)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims verify(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getTtlSeconds() {
        return tokenTtl.getSeconds();
    }
}
