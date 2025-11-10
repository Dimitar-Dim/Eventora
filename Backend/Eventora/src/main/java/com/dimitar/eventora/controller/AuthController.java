package com.dimitar.eventora.controller;

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
import com.dimitar.***REMOVED***vice.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest request) {
        // Validate password confirmation
        if (!request.password().equals(request.passwordConfirm())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        // Create new user
        UserEntity user = UserEntity.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .build();

        UserEntity savedUser = userRepository.save(user);

        RegisterResponse response = new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        UserEntity userEntity = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(UnauthorizedException::new);

        if (!passwordEncoder.matches(request.password(), userEntity.getPasswordHash())) {
            throw new UnauthorizedException();
        }

        User user = userMapper.toModel(userEntity);

        String jwt = jwtService.createJwt(user.getId(), user.getRole().name());
        long expiresIn = jwtService.getTtlSeconds();

        return ResponseEntity.ok(new LoginResponse(jwt, expiresIn, "Bearer"));
    }
}
