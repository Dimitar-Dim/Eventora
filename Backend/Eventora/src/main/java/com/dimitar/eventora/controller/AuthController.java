package com.dimitar.eventora.controller;

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
import com.dimitar.***REMOVED***vice.Auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        UserResponse userResponse = authService.getProfile(authentication.getName());
        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<VerificationResponse> verifyAccount(@RequestBody @Valid VerifyAccountRequest request) {
        VerificationResponse response = authService.verifyAccount(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify/resend")
    public ResponseEntity<VerificationResponse> resendVerification(@RequestBody @Valid ResendVerificationRequest request) {
        VerificationResponse response = authService.resendVerificationEmail(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<VerificationResponse> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        VerificationResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<VerificationResponse> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        VerificationResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}
