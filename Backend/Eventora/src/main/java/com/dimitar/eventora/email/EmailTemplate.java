package com.dimitar.eventora.email;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmailTemplate {
    ACCOUNT_VERIFICATION("account-verification", "Verify your Eventora account"),
    TICKET_PURCHASE("ticket-purchase", "Your Eventora ticket"),
    PASSWORD_RESET("password-reset", "Reset your Eventora password");

    private final String templateName;
    private final String subject;
}
