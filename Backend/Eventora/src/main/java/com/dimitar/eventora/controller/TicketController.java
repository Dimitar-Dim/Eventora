package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.TicketHistoryResponse;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.***REMOVED***vice.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/me")
    public ResponseEntity<List<TicketHistoryResponse>> getMyTickets(Authentication authentication) {
        Long userId = extractUserId(authentication);

        List<TicketHistoryResponse> response = ticketService.getTicketsForUser(userId).stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    private TicketHistoryResponse toResponse(TicketPurchaseSummary summary) {
        return new TicketHistoryResponse(
                summary.ticket().getId(),
                summary.event().getId(),
                summary.event().getName(),
                summary.event().getEventDate(),
                summary.ticket().getIssuedTo(),
                summary.ticket().getQrCode(),
                summary.ticket().getStatus(),
                summary.event().getTicketPrice(),
                summary.ticket().getCreatedAt(),
                summary.event().getImageUrl()
        );
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
