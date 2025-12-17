package com.dimitar.eventora.dto.Ticket;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record TicketPurchaseRequest(
        @Size(max = 255, message = "Issued to name must be at most 255 characters")
        String issuedTo,
        @Email(message = "Please provide a valid email address")
        @Size(max = 320, message = "Email must be at most 320 characters")
        String deliveryEmail,
        String seatSection,
        String seatRow,
        String seatNumber
) {}
