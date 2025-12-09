package com.dimitar.eventora.websocket;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SeatReservationExpiredEvent extends ApplicationEvent {
    private final SeatReservation reservation;

    public SeatReservationExpiredEvent(SeatReservation reservation) {
        super(reservation);
        this.reservation = reservation;
    }
}
