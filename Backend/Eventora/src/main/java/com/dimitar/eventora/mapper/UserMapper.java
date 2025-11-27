package com.dimitar.eventora.mapper;

import com.dimitar.***REMOVED***Entity;
import com.dimitar.***REMOVED***;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toModel(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        return User.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .passwordHash(entity.getPasswordHash())
                .role(entity.getRole())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .verified(entity.isVerified())
                .verifiedAt(entity.getVerifiedAt())
                .build();
    }
}
