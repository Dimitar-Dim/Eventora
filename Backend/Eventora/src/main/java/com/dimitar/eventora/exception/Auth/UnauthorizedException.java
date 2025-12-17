package com.dimitar.eventora.exception.Auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException() {
        super("Invalid email or password");
    }

    public UnauthorizedException(String message) {
        super(message);
    }
}
