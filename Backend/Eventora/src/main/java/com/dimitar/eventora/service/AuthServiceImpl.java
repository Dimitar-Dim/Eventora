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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

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

        UserEntity savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name()
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

        User user = userMapper.toModel(userEntity);

        String jwt = jwtService.createJwt(user.getId(), user.getRole().name());
        long expiresIn = jwtService.getTtlSeconds();

        return new LoginResponse(jwt, expiresIn, "Bearer");
    }
}
