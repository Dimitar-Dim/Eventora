package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.model.TicketPurchaseSummary;

import java.util.List;
import java.util.Map;

public interface TicketService {
    TicketPurchaseSummary purchaseTicket(Long ***REMOVED***Id, String issuedTo, String deliveryEmail, 
                                          String seatSection, String seatRow, String seatNumber);
    List<TicketPurchaseSummary> getTicketsForUser(Long userId);
    List<Map<String, Object>> getPurchasedSeatsForEvent(Long eventId);
}
