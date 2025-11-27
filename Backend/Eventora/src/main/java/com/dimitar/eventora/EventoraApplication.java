package com.dimitar.eventora;

import com.dimitar.eventora.config.MailProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(MailProperties.class)
public class EventoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventoraApplication.class, args);
    }

}
