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
    private final Map<String, Set<WebSocketSession>> eventSessions = new ConcurrentHashMap<>();
    private final SeatReservationService reservationService;

    public SeatReservationHandler(SeatReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long eventId = extractEventId(session);
        if (eventId != null) {
            eventSessions.computeIfAbsent(eventId.toString(), k -> ConcurrentHashMap.newKeySet()).add(session);
            log.info("WebSocket connection established for event {}", eventId);
            
            // Send initial state
            sendInitialState(session, eventId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long eventId = extractEventId(session);
        if (eventId == null) return;

        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = (String) payload.get("type");
        Map<String, Object> data = (Map<String, Object>) payload.get("data");

        switch (type) {
            case "RESERVE":
                handleReserve(eventId, data, session);
                break;
            case "RELEASE":
                handleRelease(eventId, data, session);
                break;
            default:
                log.warn("Unknown message type: {}", type);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long eventId = extractEventId(session);
        if (eventId != null) {
            Set<WebSocketSession> sessions = eventSessions.get(eventId.toString());
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    eventSessions.remove(eventId.toString());
                }
            }
            log.info("WebSocket connection closed for event {}", eventId);
        }
    }

    private void handleReserve(Long eventId, Map<String, Object> data, WebSocketSession session) throws IOException {
        String sector = (String) data.get("sector");
        Integer seatNumber = (Integer) data.get("seatNumber");
        String userId = (String) data.get("userId");

        String key = eventId + "-" + sector + "-" + seatNumber;
        
        // Check if already reserved or purchased
        if (reservationService.isPurchased(eventId, sector, seatNumber)) {
            sendError(session, "Seat is already purchased");
            return;
        }
        
        SeatReservation existing = reservationService.getReservation(key);
        if (existing != null && !existing.getReservedBy().equals(userId)) {
            sendError(session, "Seat is already reserved");
            return;
        }

        // Create or update reservation
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(15);
        SeatReservation reservation = new SeatReservation(***REMOVED***Id, now, expiresAt);
        reservationService.addReservation(key, reservation);

        // Broadcast to all clients
        SeatReservationMessage msg = new SeatReservationMessage("RESERVE", reservation);
        broadcastToEvent(eventId, msg);
    }

    private void handleRelease(Long eventId, Map<String, Object> data, WebSocketSession session) throws IOException {
        String sector = (String) data.get("sector");
        Integer seatNumber = (Integer) data.get("seatNumber");
        String userId = (String) data.get("userId");

        String key = eventId + "-" + sector + "-" + seatNumber;
        SeatReservation existing = reservationService.getReservation(key);
        
        if (existing != null && existing.getReservedBy().equals(userId)) {
            reservationService.removeReservation(key);
            
            SeatInfo seatInfo = new SeatInfo(eventId, sector, seatNumber);
            SeatReservationMessage msg = new SeatReservationMessage("RELEASE", seatInfo);
            broadcastToEvent(eventId, msg);
        }
    }

    private void sendInitialState(WebSocketSession session, Long eventId) throws IOException {
        List<SeatState> states = new ArrayList<>();
        
        // Add all current reservations
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
        
        // Add purchased seats
        states.addAll(reservationService.getPurchasedSeats(eventId));
        
        SeatReservationMessage msg = new SeatReservationMessage("INITIAL_STATE", states);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(msg)));
    }

    private void broadcastToEvent(Long ***REMOVED***vationMessage message) {
        Set<WebSocketSession> sessions = eventSessions.get(eventId.toString());
        if (sessions != null) {
            String payload;
            try {
                payload = objectMapper.writeValueAsString(message);
            } catch (Exception e) {
                log.error("Failed to serialize message", e);
                return;
            }
            
            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(payload));
                    }
                } catch (IOException e) {
                    log.error("Failed to send message to session", e);
                }
            });
        }
    }

    private void sendError(WebSocketSession session, String error) throws IOException {
        Map<String, String> errorMsg = Map.of("type", "ERROR", "message", error);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorMsg)));
    }

    private Long extractEventId(WebSocketSession session) {
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        try {
            return Long.parseLong(parts[parts.length - 1]);
        } catch (Exception e) {
            log.error("Failed to extract eventId from path: {}", path);
            return null;
        }
    }

    @EventListener
    public void handleReservationExpired(SeatReservationExpiredEvent event) {
        SeatReservation reservation = ***REMOVED***vation();
        SeatInfo seatInfo = new SeatInfo(reservation.getEventId(), reservation.getSector(), reservation.getSeatNumber());
        SeatReservationMessage msg = new SeatReservationMessage("RESERVATION_EXPIRED", seatInfo);
        broadcastToEvent(reservation.getEventId(), msg);
        log.info("Broadcasted expiry for reservation: {}-{}-{}", 
                reservation.getEventId(), reservation.getSector(), reservation.getSeatNumber());
    }

    @EventListener
    public void handleSeatPurchased(SeatPurchasedEvent event) {
        SeatState seatState = event.getSeatState();
        SeatReservationMessage msg = new SeatReservationMessage("PURCHASE", seatState);
        broadcastToEvent(seatState.getEventId(), msg);
        log.info("Broadcasted purchase for seat: {}-{}-{}", 
                seatState.getEventId(), seatState.getSector(), seatState.getSeatNumber());
    }
}
