package com.dimitar.eventora.dto;

public record VerificationResponse(
        boolean success,
        String message
) {
}
