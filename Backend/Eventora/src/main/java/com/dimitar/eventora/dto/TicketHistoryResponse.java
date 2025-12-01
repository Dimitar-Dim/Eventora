package com.dimitar.eventora.dto;

import com.dimitar.eventora.model.TicketStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketHistoryResponse(
        Long ticketId,
        Long eventId,
        String eventName,
        LocalDateTime eventDate,
        String issuedTo,
        String qrCode,
        TicketStatus status,
        BigDecimal ticketPrice,
        LocalDateTime purchasedAt,
        String eventImageUrl,
        String seatSection,
        String seatRow,
        String seatNumber,
        String deliveryEmail
) {
}
