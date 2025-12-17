package com.dimitar.eventora.dto.Ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyTicketResponse {
    private boolean verified;
    private String message;
    private Long ticketId;
    private String eventName;
    private String issuedTo;
    private String seatInfo;
}
