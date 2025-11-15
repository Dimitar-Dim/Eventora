package com.dimitar.eventora.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserDTO(
        String id,
        String username,
        String email,
        String role,
        @JsonProperty("createdAt")
        String createdAt,
        @JsonProperty("updatedAt")
        String updatedAt
) {
}
