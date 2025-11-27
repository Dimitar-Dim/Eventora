package com.dimitar.eventora.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyAccountRequest(
        @NotBlank(message = "Verification token is required")
        String token
) {
}
