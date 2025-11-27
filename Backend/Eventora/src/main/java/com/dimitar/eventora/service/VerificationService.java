package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.entity.VerificationTokenEntity;
import com.dimitar.eventora.model.VerificationTokenType;

import java.time.Duration;
import java.util.Optional;

public interface VerificationService {

    VerificationTokenEntity createToken(Long userId, VerificationTokenType type, Duration ttl);

    Optional<VerificationTokenEntity> consumeToken(String tokenValue, VerificationTokenType expectedType);
}
