package com.dimitar.eventora.websocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;

class SeatReservationServiceTest {

    private SeatReservationService service;

    @Mock
    private ApplicationEventPublisher publisher;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new SeatReservationService(publisher);
    }

    @Test
    @DisplayName("markAsPurchased should remove reservation and publish purchase event")
    void markAsPurchased_removesReservationAndPublishes() {
        String key = "1-A-5";
        SeatReservation reservation = new SeatReservation(1L, "A", 5, "user-1",
                LocalDateTime.now(), LocalDateTime.now().plusMinutes(5));
        service.addReservation(key, reservation);

        service.markAsPurchased(1L, "A", 5, null);

        assertThat(service.getReservation(key)).isNull();
        assertThat(service.getPurchasedSeats(1L)).hasSize(1);

        ArgumentCaptor<SeatPurchasedEvent> eventCaptor = ArgumentCaptor.forClass(SeatPurchasedEvent.class);
        verify(publisher).publishEvent(eventCaptor.capture());
        SeatPurchasedEvent event = eventCaptor.getValue();
        assertThat(event.getSeatState().getEventId()).isEqualTo(1L);
        assertThat(event.getSeatState().getSeatNumber()).isEqualTo(5);
        assertThat(event.getSeatState().getStatus()).isEqualTo("purchased");
        verifyNoMoreInteractions(publisher);
    }

    @Test
    @DisplayName("expireReservations should evict expired entries and publish expiration event")
    void expireReservations_removesExpiredAndPublishesEvent() {
        String keyExpired = "2-B-10";
        SeatReservation expired = new SeatReservation(2L, "B", 10, "user-2",
                LocalDateTime.now().minusMinutes(10), LocalDateTime.now().minusMinutes(1));
        service.addReservation(keyExpired, expired);

        String keyFuture = "2-B-11";
        SeatReservation future = new SeatReservation(2L, "B", 11, "user-3",
                LocalDateTime.now(), LocalDateTime.now().plusMinutes(2));
        service.addReservation(keyFuture, future);

        service.expireReservations();

        assertThat(service.getReservation(keyExpired)).isNull();
        assertThat(service.getReservation(keyFuture)).isNotNull();

        ArgumentCaptor<SeatReservationExpiredEvent> ***REMOVED***vationExpiredEvent.class);
        verify(publisher).publishEvent(eventCaptor.capture());
        SeatReservationExpiredEvent event = eventCaptor.getValue();
        assertThat(***REMOVED***vation().getSeatNumber()).isEqualTo(10);
        assertThat(***REMOVED***vation().getEventId()).isEqualTo(2L);
    }
}
