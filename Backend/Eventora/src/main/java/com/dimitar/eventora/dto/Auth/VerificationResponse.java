package com.dimitar.eventora.dto.Auth;

public record VerificationResponse(
        boolean success,
        String message
) {
}
