package com.dimitar.eventora.controller;

import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.***REMOVED***Role;
import com.dimitar.eventora.repository.EventRepository;
import com.dimitar.eventora.repository.TicketRepository;
import com.dimitar.***REMOVED***Repository;
import com.dimitar.***REMOVED***vice.JwtService;
import com.dimitar.***REMOVED***vice.TicketService;
import com.dimitar.eventora.support.PostgresIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

        TicketPurchaseSummary summary = ticketService.purchaseTicket(event.getId(), attendee.getId(), "Customer");

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

    private UserEntity persistUser(String username, String email, UserRole role) {
        UserEntity entity = UserEntity.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode("***REMOVED***"))
                .role(role)
                .build();
        return userRepository.saveAndFlush(entity);
    }

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
                .build();
            return eventRepository.saveAndFlush(entity);
    }

    private String bearerToken(Long userId, UserRole role) {
        return "Bearer " + jwtService.createJwt(userId, role.name());
    }
}
