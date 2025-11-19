package com.dimitar.eventora.dto;

import com.dimitar.eventora.model.Genre;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String name,
        String description,
        LocalDateTime eventDate,
        Genre genre,
        BigDecimal ticketPrice,
        Integer maxTickets,
        Integer availableTickets,
        String imageUrl,
        Boolean isActive,
        Long organizerId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
