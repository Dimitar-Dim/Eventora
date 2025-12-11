package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.EventRequest;
import com.dimitar.eventora.dto.TicketPurchaseRequest;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.model.SeatingLayout;
import com.dimitar.***REMOVED***Role;
import com.dimitar.eventora.repository.EventRepository;
import com.dimitar.eventora.repository.TicketRepository;
import com.dimitar.***REMOVED***Repository;
import com.dimitar.***REMOVED***vice.JwtService;
import com.dimitar.eventora.support.PostgresIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventControllerIT extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanDatabase() {
        ticketRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createEvent_shouldPersistAndReturnCreatedEvent() throws Exception {
        UserEntity organizer = persistUser("organizer", "org@example.com", UserRole.ORGANIZER);

        EventRequest request = new EventRequest(
                "Spring Launch",
                "Product showcase",
                LocalDateTime.now().plusDays(3),
                Genre.Rock,
                new BigDecimal("49.99"),
            150,
            150,
            SeatingLayout.NONE,
            false,
            "https://example.com/event.jpg"
        );

        String bearer = bearerToken(organizer.getId(), organizer.getRole());

        mockMvc.perform(post("/api/events")
                        .header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsBytes(request))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Spring Launch"))
                .andExpect(jsonPath("$.maxTickets").value(150))
                .andExpect(jsonPath("$.organizerId").value(organizer.getId()));

        assertThat(eventRepository.findAll()).hasSize(1);
    }

    @Test
    void getAllEvents_shouldReturnPersistedEvents() throws Exception {
        UserEntity organizer = persistUser("viewer", "viewer@example.com", UserRole.ORGANIZER);
        persistEvent("Tech Expo", organizer.getId(), 100);
        persistEvent("Music Gala", organizer.getId(), 80);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[1].name").value("Music Gala"));
    }

    @Test
    void purchaseTicket_shouldReturnSummaryAndDecreaseAvailability() throws Exception {
        UserEntity organizer = persistUser("***REMOVED***Role.ORGANIZER);
        EventEntity event = persistEvent("Community Day", organizer.getId(), 40);
        Long eventId = Objects.requireNonNull(event.getId());
        int initialAvailability = Objects.requireNonNull(event.getAvailableTickets());

        UserEntity attendee = persistUser("attendee", "attendee@example.com", UserRole.USER);
        TicketPurchaseRequest request = new TicketPurchaseRequest(
            "Alice",
            "attendee@example.com",
            null,
            null,
            null
        );
        String bearer = bearerToken(attendee.getId(), attendee.getRole());

        mockMvc.perform(post("/api/events/{id}/tickets", eventId)
                        .header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsBytes(request))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketId").isNumber())
                .andExpect(jsonPath("$.eventId").value(eventId))
                .andExpect(jsonPath("$.issuedTo").value("Alice"))
                .andExpect(jsonPath("$.remainingTickets").value(initialAvailability - 1));

        assertThat(ticketRepository.count()).isEqualTo(1);
        assertThat(eventRepository.findById(eventId))
                .get()
                .extracting(EventEntity::getAvailableTickets)
                .isEqualTo(initialAvailability - 1);
    }

    @Test
    void purchaseTicket_withoutTokenShouldAllowGuestCheckout() throws Exception {
        UserEntity organizer = persistUser("another", "another@example.com", UserRole.ORGANIZER);
        EventEntity event = persistEvent("Developer Meetup", organizer.getId(), 25);
        Long eventId = Objects.requireNonNull(event.getId());
        TicketPurchaseRequest request = new TicketPurchaseRequest(
            "Guest",
            "guest@example.com",
            null,
            null,
            null
        );

        mockMvc.perform(post("/api/events/{id}/tickets", eventId)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsBytes(request))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deliveryEmail").value("guest@example.com"));
    }

    @SuppressWarnings("null")
    private UserEntity persistUser(String username, String email, UserRole role) {
        UserEntity entity = UserEntity.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode("***REMOVED***"))
                .role(role)
                .build();
        return Objects.requireNonNull(userRepository.save(entity));
    }

    @SuppressWarnings("null")
    private EventEntity persistEvent(String name, Long organizerId, int maxTickets) {
        EventEntity entity = EventEntity.builder()
                .name(name)
                .description("Test event")
                .eventDate(LocalDateTime.now().plusDays(5))
                .genre(Genre.Rock)
                .ticketPrice(new BigDecimal("29.99"))
                .maxTickets(maxTickets)
                .availableTickets(maxTickets)
                .imageUrl("https://example.com/image.jpg")
                .organizerId(organizerId)
                .isActive(true)
                .hasSeating(false)
                .seatingLayout(com.dimitar.eventora.model.SeatingLayout.NONE)
                .seatedCapacity(0)
                .standingCapacity(maxTickets)
                .build();
        return Objects.requireNonNull(eventRepository.save(entity));
    }

    private String bearerToken(Long userId, UserRole role) {
        return "Bearer " + jwtService.createJwt(userId, role.name());
    }

}
