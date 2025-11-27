package com.dimitar.eventora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.nio.charset.StandardCharsets;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class EmailTemplateConfig {

    private final MailProperties mailProperties;

    @Bean("emailTemplateEngine")
    public SpringTemplateEngine emailTemplateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.addTemplateResolver(templateResolver(TemplateMode.HTML, "*.html"));
        engine.addTemplateResolver(templateResolver(TemplateMode.TEXT, "*.txt"));
        return engine;
    }

    private ClassLoaderTemplateResolver templateResolver(TemplateMode mode, String pattern) {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        String prefix = mailProperties.getTemplate().getBasePath();
        if (prefix == null || prefix.isBlank()) {
            prefix = "mail/templates";
        }
        if (!prefix.endsWith("/")) {
            prefix = prefix + "/";
        }
        resolver.setPrefix(prefix);
        resolver.setSuffix("");
        resolver.setTemplateMode(mode);
        resolver.setCharacterEncoding(StandardCharsets.UTF_8.name());
        resolver.setCheckExistence(true);
        resolver.setCacheable(true);
        resolver.setResolvablePatterns(Set.of(pattern));
        return resolver;
    }
}
