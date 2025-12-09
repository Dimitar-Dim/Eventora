package com.dimitar.eventora.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatState {
    private Long eventId;
    private String sector;
    private Integer seatNumber;
    private String status; // available, reserved, purchased
    private String reservedBy;
    private String expiresAt;
}
