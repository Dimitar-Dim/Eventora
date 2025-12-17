package com.dimitar.eventora.dto.Event;

import com.dimitar.eventora.model.Event.Genre;
import com.dimitar.eventora.model.Event.SeatingLayout;

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
        Integer standingCapacity,
        Integer seatedCapacity,
        Boolean hasSeating,
        SeatingLayout seatingLayout,
        String imageUrl,
        Boolean isActive,
        Long organizerId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
