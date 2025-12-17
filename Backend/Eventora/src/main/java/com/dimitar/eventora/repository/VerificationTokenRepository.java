package com.dimitar.eventora.repository;

import com.dimitar.eventora.entity.VerificationTokenEntity;
import com.dimitar.eventora.model.Auth.VerificationTokenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, Long> {

    Optional<VerificationTokenEntity> findByTokenAndType(String token, VerificationTokenType type);

    long deleteByExpiresAtBefore(LocalDateTime threshold);
}
