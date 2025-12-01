package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.model.TicketPurchaseSummary;

import java.util.List;

public interface TicketService {
    TicketPurchaseSummary purchaseTicket(Long ***REMOVED***Id, String issuedTo, String deliveryEmail);
    List<TicketPurchaseSummary> getTicketsForUser(Long userId);
}
