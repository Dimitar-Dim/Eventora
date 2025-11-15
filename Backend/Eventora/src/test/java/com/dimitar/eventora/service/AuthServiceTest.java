package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.LoginRequest;
import com.dimitar.eventora.dto.LoginResponse;
import com.dimitar.eventora.dto.RegisterRequest;
import com.dimitar.eventora.dto.RegisterResponse;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.***REMOVED***AlreadyExistsException;
import com.dimitar.***REMOVED***Mapper;
import com.dimitar.***REMOVED***;
import com.dimitar.***REMOVED***Role;
import com.dimitar.***REMOVED***Repository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
    private UserEntity testUser;
    private User testUserModel;

    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest(
                "testuser",
                "test@example.com",
                "Password123!",
                "Password123!"
        );

        validLoginRequest = new LoginRequest(
                "test@example.com",
                "Password123!"
        );

        testUser = UserEntity.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("$2b$12$hashedpassword")
                .role(UserRole.USER)
                .build();

        testUserModel = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(UserRole.USER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully register new user with valid data")
    void testRegisterSuccess() {
        when(userRepository.existsByUsername(validRegisterRequest.username())).thenReturn(false);
        when(userRepository.existsByEmail(validRegisterRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(validRegisterRequest.password())).thenReturn("$2b$12$hashedpassword");
        when(userRepository.save(any())).thenReturn(testUser);

        RegisterResponse response = authService.register(validRegisterRequest);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
        assertEquals("USER", response.role());

        verify(userRepository, times(1)).existsByUsername(validRegisterRequest.username());
        verify(userRepository, times(1)).existsByEmail(validRegisterRequest.email());
        verify(passwordEncoder, times(1)).encode(validRegisterRequest.password());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should fail registration when passwords do not match")
    void testRegisterPasswordMismatch() {
        RegisterRequest mismatchRequest = new RegisterRequest(
                "testuser",
                "test@example.com",
                "Password123!",
                "Password456!"
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(mismatchRequest)
        );
        assertEquals("Passwords do not match", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should fail registration when username already exists")
    void testRegisterUsernameTaken() {
        when(userRepository.existsByUsername(validRegisterRequest.username())).thenReturn(true);

        UserAlreadyExistsException exception = assertThrows(
                UserAlreadyExistsException.class,
                () -> authService.register(validRegisterRequest)
        );
        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should fail registration when email already exists")
    void testRegisterEmailTaken() {
        when(userRepository.existsByUsername(validRegisterRequest.username())).thenReturn(false);
        when(userRepository.existsByEmail(validRegisterRequest.email())).thenReturn(true);

        UserAlreadyExistsException exception = assertThrows(
                UserAlreadyExistsException.class,
                () -> authService.register(validRegisterRequest)
        );
        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should encode password using PasswordEncoder")
    void testRegisterEncodesPassword() {
        when(userRepository.existsByUsername(validRegisterRequest.username())).thenReturn(false);
        when(userRepository.existsByEmail(validRegisterRequest.email())).thenReturn(false);
        String encodedPassword = "$2b$12$encoded_hash";
        when(passwordEncoder.encode(validRegisterRequest.password())).thenReturn(encodedPassword);
        when(userRepository.save(any())).thenReturn(testUser);

        authService.register(validRegisterRequest);

        verify(passwordEncoder, times(1)).encode(validRegisterRequest.password());
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLoginSuccess() {
        String jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IlVTRVIifQ.signature";

        when(userRepository.findByEmailIgnoreCase(validLoginRequest.email()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validLoginRequest.password(), testUser.getPasswordHash()))
                .thenReturn(true);
        when(userMapper.toModel(testUser)).thenReturn(testUserModel);
        when(jwtService.createJwt(testUserModel.getId(), testUserModel.getRole().name()))
                .thenReturn(jwtToken);
        when(jwtService.getTtlSeconds()).thenReturn(900L);

        LoginResponse response = authService.login(validLoginRequest);

        assertNotNull(response);
        assertEquals(jwtToken, response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(900L, response.expiresIn());
        assertNotNull(response.user());
        assertEquals("testuser", response.user().username());

        verify(userRepository, times(1)).findByEmailIgnoreCase(validLoginRequest.email());
        verify(passwordEncoder, times(1)).matches(validLoginRequest.password(), testUser.getPasswordHash());
        verify(jwtService, times(1)).createJwt(testUserModel.getId(), testUserModel.getRole().name());
    }

    @Test
    @DisplayName("Should fail login when user not found")
    void testLoginUserNotFound() {
        when(userRepository.findByEmailIgnoreCase(validLoginRequest.email()))
                .thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.login(validLoginRequest));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtService, never()).createJwt(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should fail login with incorrect password")
    void testLoginInvalidPassword() {
        when(userRepository.findByEmailIgnoreCase(validLoginRequest.email()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validLoginRequest.password(), testUser.getPasswordHash()))
                .thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(validLoginRequest));
        verify(jwtService, never()).createJwt(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should find user case-insensitively by email")
    void testLoginEmailCaseInsensitive() {
        String mixedCaseEmail = "TEST@EXAMPLE.COM";
        LoginRequest mixedCa***REMOVED***!");
        String jwtToken = "token";

        when(userRepository.findByEmailIgnoreCase(mixedCaseEmail))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(mixedCaseRequest.password(), testUser.getPasswordHash()))
                .thenReturn(true);
        when(userMapper.toModel(testUser)).thenReturn(testUserModel);
        when(jwtService.createJwt(testUserModel.getId(), testUserModel.getRole().name()))
                .thenReturn(jwtToken);
        when(jwtService.getTtlSeconds()).thenReturn(900L);

        LoginResponse response = authService.login(mixedCaseRequest);

        assertNotNull(response);
        assertNotNull(response.user());
        assertEquals("testuser", response.user().username());
        verify(userRepository, times(1)).findByEmailIgnoreCase(mixedCaseEmail);
    }

    @Test
    @DisplayName("Should generate JWT with correct userId and role")
    void testLoginGeneratesCorrectJwt() {
        String jwtToken = "generated_jwt_token";
        when(userRepository.findByEmailIgnoreCase(validLoginRequest.email()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validLoginRequest.password(), testUser.getPasswordHash()))
                .thenReturn(true);
        when(userMapper.toModel(testUser)).thenReturn(testUserModel);
        when(jwtService.createJwt(1L, "USER")).thenReturn(jwtToken);
        when(jwtService.getTtlSeconds()).thenReturn(900L);

        LoginResponse response = authService.login(validLoginRequest);

        assertNotNull(response);
        assertEquals(jwtToken, response.accessToken());
        verify(jwtService, times(1)).createJwt(1L, "USER");
    }
}
