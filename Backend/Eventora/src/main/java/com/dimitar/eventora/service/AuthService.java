package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.LoginRequest;
import com.dimitar.eventora.dto.LoginResponse;
import com.dimitar.eventora.dto.RegisterRequest;
import com.dimitar.eventora.dto.RegisterResponse;
import com.dimitar.***REMOVED***Response;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse getProfile(String userId);
}
