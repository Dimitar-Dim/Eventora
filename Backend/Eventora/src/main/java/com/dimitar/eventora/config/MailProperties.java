package com.dimitar.eventora.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {

    // Default address used for the From header.
    private String from;

    // Base URL used when constructing verification links.
    private String verificationBaseUrl;

    // Base URL used when constructing password reset links.
    private String passwordResetBaseUrl;

    private final Template template = new Template();

    @Getter
    @Setter
    public static class Template {
        // Directory on the classpath that contains email templates.
        private String basePath = "mail/templates";
    }
}
