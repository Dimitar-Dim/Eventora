package com.dimitar.eventora.email;

import com.dimitar.eventora.config.MailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateRenderer templateRenderer;
    private final MailProperties mailProperties;

    @Override
    public void send(EmailRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Email request must not be null");
        }
        if (request.to() == null || request.to().isBlank()) {
            throw new IllegalArgumentException("Recipient address is required");
        }

        TemplateRenderer.RenderedTemplate renderedTemplate = templateRenderer.render(
            request.template().getTemplateName(),
            request.variables()
        );

        String from = mailProperties.getFrom();
        if (from == null || from.isBlank()) {
            throw new IllegalStateException("Mail sender address is not configured");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
                helper.setFrom(from);
                helper.setTo(Objects.requireNonNull(request.to(), "Recipient address"));
                helper.setSubject(Objects.requireNonNull(request.template().getSubject(), "Email subject"));
                helper.setText(
                    Objects.requireNonNull(renderedTemplate.textBody(), "Text body"),
                    Objects.requireNonNull(renderedTemplate.htmlBody(), "HTML body")
                );

            if (!request.attachments().isEmpty()) {
                for (EmailAttachment attachment : request.attachments()) {
                    ByteArrayResource resource = new ByteArrayResource(Objects.requireNonNull(attachment.content(), "Attachment content")) {
                        @Override
                        public String getFilename() {
                            return attachment.fileName();
                        }
                    };
                    helper.addAttachment(
                            Objects.requireNonNull(attachment.fileName(), "Attachment filename"),
                            resource,
                            Objects.requireNonNull(attachment.contentType(), "Attachment content type")
                    );
                }
            }

            mailSender.send(message);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send email '{}' to {}", request.template(), request.to(), ex);
            throw new IllegalStateException("Unable to send email at this time", ex);
        }
    }
}
