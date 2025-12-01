package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.config.MailProperties;
import com.dimitar.eventora.dto.LoginRequest;
import com.dimitar.eventora.dto.LoginResponse;
import com.dimitar.eventora.dto.RegisterRequest;
import com.dimitar.eventora.dto.RegisterResponse;
import com.dimitar.eventora.dto.ResendVerificationRequest;
import com.dimitar.***REMOVED***Response;
import com.dimitar.eventora.dto.VerificationResponse;
import com.dimitar.eventora.dto.VerifyAccountRequest;
import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailVerifier;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.entity.VerificationTokenEntity;
import com.dimitar.eventora.exception.AccountNotVerifiedException;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.***REMOVED***AlreadyExistsException;
import com.dimitar.***REMOVED***DtoMapper;
import com.dimitar.***REMOVED***Mapper;
import com.dimitar.***REMOVED***;
import com.dimitar.***REMOVED***Role;
import com.dimitar.eventora.model.VerificationTokenType;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
@SuppressWarnings({"null", "NullAway"})
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

        @Mock
        private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

        @Mock
        private UserDtoMapper userDtoMapper;

        @Mock
        private VerificationService verificationService;

        @Mock
        private EmailService emailService;

        @Mock
        private EmailVerifier emailVerifier;

        @Mock
        private MailProperties mailProperties;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
        private UserEntity testUser;
        private User testUserModel;
        private UserResponse testUserResponse;
        private VerificationTokenEntity verificationToken;

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
                .verified(true)
                .verifiedAt(LocalDateTime.now())
                .build();

        testUserModel = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(UserRole.USER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .verified(true)
                .verifiedAt(LocalDateTime.now())
                .build();

        testUserResponse = new UserResponse(
                testUserModel.getId().toString(),
                testUserModel.getUsername(),
                testUserModel.getEmail(),
                testUserModel.getRole().name().toLowerCase(),
                testUserModel.isVerified(),
                testUserModel.getCreatedAt().toString(),
                testUserModel.getUpdatedAt().toString(),
                testUserModel.getVerifiedAt().toString()
        );

        verificationToken = VerificationTokenEntity.builder()
                .token("verification-token")
                .user(testUser)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        lenient().when(mailProperties.getVerificationBaseUrl()).thenReturn("http://localhost:3000/verify");
        lenient().when(verificationService.createToken(anyLong(), any(), any())).thenReturn(verificationToken);
        lenient().doNothing().when(emailService).send(any());
                lenient().doNothing().when(emailVerifier).verifyDeliverability(anyString());

    }

    @Test
    @DisplayName("Should successfully register new user with valid data")
    void testRegisterSuccess() {
        when(userRepository.existsByUsername(validRegisterRequest.username())).thenReturn(false);
        when(userRepository.existsByEmail(validRegisterRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(validRegisterRequest.password())).thenReturn("$2b$12$hashedpassword");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        RegisterResponse response = authService.register(validRegisterRequest);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("testuser", response.username());
        assertEquals("test@example.com", response.email());
        assertEquals("USER", response.role());
        assertTrue(response.verificationEmailSent());

        verify(userRepository, times(1)).existsByUsername(validRegisterRequest.username());
        verify(userRepository, times(1)).existsByEmail(validRegisterRequest.email());
        verify(passwordEncoder, times(1)).encode(validRegisterRequest.password());
        verify(userRepository, times(1)).save(any(UserEntity.class));
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
        verify(userRepository, n***REMOVED***Entity.class));
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
        verify(userRepository, n***REMOVED***Entity.class));
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
        verify(userRepository, n***REMOVED***Entity.class));
    }

    @Test
    @DisplayName("Should encode password using PasswordEncoder")
    void testRegisterEncodesPassword() {
        when(userRepository.existsByUsername(validRegisterRequest.username())).thenReturn(false);
        when(userRepository.existsByEmail(validRegisterRequest.email())).thenReturn(false);
        String encodedPassword = "$2b$12$encoded_hash";
        when(passwordEncoder.encode(validRegisterRequest.password())).thenReturn(encodedPassword);
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

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
        when(userDtoMapper.toResponse(testUserModel)).thenReturn(testUserResponse);
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
        @DisplayName("Should fail login when account unverified")
        void testLoginFailsForUnverifiedAccount() {
                testUser.setVerified(false);
                when(userRepository.findByEmailIgnoreCase(validLoginRequest.email()))
                                .thenReturn(Optional.of(testUser));
                when(passwordEncoder.matches(validLoginRequest.password(), testUser.getPasswordHash()))
                                .thenReturn(true);

                assertThrows(AccountNotVerifiedException.class, () -> authService.login(validLoginRequest));
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
        when(userDtoMapper.toResponse(testUserModel)).thenReturn(testUserResponse);
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
        when(userDtoMapper.toResponse(testUserModel)).thenReturn(testUserResponse);
        when(jwtService.createJwt(1L, "USER")).thenReturn(jwtToken);
        when(jwtService.getTtlSeconds()).thenReturn(900L);

        LoginResponse response = authService.login(validLoginRequest);

        assertNotNull(response);
        assertEquals(jwtToken, response.accessToken());
        verify(jwtService, times(1)).createJwt(1L, "USER");
    }

    @Test
    @DisplayName("Should verify account with valid token")
    void testVerifyAccountSuccess() {
        UserEntity unverified = UserEntity.builder()
                .id(2L)
                .username("newUser")
                .email("new@example.com")
                .passwordHash("hash")
                .role(UserRole.USER)
                .verified(false)
                .build();

        VerificationTokenEntity token = VerificationTokenEntity.builder()
                .token("token-value")
                .user(unverified)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        when(verificationService.consumeToken("token-value", VerificationTokenType.ACCOUNT_VERIFICATION))
                .thenReturn(Optional.of(token));
        when(userRepository.save(unverified)).thenReturn(unverified);

        VerificationResponse response = authService.verifyAccount(new VerifyAccountRequest("token-value"));

        assertTrue(response.success());
        assertEquals("Account verified successfully", response.message());
        assertTrue(unverified.isVerified());
        verify(userRepository).save(unverified);
    }

    @Test
    @DisplayName("Should resend verification email for pending account")
    void testResendVerificationEmail() {
        UserEntity pending = UserEntity.builder()
                .id(3L)
                .username("pending")
                .email("pending@example.com")
                .passwordHash("hash")
                .role(UserRole.USER)
                .verified(false)
                .build();

        VerificationTokenEntity pendingToken = VerificationTokenEntity.builder()
                .token("pending-token")
                .user(pending)
                .expiresAt(LocalDateTime.now().plusHours(2))
                .build();

        when(userRepository.findByEmailIgnoreCase(pending.getEmail())).thenReturn(Optional.of(pending));
        when(verificationService.createToken(eq(pending.getId()), eq(VerificationTokenType.ACCOUNT_VERIFICATION), any()))
                .thenReturn(pendingToken);

        VerificationResponse response = authService.resendVerificationEmail(new ResendVerificationRequest(pending.getEmail()));

        assertTrue(response.success());
        verify(emailService).send(any());
                verify(emailVerifier).verifyDeliverability(pending.getEmail());
    }

    @Test
    @DisplayName("Should not resend verification email for verified account")
    void testResendSkippedForVerifiedAccount() {
        when(userRepository.findByEmailIgnoreCase(testUser.getEmail())).thenReturn(Optional.of(testUser));

        VerificationResponse response = authService.resendVerificationEmail(new ResendVerificationRequest(testUser.getEmail()));

        assertFalse(response.success());
        assertEquals("Account already verified", response.message());
        verify(emailService, never()).send(any());
    }

        @Test
        @DisplayName("Should fail resend when email verifier rejects address")
        void testResendVerificationEmailFailsForInvalidAddress() {
                String badEmail = "invalid@example.com";
                doThrow(new IllegalArgumentException("Invalid email address"))
                                .when(emailVerifier).verifyDeliverability(badEmail);
                ResendVerificationRequest request = new ResendVerificationRequest(badEmail);

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                        () -> authService.resendVerificationEmail(request)
                );

                assertEquals("Invalid email address", exception.getMessage());
                verify(userRepository, never()).findByEmailIgnoreCase(anyString());
                verify(emailService, never()).send(any());
        }
}
