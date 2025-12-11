package com.dimitar.eventora.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final SeatReservationHandler seatReservationHandler;

    public WebSocketConfig(SeatReservationHandler seatReservationHandler) {
        this.seatReservationHandler = seatReservationHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(seatReservationHandler, "/ws/seats")
                .setAllowedOrigins("*");
    }
}
