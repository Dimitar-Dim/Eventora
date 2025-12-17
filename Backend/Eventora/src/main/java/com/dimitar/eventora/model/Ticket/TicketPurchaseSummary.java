package com.dimitar.eventora.model.Ticket;

import com.dimitar.eventora.model.Event.Event;

public record TicketPurchaseSummary(Ticket ticket, Event event) {
}
