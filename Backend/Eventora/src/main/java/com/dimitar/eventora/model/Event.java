package com.dimitar.eventora.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.dimitar.eventora.model.SeatingLayout;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime eventDate;
    private Genre genre;
    private BigDecimal ticketPrice;
    private Integer maxTickets;
    private Integer availableTickets;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
    private Long organizerId;
    private Boolean hasSeating;
    private SeatingLayout seatingLayout;
    private Integer seatedCapacity;
    private Integer standingCapacity;

    public boolean canBookTickets(int quantity) {
        return this.isActive && this.availableTickets >= quantity;
    }

    public void bookTickets(int quantity) {
        if (!canBookTickets(quantity)) {
            throw new IllegalStateException("Cannot book tickets for this event");
        }
        this.availableTickets -= quantity;
    }

    public boolean isUpcoming() {
        return this.eventDate.isAfter(LocalDateTime.now());
    }

    public boolean isFull() {
        return this.availableTickets <= 0;
    }
}
