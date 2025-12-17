package com.dimitar.eventora.entity;

import com.dimitar.eventora.model.Event.Genre;
import com.dimitar.eventora.model.Event.SeatingLayout;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Event")
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date", nullable = false)
    private LocalDateTime eventDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "genre", nullable = false, length = 50)
    private Genre genre;

    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    @Column(name = "max_tickets", nullable = false)
    private Integer maxTickets;

    @Column(name = "available_tickets", nullable = false)
    private Integer availableTickets;

    @Column(name = "has_seating", nullable = false)
    @Builder.Default
    private Boolean hasSeating = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "seating_layout", nullable = false, length = 32)
    @Builder.Default
    private SeatingLayout seatingLayout = SeatingLayout.NONE;

    @Column(name = "seated_capacity", nullable = false)
    @Builder.Default
    private Integer seatedCapacity = 0;

    @Column(name = "standing_capacity", nullable = false)
    @Builder.Default
    private Integer standingCapacity = 600;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.availableTickets == null) {
            this.availableTickets = this.maxTickets;
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
