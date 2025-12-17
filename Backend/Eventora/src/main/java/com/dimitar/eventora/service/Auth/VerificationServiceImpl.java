package com.dimitar.***REMOVED***vice.Auth;

import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.entity.VerificationTokenEntity;
import com.dimitar.eventora.model.Auth.VerificationTokenType;
import com.dimitar.***REMOVED***Repository;
import com.dimitar.eventora.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;

    @Override
    @Transactional
    public VerificationTokenEntity createToken(Long userId, VerificationTokenType type, Duration ttl) {
        if (userId == null) {
            throw new IllegalArgumentException("User id is required");
        }
        if (type == null) {
            throw new IllegalArgumentException("Token type is required");
        }
        if (ttl == null || ttl.isZero() || ttl.isNegative()) {
            throw new IllegalArgumentException("Token TTL must be positive");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        VerificationTokenEntity token = VerificationTokenEntity.builder()
                .user(user)
                .token(generateToken())
                .type(type)
                .expiresAt(LocalDateTime.now().plus(ttl))
                .build();
        @SuppressWarnings("null")
        VerificationTokenEntity savedToken = tokenRepository.save(token);
        return savedToken;
    }

    @Override
    @Transactional
    public Optional<VerificationTokenEntity> consumeToken(String tokenValue, VerificationTokenType expectedType) {
        if (tokenValue == null || tokenValue.isBlank() || expectedType == null) {
            return Optional.empty();
        }

        LocalDateTime now = LocalDateTime.now();

        return tokenRepository.findByTokenAndType(tokenValue, expectedType)
                .filter(token -> token.getConsumedAt() == null)
                .filter(token -> token.getExpiresAt() == null || token.getExpiresAt().isAfter(now))
                .map(token -> {
                    token.setConsumedAt(now);
                    return tokenRepository.save(token);
                });
    }

    private String generateToken() {
        byte[] buffer = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(buffer);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
    }
}
