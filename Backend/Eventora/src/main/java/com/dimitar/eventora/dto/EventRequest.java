package com.dimitar.eventora.dto;

import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.model.SeatingLayout;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank(message = "Event name cannot be blank")
        @Size(min = 3, max = 255, message = "Event name must be between 3 and 255 characters")
        String name,

        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        String description,

        @NotNull(message = "Event date cannot be null")
        @FutureOrPresent(message = "Event date must be in the future or present")
        LocalDateTime eventDate,

        @NotNull(message = "Genre cannot be null")
        Genre genre,

        @NotNull(message = "Ticket price cannot be null")
        @DecimalMin(value = "0.0", inclusive = true, message = "Ticket price cannot be negative")
        @DecimalMax(value = "10000.00", message = "Ticket price is too high")
        BigDecimal ticketPrice,

        @NotNull(message = "Max tickets cannot be null")
        @Min(value = 1, message = "Max tickets must be at least 1")
        @Max(value = 1000000, message = "Max tickets cannot exceed 1000000")
        Integer maxTickets,

        @Min(value = 0, message = "Standing capacity cannot be negative")
        @Max(value = 600, message = "Standing capacity cannot exceed 600")
        Integer standingCapacity,

        SeatingLayout seatingLayout,

        @NotNull(message = "Seating toggle must be provided")
        Boolean hasSeating,

        @Size(max = 2048, message = "Image URL cannot exceed 2048 characters")
        String imageUrl
) {
}
