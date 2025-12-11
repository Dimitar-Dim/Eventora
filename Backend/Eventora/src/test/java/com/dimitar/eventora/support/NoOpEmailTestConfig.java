package com.dimitar.eventora.support;

import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailVerifier;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class NoOpEmailTestConfig {

    @Bean
    public EmailService emailService() {
        return Mockito.mock(EmailService.class);
    }

    @Bean
    public EmailVerifier emailVerifier() {
        EmailVerifier verifier = Mockito.mock(EmailVerifier.class);
        Mockito.doNothing().when(verifier).verifyDeliverability(Mockito.anyString());
        return verifier;
    }
}
