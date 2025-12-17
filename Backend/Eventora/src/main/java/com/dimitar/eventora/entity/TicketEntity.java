package com.dimitar.eventora.entity;

import com.dimitar.eventora.model.Ticket.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Ticket")
public class TicketEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(updatable = false, nullable = false)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "qr_code", nullable = false, unique = true, length = 255)
    private String qrCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TicketStatus status = TicketStatus.ACTIVE;

    @Column(name = "issued_to", nullable = false, length = 255)
    private String issuedTo;

    @Column(name = "delivery_email", nullable = false, length = 320)
    private String deliveryEmail;

    @Column(name = "seat_section", nullable = false, length = 32)
    private String seatSection;

    @Column(name = "seat_row", nullable = false, length = 16)
    private String seatRow;

    @Column(name = "seat_number", nullable = false, length = 16)
    private String seatNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = TicketStatus.ACTIVE;
        }
    }
}
