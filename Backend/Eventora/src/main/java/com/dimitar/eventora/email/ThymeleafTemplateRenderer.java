package com.dimitar.eventora.email;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ThymeleafTemplateRenderer implements TemplateRenderer {

    private final @Qualifier("emailTemplateEngine") SpringTemplateEngine templateEngine;

    @Override
    public RenderedTemplate render(String templateName, Map<String, Object> variables) {
        if (templateName == null || templateName.isBlank()) {
            throw new IllegalArgumentException("Template name must be provided");
        }

        Context context = new Context();
        if (variables != null && !variables.isEmpty()) {
            context.setVariables(variables);
        }

        String htmlBody = templateEngine.process(templateName + ".html", context);
        String textBody = templateEngine.process(templateName + ".txt", context);

        return new RenderedTemplate(htmlBody, textBody);
    }
}
