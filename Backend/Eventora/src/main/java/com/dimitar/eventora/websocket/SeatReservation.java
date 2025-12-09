package com.dimitar.eventora.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservation {
    private Long eventId;
    private String sector;
    private Integer seatNumber;
    private String reservedBy;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;
}
