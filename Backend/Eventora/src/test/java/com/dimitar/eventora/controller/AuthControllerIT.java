package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.LoginRequest;
import com.dimitar.eventora.dto.RegisterRequest;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.***REMOVED***Role;
import com.dimitar.***REMOVED***Repository;
import com.dimitar.***REMOVED***vice.JwtService;
import com.dimitar.eventora.support.PostgresIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIT extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void register_shouldPersistUserAndReturnCreatedResponse() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "jane",
                "jane@example.com",
                "***REMOVED***",
                "***REMOVED***"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsBytes(request))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.username").value("jane"))
                .andExpect(jsonPath("$.email").value("jane@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));

        assertThat(userRepository.findByEmailIgnoreCase("jane@example.com")).isPresent();
    }

    @Test
    void login_shouldReturnAccessTokenForValidCredentials() throws Exception {
        UserEntity user = persistUser("alice", "alice@example.com", "***REMOVED***", UserRole.USER);

        LoginRequest request = new LoginRequest(user.getEmail(), "***REMOVED***");

        mockMvc.perform(post("/api/auth/login")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsBytes(request))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(user.getEmail()));
    }

    @Test
    void profile_shouldReturnCurrentUserInfoWhenTokenIsValid() throws Exception {
        UserEntity user = persistUser("bob", "bob@example.com", "***REMOVED***", UserRole.USER);
        String bearer = bearerToken(user.getId(), user.getRole());

        mockMvc.perform(get("/api/auth/profile")
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(String.valueOf(user.getId())))
                .andExpect(jsonPath("$.username").value("bob"))
                .andExpect(jsonPath("$.email").value("bob@example.com"));
    }

    @Test
    void profile_withoutTokenShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());
    }

    private UserEntity persistUser(String username, String email, String rawPassword, UserRole role) {
        UserEntity entity = UserEntity.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        return Objects.requireNonNull(userRepository.save(entity));
    }

    private String bearerToken(Long userId, UserRole role) {
        return "Bearer " + jwtService.createJwt(userId, role.name());
    }
}
