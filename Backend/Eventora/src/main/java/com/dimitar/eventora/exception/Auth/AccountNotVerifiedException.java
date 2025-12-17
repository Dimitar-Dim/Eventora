package com.dimitar.eventora.exception.Auth;

public class AccountNotVerifiedException extends RuntimeException {
    public AccountNotVerifiedException() {
        super("Please verify your account before logging in");
    }
}
