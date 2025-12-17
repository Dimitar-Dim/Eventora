package com.dimitar.eventora.dto.Auth;

public record RegisterResponse(
        Long id,
        String username,
        String email,
        String role,
        boolean verificationEmailSent
) {
}
