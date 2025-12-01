package com.dimitar.eventora.email;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public record EmailRequest(
                String to,
                EmailTemplate template,
                Map<String, Object> variables,
                List<EmailAttachment> attachments
) {
        public EmailRequest {
                if (to == null || to.isBlank()) {
                        throw new IllegalArgumentException("Recipient address is required");
                }
                if (template == null) {
                        throw new IllegalArgumentException("Email template is required");
                }

                variables = variables == null
                                ? Collections.emptyMap()
                                : Collections.unmodifiableMap(new HashMap<>(variables));

                attachments = attachments == null
                                ? Collections.emptyList()
                                : List.copyOf(attachments);
        }
}
