package com.dimitar.eventora.mapper;

import com.dimitar.***REMOVED***Response;
import com.dimitar.***REMOVED***;
import org.springframework.stereotype.Component;

@Component
public class UserDtoMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return new UserResponse(
                user.getId() != null ? user.getId().toString() : null,
                user.getUsername(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name().toLowerCase() : null,
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null
        );
    }
}
