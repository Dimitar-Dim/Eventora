package com.dimitar.eventora.dto;

public record RegisterResponse(
        Long id,
        String username,
        String email,
        String role
) {
}
