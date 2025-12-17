package com.dimitar.***REMOVED***vice.Auth;

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

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse getProfile(String userId);

    VerificationResponse verifyAccount(VerifyAccountRequest request);

    VerificationResponse resendVerificationEmail(ResendVerificationRequest request);

    VerificationResponse forgotPassword(ForgotPasswordRequest request);

    VerificationResponse resetPassword(ResetPasswordRequest request);
}
