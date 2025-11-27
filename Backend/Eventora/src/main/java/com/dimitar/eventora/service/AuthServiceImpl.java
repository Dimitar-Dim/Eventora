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
import com.dimitar.eventora.email.EmailRequest;
import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailTemplate;
import com.dimitar.***REMOVED***Entity;
import com.dimitar.eventora.entity.VerificationTokenEntity;
import com.dimitar.eventora.exception.AccountNotVerifiedException;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.***REMOVED***AlreadyExistsException;
import com.dimitar.eventora.exception.VerificationTokenException;
import com.dimitar.***REMOVED***DtoMapper;
import com.dimitar.***REMOVED***Mapper;
import com.dimitar.***REMOVED***;
import com.dimitar.***REMOVED***Role;
import com.dimitar.eventora.model.VerificationTokenType;
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
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final Duration VERIFICATION_TOKEN_TTL = Duration.ofHours(24);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserDtoMapper userDtoMapper;
    private final VerificationService verificationService;
    private final EmailService emailService;
    private final MailProperties mailProperties;

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

    private boolean sendVerificationEmail(UserEntity savedUser) {
        try {
            VerificationTokenEntity token = verificationService.createToken(
                    savedUser.getId(), VerificationTokenType.ACCOUNT_VERIFICATION, VERIFICATION_TOKEN_TTL);

            Map<String, Object> variables = new HashMap<>();
            variables.put("username", savedUser.getUsername());
            variables.put("verificationUrl", buildVerificationUrl(token.getToken()));

            emailService.send(new EmailRequest(savedUser.getEmail(), EmailTemplate.ACCOUNT_VERIFICATION, variables));
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
}
