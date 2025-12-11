package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.LoginRequest;
import com.dimitar.eventora.dto.LoginResponse;
import com.dimitar.eventora.dto.RegisterRequest;
import com.dimitar.eventora.dto.RegisterResponse;
import com.dimitar.eventora.dto.ResendVerificationRequest;
import com.dimitar.eventora.dto.ResetPasswordRequest;
import com.dimitar.***REMOVED***Response;
import com.dimitar.eventora.dto.VerificationResponse;
import com.dimitar.eventora.dto.VerifyAccountRequest;
import com.dimitar.eventora.dto.ForgotPasswordRequest;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse getProfile(String userId);

    VerificationResponse verifyAccount(VerifyAccountRequest request);

    VerificationResponse resendVerificationEmail(ResendVerificationRequest request);

    VerificationResponse forgotPassword(ForgotPasswordRequest request);

    VerificationResponse resetPassword(ResetPasswordRequest request);
}
