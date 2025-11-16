package com.dimitar.eventora.dto;

import com.dimitar.eventora.model.TicketStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketPurchaseResponse(
        Long ticketId,
        Long eventId,
        String eventName,
        String issuedTo,
        String qrCode,
        TicketStatus status,
        Integer remainingTickets,
        BigDecimal pricePaid,
        LocalDateTime purchasedAt
) {}
