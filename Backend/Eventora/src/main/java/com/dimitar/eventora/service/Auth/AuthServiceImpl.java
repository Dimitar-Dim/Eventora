package com.dimitar.***REMOVED***vice.Auth;

import com.dimitar.eventora.config.MailProperties;
import com.dimitar.eventora.dto.Auth.LoginRequest;
import com.dimitar.eventora.dto.Auth.LoginResponse;
import com.dimitar.eventora.dto.Auth.RegisterRequest;
import com.dimitar.eventora.dto.Auth.RegisterResponse;
import com.dimitar.eventora.dto.Auth.ResendVerificationRequest;
import com.dimitar.eventora.dto.Auth.ResetPasswordRequest;
import com.dimitar.***REMOVED***Response;
import com.dimitar.eventora.dto.Auth.VerificationResponse;
import com.dimitar.eventora.dto.Auth.VerifyAccountRequest;
import com.dimitar.eventora.dto.Auth.ForgotPasswordRequest;
import com.dimitar.eventora.email.EmailRequest;
import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailTemplate;
import com.dimitar.eventora.email.EmailVerifier;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.entity.VerificationTokenEntity;
import com.dimitar.eventora.exception.Auth.AccountNotVerifiedException;
import com.dimitar.eventora.exception.Auth.UnauthorizedException;
import com.dimitar.***REMOVED***AlreadyExistsException;
import com.dimitar.eventora.exception.Auth.VerificationTokenException;
import com.dimitar.***REMOVED***DtoMapper;
import com.dimitar.***REMOVED***Mapper;
import com.dimitar.***REMOVED***;
import com.dimitar.***REMOVED***Role;
import com.dimitar.eventora.model.Auth.VerificationTokenType;
import com.dimitar.***REMOVED***Repository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final Duration VERIFICATION_TOKEN_TTL = Duration.ofHours(24);
    private static final Duration PASSWORD_RESET_TOKEN_TTL = Duration.ofHours(1);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserDtoMapper userDtoMapper;
    private final VerificationService verificationService;
    private final EmailService emailService;
    private final MailProperties mailProperties;
    private final EmailVerifier emailVerifier;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (!request.password().equals(request.passwordConfirm())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        emailVerifier.verifyDeliverability(request.email());

        UserEntity user = UserEntity.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .build();

        @SuppressWarnings("null")
        UserEntity savedUser = userRepository.save(user);

        boolean emailSent = sendVerificationEmail(savedUser);

        return new RegisterResponse(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole().name(),
            emailSent
        );
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        UserEntity userEntity = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(UnauthorizedException::new);

        if (!passwordEncoder.matches(request.password(), userEntity.getPasswordHash())) {
            throw new UnauthorizedException();
        }

        if (!userEntity.isVerified()) {
            throw new AccountNotVerifiedException();
        }

        User user = userMapper.toModel(userEntity);

        String jwt = jwtService.createJwt(user.getId(), user.getRole().name());
        long expiresIn = jwtService.getTtlSeconds();

        UserResponse userResponse = userDtoMapper.toResponse(user);

        return new LoginResponse(jwt, expiresIn, "Bearer", userResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String userId) {
        UserEntity userEntity = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(UnauthorizedException::new);

        User user = userMapper.toModel(userEntity);
        return userDtoMapper.toResponse(user);
    }

    @Override
    @Transactional
    public VerificationResponse verifyAccount(VerifyAccountRequest request) {
        VerificationTokenEntity token = verificationService.consumeToken(
                        request.token(), VerificationTokenType.ACCOUNT_VERIFICATION)
                .orElseThrow(() -> new VerificationTokenException("Invalid or expired verification token"));

        UserEntity user = token.getUser();
        if (user.isVerified()) {
            return new VerificationResponse(true, "Account already verified");
        }

        user.setVerified(true);
        user.setVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        return new VerificationResponse(true, "Account verified successfully");
    }

    @Override
    @Transactional
    public VerificationResponse resendVerificationEmail(ResendVerificationRequest request) {
        emailVerifier.verifyDeliverability(request.email());

        UserEntity user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException("No account found for email"));

        if (user.isVerified()) {
            return new VerificationResponse(false, "Account already verified");
        }

        boolean sent = sendVerificationEmail(user);
        String message = sent
                ? "Verification email has been resent"
                : "Unable to send verification email at this time";

        return new VerificationResponse(sent, message);
    }

    @Override
    @Transactional
    public VerificationResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.email().trim();
        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresentOrElse(user -> {
            try {
                VerificationTokenEntity token = verificationService.createToken(
                        user.getId(), VerificationTokenType.PASSWORD_RESET, PASSWORD_RESET_TOKEN_TTL);

                Map<String, Object> variables = new HashMap<>();
                variables.put("username", user.getUsername());
                variables.put("resetUrl", buildPasswordResetUrl(token.getToken()));

                emailService.send(new EmailRequest(user.getEmail(), EmailTemplate.PASSWORD_RESET, variables, List.of()));
            } catch (Exception ex) {
                log.error("Failed to send password reset email to {}", normalizedEmail, ex);
            }
        }, () -> log.info("Password reset requested for non-existent email {}", normalizedEmail));

        return new VerificationResponse(true, "If that email exists in our system, a reset link has been sent.");
    }

    @Override
    @Transactional
    public VerificationResponse resetPassword(ResetPasswordRequest request) {
        VerificationTokenEntity token = verificationService.consumeToken(
                        request.token(), VerificationTokenType.PASSWORD_RESET)
                .orElseThrow(() -> new VerificationTokenException("Invalid or expired password reset token"));

        UserEntity user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new VerificationResponse(true, "Password has been reset successfully");
    }

    private boolean sendVerificationEmail(UserEntity savedUser) {
        try {
            VerificationTokenEntity token = verificationService.createToken(
                    savedUser.getId(), VerificationTokenType.ACCOUNT_VERIFICATION, VERIFICATION_TOKEN_TTL);

            Map<String, Object> variables = new HashMap<>();
            variables.put("username", savedUser.getUsername());
            variables.put("verificationUrl", buildVerificationUrl(token.getToken()));

            emailService.send(new EmailRequest(savedUser.getEmail(), EmailTemplate.ACCOUNT_VERIFICATION, variables, List.of()));
            return true;
        } catch (Exception ex) {
            log.error("Failed to send verification email to {}", savedUser.getEmail(), ex);
            return false;
        }
    }

    private String buildVerificationUrl(String tokenValue) {
        String baseUrl = mailProperties.getVerificationBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("Verification base URL is not configured");
        }

        String separator;
        if (baseUrl.contains("?")) {
            separator = (baseUrl.endsWith("?") || baseUrl.endsWith("&")) ? "" : "&";
        } else {
            separator = baseUrl.endsWith("?") ? "" : "?";
        }
        String encodedToken = URLEncoder.encode(tokenValue, StandardCharsets.UTF_8);
        return baseUrl + separator + "token=" + encodedToken;
    }

    private String buildPasswordResetUrl(String tokenValue) {
        String baseUrl = mailProperties.getPasswordResetBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("Password reset base URL is not configured");
        }

        String separator;
        if (baseUrl.contains("?")) {
            separator = (baseUrl.endsWith("?") || baseUrl.endsWith("&")) ? "" : "&";
        } else {
            separator = baseUrl.endsWith("?") ? "" : "?";
        }
        String encodedToken = URLEncoder.encode(tokenValue, StandardCharsets.UTF_8);
        return baseUrl + separator + "token=" + encodedToken;
    }
}
