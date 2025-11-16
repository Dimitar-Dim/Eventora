package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.EventDTO;
import com.dimitar.eventora.dto.TicketPurchaseRequest;
import com.dimitar.eventora.dto.TicketPurchaseResponse;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.***REMOVED***vice.EventService;
import com.dimitar.***REMOVED***vice.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventDTO dto) {
        Event event = eventService.createEvent(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id, 
                                             @Valid @RequestBody EventDTO dto) {
        Event event = eventService.updateEvent(id, dto);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Event> deactivateEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        Event event = eventService.deactivateEvent(id);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/{id}/tickets")
    public ResponseEntity<TicketPurchaseResponse> purchaseTicket(
            @PathVariable @Positive(message = "Event ID must be positive") Long id,
            @Valid @RequestBody(required = false) TicketPurchaseRequest request,
            Authentication authentication) {

        Long userId = extractUserId(authentication);
        String issuedTo = request != null ? request.issuedTo() : null;

        TicketPurchaseSummary purchaseSummary = ticketService.purchaseTicket(id, userId, issuedTo);

        TicketPurchaseResponse response = new TicketPurchaseResponse(
                purchaseSummary.ticket().getId(),
                purchaseSummary.event().getId(),
                purchaseSummary.event().getName(),
                purchaseSummary.ticket().getIssuedTo(),
                purchaseSummary.ticket().getQrCode(),
                purchaseSummary.ticket().getStatus(),
                purchaseSummary.event().getAvailableTickets(),
                purchaseSummary.event().getTicketPrice(),
                purchaseSummary.ticket().getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException();
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new UnauthorizedException();
        }
    }
}
