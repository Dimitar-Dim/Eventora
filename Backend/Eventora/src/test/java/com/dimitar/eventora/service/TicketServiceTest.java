package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.entity.TicketEntity;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.exception.TicketPurchaseException;
import com.dimitar.eventora.mapper.EventMapper;
import com.dimitar.eventora.mapper.TicketMapper;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.eventora.model.TicketStatus;
import com.dimitar.eventora.repository.EventRepository;
import com.dimitar.eventora.repository.TicketRepository;
import com.dimitar.***REMOVED***Repository;
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

        TicketPurchaseSummary summary = ticketService.purchaseTicket(1L, 7L, "Alice");

        assertNotNull(summary);
        assertEquals("Alice", summary.ticket().getIssuedTo());
        assertEquals(49, summary.event().getAvailableTickets());
        assertEquals(99L, summary.ticket().getId());

        verify(ticketRepository, times(1)).save(any(TicketEntity.class));
        verify(eventRepository, times(1)).save(any(EventEntity.class));
        verify(emailService, times(1)).send(any());
    }

    @Test
    @DisplayName("purchaseTicket should fail when event is inactive")
    void purchaseTicket_InactiveEvent_ThrowsException() {
    EventEntity inactiveEvent = copyOf(activeEvent);
    inactiveEvent.setIsActive(false);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(inactiveEvent));

        assertThrows(TicketPurchaseException.class, () -> ticketService.purchaseTicket(1L, 7L, "Alice"));

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
