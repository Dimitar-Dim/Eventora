package com.dimitar.eventora.websocket;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class SeatPurchasedEvent extends ApplicationEvent {
    private final SeatState seatState;

    public SeatPurchasedEvent(SeatState seatState) {
        super(seatState);
        this.seatState = seatState;
    }
}
