package com.dimitar.eventora.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SeatReservationService {

    private final Map<String, SeatState> purchasedSeats = new ConcurrentHashMap<>();
    private final Map<String, SeatReservation> reservations = new ConcurrentHashMap<>();
    private final ApplicationEventPublisher eventPublisher;

    public SeatReservationService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void addReservation(String key, SeatReservation reservation) {
        reservations.put(key, reservation);
    }

    public void removeReservation(String key) {
        reservations.remove(key);
    }

    public SeatReservation getReservation(String key) {
        return reservations.get(key);
    }

    public Map<String, SeatReservation> getReservations() {
        return reservations;
    }

    public void markAsPurchased(Long eventId, String sector, Integer seatNumber, String seatRow) {
        int rowIndex = 0;
        if (seatRow != null && seatRow.startsWith("R")) {
            try {
                rowIndex = Integer.parseInt(seatRow.substring(1)) - 1;
            } catch (NumberFormatException ignored) {
                rowIndex = 0;
            }
        }

        int absoluteSeatNumber = (rowIndex * 20) + seatNumber;
        String key = eventId + "-" + sector + "-" + absoluteSeatNumber;

        removeReservation(key);

        SeatState state = new SeatState();
        state.setEventId(eventId);
        state.setSector(sector);
        state.setSeatNumber(absoluteSeatNumber);
        state.setStatus("purchased");
        purchasedSeats.put(key, state);

        eventPublisher.publishEvent(new SeatPurchasedEvent(state));

        log.info("Seat marked as purchased: {}", key);
    }

    public boolean isPurchased(Long eventId, String sector, Integer seatNumber) {
        String key = eventId + "-" + sector + "-" + seatNumber;
        return purchasedSeats.containsKey(key);
    }

    public List<SeatState> getPurchasedSeats(Long eventId) {
        return purchasedSeats.values().stream()
                .filter(s -> s.getEventId().equals(eventId))
                .toList();
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void expireReservations() {
        LocalDateTime now = LocalDateTime.now();
        
        List<String> toExpire = new ArrayList<>();
        reservations.forEach((key, reservation) -> {
            if (reservation.getExpiresAt().isBefore(now)) {
                toExpire.add(key);
            }
        });
        
        toExpire.forEach(key -> {
            SeatReservation reservation = reservations.remove(key);
            if (reservation != null) {
                // Publish event for handler to broadcast
                ***REMOVED***vation));
                log.info("Expired reservation: {}", key);
            }
        });
    }
}
