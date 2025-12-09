package com.dimitar.eventora;

import com.dimitar.eventora.config.MailProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties(MailProperties.class)
@EnableScheduling
public class EventoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventoraApplication.class, args);
    }

}
