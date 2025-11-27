package com.dimitar.eventora.email;

import java.util.Map;

// Renders a template into ready-to-send content.

public interface TemplateRenderer {

    RenderedTemplate render(String templateName, Map<String, Object> variables);

    record RenderedTemplate(String htmlBody, String textBody) {
    }
}
