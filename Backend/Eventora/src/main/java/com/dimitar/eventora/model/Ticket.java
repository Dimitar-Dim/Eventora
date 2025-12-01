package com.dimitar.eventora.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    private Long id;
    private Long eventId;
    private Long userId;
    private String qrCode;
    private TicketStatus status;
    private String issuedTo;
    private String deliveryEmail;
    private String seatSection;
    private String seatRow;
    private String seatNumber;
    private LocalDateTime createdAt;
    private LocalDateTime usedAt;
}
