package com.dimitar.***REMOVED***vice.Ticket;

import com.dimitar.eventora.dto.Ticket.VerifyTicketResponse;
import com.dimitar.eventora.model.Ticket.TicketPurchaseSummary;
import com.dimitar.eventora.model.Ticket.TicketPdf;

import java.util.List;
import java.util.Map;

public interface TicketService {
    TicketPurchaseSummary purchaseTicket(Long ***REMOVED***Id, String issuedTo, String deliveryEmail, 
                                          String seatSection, String seatRow, String seatNumber);
    List<TicketPurchaseSummary> getTicketsForUser(Long userId);
    List<Map<String, Object>> getPurchasedSeatsForEvent(Long eventId);
    VerifyTicketResponse verifyTicket(String qrCode, Long verifierId);
    TicketPdf downloadTicket(Long ticketId, Long userId);
}
