package com.dimitar.eventora.dto.Auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserResponse(
        String id,
        String username,
        String email,
        String role,
        boolean verified,
        @JsonProperty("createdAt")
        String createdAt,
        @JsonProperty("updatedAt")
        String updatedAt,
        @JsonProperty("verifiedAt")
        String verifiedAt
) {
}
