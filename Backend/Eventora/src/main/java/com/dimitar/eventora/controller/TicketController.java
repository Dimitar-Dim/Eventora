package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.TicketHistoryResponse;
import com.dimitar.eventora.dto.VerifyTicketRequest;
import com.dimitar.eventora.dto.VerifyTicketResponse;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.***REMOVED***vice.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping("/verify")
    public ResponseEntity<VerifyTicketResponse> verifyTicket(
            @RequestBody VerifyTicketRequest request,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        
        VerifyTicketResponse response = ticketService.verifyTicket(request.getQrCode(), userId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}/download")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Long ticketId, Authentication authentication) {
        Long userId = extractUserId(authentication);

        var pdf = ticketService.downloadTicket(ticketId, userId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pdf.filename() + "\"")
                .body(pdf.content());
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
                summary.event().getImageUrl(),
                summary.ticket().getSeatSection(),
                summary.ticket().getSeatRow(),
                summary.ticket().getSeatNumber(),
                summary.ticket().getDeliveryEmail()
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
