package com.dimitar.eventora.dto;

import jakarta.validation.constraints.Size;

public record TicketPurchaseRequest(
        @Size(max = 255, message = "Issued to name must be at most 255 characters")
        String issuedTo
) {}
