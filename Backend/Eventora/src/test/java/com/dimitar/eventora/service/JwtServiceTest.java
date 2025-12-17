package com.dimitar.***REMOVED***vice;

import com.dimitar.***REMOVED***vice.Auth.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.SecurityException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("JwtService Tests")
class JwtServiceTest {

    private static final String VALID_SECRET = "0123456789abcdef0123456789abcdef";

    @Test
    @DisplayName("createJwt should embed subject, role and future expiration")
    void createJwt_ShouldEmbedClaims() {
        JwtService service = new JwtService(VALID_SECRET, 30);

        String token = service.createJwt(99L, "ADMIN");
        Claims claims = service.verify(token);

        assertThat(claims.getSubject()).isEqualTo("99");
        assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
        assertThat(claims.getIssuer()).isEqualTo("eventora");
        assertThat(claims.getExpiration()).isAfter(new Date());
    }

    @Test
    @DisplayName("verify should fail when token is signed with a different secret")
    void verify_ShouldRejectMismatchedSecret() {
        JwtService trustedService = new JwtService(VALID_SECRET, 15);
        String token = trustedService.createJwt(1L, "USER");
        JwtService attackerService = new JwtService("abcdef0123456789abcdef0123456789", 15);

        assertThrows(SecurityException.class, () -> attackerService.verify(token));
    }

    @Test
    @DisplayName("constructor should enforce strong secret length and expose TTL")
    void constructor_ShouldValidateSecretAndExposeTtl() {
        assertThrows(IllegalStateException.class, () -> new JwtService("too-short", 10));

        JwtService service = new JwtService(VALID_SECRET, 45);
        assertThat(service.getTtlSeconds()).isEqualTo(Duration.ofMinutes(45).toSeconds());
    }
}
