package com.dimitar.eventora.email;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmailTemplate {
    ACCOUNT_VERIFICATION("account-verification", "Verify your Eventora account");

    private final String templateName;
    private final String subject;
}
