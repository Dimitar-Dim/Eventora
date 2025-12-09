package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.EventRequest;
import com.dimitar.eventora.dto.EventResponse;
import com.dimitar.eventora.dto.TicketPurchaseRequest;
import com.dimitar.eventora.dto.TicketPurchaseResponse;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.eventora.mapper.EventDtoMapper;
import com.dimitar.***REMOVED***vice.EventService;
import com.dimitar.***REMOVED***vice.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final TicketService ticketService;
    private final EventDtoMapper eventDtoMapper;

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request,
                                                     Authentication authentication) {
        Long requesterId = extractUserId(authentication);
        boolean canOrganize = hasOrganizerPrivileges(authentication);
        Event event = eventService.createEvent(request, requesterId, canOrganize);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventDtoMapper.toResponse(event));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents().stream()
                .map(eventDtoMapper::toResponse)
                .toList();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(eventDtoMapper.toResponse(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id,
                                                     @Valid @RequestBody EventRequest request,
                                                     Authentication authentication) {
        Long requesterId = extractUserId(authentication);
        boolean canManageAll = hasAdminPrivileges(authentication);
        Event event = eventService.updateEvent(id, request, requesterId, canManageAll);
        return ResponseEntity.ok(eventDtoMapper.toResponse(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id,
                                            Authentication authentication) {
        Long requesterId = extractUserId(authentication);
        boolean canManageAll = hasAdminPrivileges(authentication);
        eventService.deleteEvent(id, requesterId, canManageAll);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<EventResponse> deactivateEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id,
                                                         Authentication authentication) {
        Long requesterId = extractUserId(authentication);
        boolean canManageAll = hasAdminPrivileges(authentication);
        Event event = eventService.deactivateEvent(id, requesterId, canManageAll);
        return ResponseEntity.ok(eventDtoMapper.toResponse(event));
    }

    @PostMapping("/{id}/tickets")
    public ResponseEntity<TicketPurchaseResponse> purchaseTicket(
            @PathVariable @Positive(message = "Event ID must be positive") Long id,
            @Valid @RequestBody(required = false) TicketPurchaseRequest request,
            Authentication authentication) {

        Long userId = extractOptionalUserId(authentication);
        String issuedTo = request != null ? request.issuedTo() : null;
        String deliveryEmail = request != null ? request.deliveryEmail() : null;

        TicketPurchaseSummary purchaseSummary = ticketService.purchaseTicket(id, userId, issuedTo, deliveryEmail);

        TicketPurchaseResponse response = new TicketPurchaseResponse(
                purchaseSummary.ticket().getId(),
                purchaseSummary.event().getId(),
                purchaseSummary.event().getName(),
                purchaseSummary.ticket().getIssuedTo(),
                purchaseSummary.ticket().getQrCode(),
                purchaseSummary.ticket().getStatus(),
                purchaseSummary.event().getAvailableTickets(),
                purchaseSummary.event().getTicketPrice(),
                purchaseSummary.ticket().getCreatedAt(),
                purchaseSummary.ticket().getSeatSection(),
                purchaseSummary.ticket().getSeatRow(),
                purchaseSummary.ticket().getSeatNumber(),
                purchaseSummary.ticket().getDeliveryEmail()
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

    private boolean hasAdminPrivileges(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_ADMIN"));
    }

    private boolean hasOrganizerPrivileges(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_ORGANIZER") || authority.equals("ROLE_ADMIN"));
    }

    private Long extractOptionalUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
