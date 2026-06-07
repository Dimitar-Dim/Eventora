package com.dimitar.eventora;

import com.dimitar.eventora.support.PostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class EventoraApplicationTests extends PostgresIntegrationTest {

    @Test
    void contextLoads() {
    }

}
