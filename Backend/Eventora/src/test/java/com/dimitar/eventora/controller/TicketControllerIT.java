package com.dimitar.eventora.controller;

import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.model.Event.Genre;
import com.dimitar.eventora.model.Event.SeatingLayout;
import com.dimitar.eventora.model.Ticket.TicketPurchaseSummary;
import com.dimitar.***REMOVED***Role;
import com.dimitar.eventora.repository.EventRepository;
import com.dimitar.eventora.repository.TicketRepository;
import com.dimitar.***REMOVED***Repository;
import com.dimitar.***REMOVED***vice.Auth.JwtService;
import com.dimitar.***REMOVED***vice.Ticket.TicketService;
import com.dimitar.eventora.support.PostgresIntegrationTest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.hamcrest.Matchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TicketControllerIT extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

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
    void getMyTickets_shouldReturnTicketHistory() throws Exception {
        UserEntity organizer = persistUser("org", "org@example.com", UserRole.ORGANIZER);
        EventEntity event = persistEvent("Live Show", organizer.getId());
        UserEntity attendee = persistUser("customer", "customer@example.com", UserRole.USER);

        TicketPurchaseSummary summary = ticketService.purchaseTicket(
            event.getId(),
            attendee.getId(),
            "Customer",
            null,
            null,
            null,
            null
        );

        String bearer = bearerToken(attendee.getId(), attendee.getRole());

        mockMvc.perform(get("/api/tickets/me")
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ticketId").value(summary.ticket().getId()))
                .andExpect(jsonPath("$[0].eventId").value(event.getId()))
                .andExpect(jsonPath("$[0].eventName").value(event.getName()))
                .andExpect(jsonPath("$[0].issuedTo").value("Customer"));

        assertThat(ticketRepository.count()).isEqualTo(1);
    }

    @Test
    void getMyTickets_withoutTokenShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tickets/me"))
                .andExpect(status().isUnauthorized());
    }

        @Test
        void downloadTicket_shouldReturnPdfForOwner() throws Exception {
        UserEntity organizer = persistUser("org", "org@example.com", UserRole.ORGANIZER);
        EventEntity event = persistEvent("Downloadable Show", organizer.getId());
        UserEntity attendee = persistUser("customer", "customer@example.com", UserRole.USER);

        TicketPurchaseSummary summary = ticketService.purchaseTicket(
            event.getId(),
            attendee.getId(),
            "Customer",
            null,
            null,
            null,
            null
        );

        String bearer = bearerToken(attendee.getId(), attendee.getRole());

        mockMvc.perform(get("/api/tickets/" + summary.ticket().getId() + "/download")
                .header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, Matchers.containsString("attachment")))
            .andExpect(result -> assertThat(result.getResponse().getContentAsByteArray().length).isGreaterThan(0));
        }

        @Test
        void downloadTicket_shouldRejectNonOwner() throws Exception {
        UserEntity organizer = persistUser("org", "org@example.com", UserRole.ORGANIZER);
        EventEntity event = persistEvent("Download Guard", organizer.getId());
        UserEntity owner = persistUser("owner", "owner@example.com", UserRole.USER);
        UserEntity intruder = persistUser("intruder", "intruder@example.com", UserRole.USER);

        TicketPurchaseSummary summary = ticketService.purchaseTicket(
            event.getId(),
            owner.getId(),
            "Owner",
            null,
            null,
            null,
            null
        );

        String bearer = bearerToken(intruder.getId(), intruder.getRole());

        mockMvc.perform(get("/api/tickets/" + summary.ticket().getId() + "/download")
                .header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isUnauthorized());
        }

    @SuppressWarnings("null")
    private UserEntity persistUser(String username, String email, UserRole role) {
        UserEntity entity = UserEntity.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode("***REMOVED***"))
                .role(role)
                .build();
        return Objects.requireNonNull(userRepository.saveAndFlush(entity));
    }

    @SuppressWarnings("null")
    private EventEntity persistEvent(String name, Long organizerId) {
        EventEntity entity = EventEntity.builder()
                .name(name)
                .description("Ticket test event")
                .eventDate(LocalDateTime.now().plusDays(2))
                .genre(Genre.Rock)
                .ticketPrice(new BigDecimal("35.00"))
                .maxTickets(50)
                .availableTickets(50)
                .imageUrl("https://example.com/event.jpg")
                .organizerId(organizerId)
                .isActive(true)
                .hasSeating(false)
                .seatingLayout(SeatingLayout.NONE)
                .seatedCapacity(0)
                .standingCapacity(50)
                .build();
                return Objects.requireNonNull(eventRepository.saveAndFlush(entity));
    }

    private String bearerToken(Long userId, UserRole role) {
        return "Bearer " + jwtService.createJwt(userId, role.name());
    }

}
