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
            @Value("${jwt.secret:your-256-bit-secret-key-change-this-in-production-must-be-at-least-32-chars}") String secret,
            @Value("${jwt.ttl-minutes:15}") int ttlMinutes) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
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
