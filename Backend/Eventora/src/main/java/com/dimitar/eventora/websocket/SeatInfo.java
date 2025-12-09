package com.dimitar.eventora.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatInfo {
    private Long eventId;
    private String sector;
    private Integer seatNumber;
}
