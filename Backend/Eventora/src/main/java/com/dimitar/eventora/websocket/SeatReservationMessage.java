package com.dimitar.eventora.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservationMessage {
    private SeatReservationType type;
    private Object data;

    public enum SeatReservationType {
        RESERVE,
        RELEASE,
        PURCHASE,
        INITIAL_STATE,
        RESERVATION_EXPIRED
    }
}
