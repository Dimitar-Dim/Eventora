package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailVerifier;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.entity.TicketEntity;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.exception.TicketPurchaseException;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.mapper.EventMapper;
import com.dimitar.eventora.mapper.TicketMapper;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.model.TicketPdf;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.eventora.model.TicketStatus;
import com.dimitar.eventora.repository.EventRepository;
import com.dimitar.eventora.repository.TicketRepository;
import com.dimitar.***REMOVED***Repository;
import com.dimitar.***REMOVED***vationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TicketService Tests")
@SuppressWarnings({"null", "NullAway"})
class TicketServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PDFTicketService pdfTicketService;

    @Mock
    private EmailService emailService;

    @Mock
    private EmailVerifier emailVerifier;

    @Mock
    private SeatReservationService seatReservationService;

    @Spy
    private EventMapper eventMapper = new EventMapper();

    @Spy
    private TicketMapper ticketMapper = new TicketMapper();

    @InjectMocks
    private TicketServiceImpl ticketService;

    private EventEntity activeEvent;
    private UserEntity ticketOwner;

    @BeforeEach
    void setUp() {
        activeEvent = EventEntity.builder()
                .id(1L)
                .name("Indie Night")
                .description("Enjoy live indie performances")
                .eventDate(LocalDateTime.of(2025, 5, 10, 19, 0))
                .genre(Genre.Rock)
                .ticketPrice(new BigDecimal("25.00"))
                .maxTickets(100)
                .availableTickets(50)
                .imageUrl("https://example.com/indie.jpg")
                .isActive(true)
                .organizerId(42L)
                .createdAt(LocalDateTime.now().minusDays(10))
                .updatedAt(LocalDateTime.now().minusDays(5))
                .build();

            ticketOwner = UserEntity.builder()
                .id(7L)
                .username("alice")
                .email("alice@example.com")
                .build();

            lenient().when(userRepository.findById(anyLong())).thenReturn(Optional.of(ticketOwner));
            lenient().when(pdfTicketService.generateTicketPdf(anyString(), anyString(), anyString())).thenReturn(new byte[]{1});
            lenient().doNothing().when(emailService).send(any());
            lenient().doNothing().when(emailVerifier).verifyDeliverability(anyString());
    }

    @Test
    @DisplayName("purchaseTicket should persist ticket and decrement inventory for active event")
    void purchaseTicket_ActiveEvent_Succeeds() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(activeEvent));
        when(ticketRepository.save(any(TicketEntity.class))).thenAnswer(invocation -> {
            TicketEntity entity = invocation.getArgument(0);
            entity.setId(99L);
            entity.setCreatedAt(LocalDateTime.now());
            return entity;
        });
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketPurchaseSummary summary = ticketService.purchaseTicket(1L, 7L, "Alice", null, null, null, null);

        assertNotNull(summary);
        assertEquals("Alice", summary.ticket().getIssuedTo());
        assertEquals(49, summary.event().getAvailableTickets());
        assertEquals(99L, summary.ticket().getId());

        verify(ticketRepository, times(1)).save(any(TicketEntity.class));
        verify(eventRepository, times(1)).save(any(EventEntity.class));
    }

        @Test
        @DisplayName("purchaseTicket should reject guest purchases with undeliverable email")
        void purchaseTicket_InvalidGuestEmail_ThrowsException() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(activeEvent));
        doThrow(new IllegalArgumentException("Email domain must accept mail"))
            .when(emailVerifier).verifyDeliverability("invalid@fake-domain.test");

        TicketPurchaseException exception = assertThrows(
            TicketPurchaseException.class,
            () -> ticketService.purchaseTicket(1L, null, "Guest", "invalid@fake-domain.test", null, null, null)
        );

        assertEquals("Please provide a valid email address so we can deliver the ticket.", exception.getMessage());
        verify(ticketRepository, never()).save(any());
        verify(eventRepository, never()).save(any());
        }

    @Test
    @DisplayName("purchaseTicket should fail when event is inactive")
    void purchaseTicket_InactiveEvent_ThrowsException() {
    EventEntity inactiveEvent = copyOf(activeEvent);
    inactiveEvent.setIsActive(false);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(inactiveEvent));

        assertThrows(TicketPurchaseException.class, () -> ticketService.purchaseTicket(1L, 7L, "Alice", null, null, null, null));

        verify(ticketRepository, never()).save(any());
        verify(eventRepository, never()).save(any());
    }

    @Test
    @DisplayName("getTicketsForUser should join ticket and event data")
    void getTicketsForUser_ReturnsSummaries() {
        TicketEntity firstTicket = TicketEntity.builder()
                .id(100L)
                .eventId(1L)
                .userId(7L)
                .qrCode("QR-1")
                .status(TicketStatus.ACTIVE)
                .issuedTo("Alice")
                .createdAt(LocalDateTime.now())
                .build();

        TicketEntity secondTicket = TicketEntity.builder()
                .id(101L)
                .eventId(2L)
                .userId(7L)
                .qrCode("QR-2")
                .status(TicketStatus.USED)
                .issuedTo("Bob")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

    EventEntity secondEvent = copyOf(activeEvent);
    secondEvent.setId(2L);
    secondEvent.setName("Jazz Soiree");

        when(ticketRepository.findAllByUserIdOrderByCreatedAtDesc(7L))
                .thenReturn(Arrays.asList(firstTicket, secondTicket));
        when(eventRepository.findAllById(anyIterable()))
                .thenReturn(Arrays.asList(activeEvent, secondEvent));

        List<TicketPurchaseSummary> summaries = ticketService.getTicketsForUser(7L);

        assertEquals(2, summaries.size());
        Event firstEvent = summaries.get(0).event();
        assertEquals("Indie Night", firstEvent.getName());
        assertEquals("Jazz Soiree", summaries.get(1).event().getName());
    }

    @Test
    @DisplayName("downloadTicket should regenerate PDF for ticket owner")
    void downloadTicket_Owner_Succeeds() {
        TicketEntity ticket = TicketEntity.builder()
                .id(200L)
                .eventId(1L)
                .userId(ticketOwner.getId())
                .qrCode("QR-200")
                .issuedTo("Alice")
                .build();

        when(ticketRepository.findById(200L)).thenReturn(Optional.of(ticket));
        when(eventRepository.findById(1L)).thenReturn(Optional.of(activeEvent));
        when(pdfTicketService.generateTicketPdf(anyString(), anyString(), anyString())).thenReturn(new byte[]{1,2,3});

        TicketPdf pdf = ticketService.downloadTicket(200L, ticketOwner.getId());

        assertNotNull(pdf);
        assertTrue(pdf.filename().endsWith(".pdf"));
        assertArrayEquals(new byte[]{1,2,3}, pdf.content());

        verify(pdfTicketService).generateTicketPdf(activeEvent.getName(), ticket.getIssuedTo(), ticket.getQrCode());
    }

    @Test
    @DisplayName("downloadTicket should reject when caller is not owner")
    void downloadTicket_NotOwner_Unauthorized() {
        TicketEntity ticket = TicketEntity.builder()
                .id(201L)
                .eventId(1L)
                .userId(999L)
                .qrCode("QR-201")
                .issuedTo("Other")
                .build();

        when(ticketRepository.findById(201L)).thenReturn(Optional.of(ticket));

        assertThrows(UnauthorizedException.class, () -> ticketService.downloadTicket(201L, ticketOwner.getId()));
        verify(pdfTicketService, never()).generateTicketPdf(anyString(), anyString(), anyString());
    }

        private EventEntity copyOf(EventEntity source) {
            EventEntity clone = EventEntity.builder()
                    .id(source.getId())
                    .name(source.getName())
                    .description(source.getDescription())
                    .eventDate(source.getEventDate())
                    .genre(source.getGenre())
                    .ticketPrice(source.getTicketPrice())
                    .maxTickets(source.getMaxTickets())
                    .availableTickets(source.getAvailableTickets())
                    .imageUrl(source.getImageUrl())
                    .isActive(source.getIsActive())
                    .organizerId(source.getOrganizerId())
                    .build();
            clone.setCreatedAt(source.getCreatedAt());
            clone.setUpdatedAt(source.getUpdatedAt());
            return clone;
        }
}
