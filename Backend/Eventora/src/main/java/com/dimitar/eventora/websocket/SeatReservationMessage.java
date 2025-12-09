package com.dimitar.eventora.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservationMessage {
    private String type; // RESERVE, RELEASE, PURCHASE, INITIAL_STATE, RESERVATION_EXPIRED
    private Object data;
}
