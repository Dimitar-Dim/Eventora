package com.dimitar.eventora.email;

import java.util.Map;

public record EmailRequest(
        String to,
        EmailTemplate template,
        Map<String, Object> variables
) {
}
