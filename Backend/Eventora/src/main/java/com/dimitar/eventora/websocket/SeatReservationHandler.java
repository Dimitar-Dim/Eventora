package com.dimitar.eventora.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class SeatReservationHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<Long, Set<WebSocketSession>> eventSessions = new ConcurrentHashMap<>();
    private final SeatReservationService reservationService;

    public SeatReservationHandler(SeatReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long eventId = getEventId(session);
        if (eventId == null) return;

        eventSessions.computeIfAbsent(eventId, k -> ConcurrentHashMap.newKeySet()).add(session);
        
        sendInitialState(session, eventId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            Long eventId = getEventId(session);
            if (eventId == null) return;

            Map<String, Object> msg = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) msg.get("type");
            Map<String, Object> data = (Map<String, Object>) msg.get("data");

            if ("RESERVE".equals(type)) {
                handleReserve(eventId, data);
            } else if ("RELEASE".equals(type)) {
                handleRelease(eventId, data);
            }
        } catch (Exception e) {
            log.error("Error handling message", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long eventId = getEventId(session);
        if (eventId == null) return;

        Set<WebSocketSession> sessions = eventSessions.get(eventId);
        if (sessions != null) {
            sessions.remove(session);
        }
    }

    private void handleReserve(Long eventId, Map<String, Object> data) {
        String sector = (String) data.get("sector");
        Integer seatNumber = (Integer) data.get("seatNumber");
        String userId = (String) data.get("userId");

        String key = eventId + "-" + sector + "-" + seatNumber;
        if (reservationService.isPurchased(eventId, sector, seatNumber)) {
            return;
        }

        SeatReservation existing = reservationService.getReservation(key);
        if (existing != null && !existing.getReservedBy().equals(userId)) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expires = now.plusMinutes(15);
        SeatReservation reservation = new SeatReservation(***REMOVED***Id, now, expires);
        reservationService.addReservation(key, reservation);

        SeatState state = new SeatState();
        state.setEventId(eventId);
        state.setSector(sector);
        state.setSeatNumber(seatNumber);
        state.setStatus("reserved");
        state.setReservedBy(userId);
        state.setExpiresAt(expires.format(DateTimeFormatter.ISO_DATE_TIME));

        broadcast(eventId, "RESERVE", state);
    }

    private void handleRelease(Long eventId, Map<String, Object> data) {
        String sector = (String) data.get("sector");
        Integer seatNumber = (Integer) data.get("seatNumber");
        String userId = (String) data.get("userId");

        String key = eventId + "-" + sector + "-" + seatNumber;
        SeatReservation existing = reservationService.getReservation(key);
        if (existing != null && existing.getReservedBy().equals(userId)) {
            reservationService.removeReservation(key);

            SeatInfo info = new SeatInfo(eventId, sector, seatNumber);
            broadcast(eventId, "RELEASE", info);
        }
    }

    private void sendInitialState(WebSocketSession session, Long eventId) {
        try {
            List<SeatState> states = new ArrayList<>();

            reservationService.getReservations().values().stream()
                    .filter(r -> r.getEventId().equals(eventId))
                    .filter(r -> r.getExpiresAt().isAfter(LocalDateTime.now()))
                    .forEach(r -> {
                        SeatState state = new SeatState();
                        state.setEventId(r.getEventId());
                        state.setSector(r.getSector());
                        state.setSeatNumber(r.getSeatNumber());
                        state.setStatus("reserved");
                        state.setReservedBy(r.getReservedBy());
                        state.setExpiresAt(r.getExpiresAt().format(DateTimeFormatter.ISO_DATE_TIME));
                        states.add(state);
                    });

            states.addAll(reservationService.getPurchasedSeats(eventId));

            SeatReservationMessage msg = new SeatReservationMessage("INITIAL_STATE", states);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(msg)));
        } catch (Exception e) {
            log.error("Error sending initial state", e);
        }
    }

    private void broadcast(Long eventId, String type, Object data) {
        Set<WebSocketSession> sessions = eventSessions.get(eventId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        try {
            SeatReservationMessage msg = new SeatReservationMessage(type, data);
            String json = objectMapper.writeValueAsString(msg);

            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(json));
                    }
                } catch (IOException e) {
                    log.error("Failed to send", e);
                }
            });
        } catch (Exception e) {
            log.error("Failed to broadcast", e);
        }
    }

    @EventListener
    public void handleReservationExpired(SeatReservationExpiredEvent event) {
        SeatReservation r = ***REMOVED***vation();
        SeatInfo info = new SeatInfo(r.getEventId(), r.getSector(), r.getSeatNumber());
        broadcast(r.getEventId(), "RESERVATION_EXPIRED", info);
    }

    @EventListener
    public void handleSeatPurchased(SeatPurchasedEvent event) {
        SeatState state = event.getSeatState();
        broadcast(state.getEventId(), "PURCHASE", state);
    }

    private Long getEventId(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] kv = param.split("=");
                    if (kv.length == 2 && "eventId".equals(kv[0])) {
                        return Long.parseLong(kv[1]);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to get eventId", e);
        }
        return null;
    }
}
