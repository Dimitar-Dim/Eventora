package com.dimitar.eventora.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String KEY_TIMESTAMP = "timestamp";
    private static final String KEY_STATUS = "status";
    private static final String KEY_ERROR = "error";
    private static final String KEY_MESSAGE = "message";
    private static final String KEY_PATH = "path";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        Map<String, Object> error = buildErrorBody(HttpStatus.BAD_REQUEST, "Validation Failed", "Validation Failed", request);
        error.put("errors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(EventNotFound.class)
    public ResponseEntity<Map<String, Object>> handleEventNotFound(EventNotFound ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExists(UserAlreadyExistsException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(AccountNotVerifiedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountNotVerified(AccountNotVerifiedException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.FORBIDDEN, "Account Not Verified", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(VerificationTokenException.class)
    public ResponseEntity<Map<String, Object>> handleVerificationToken(VerificationTokenException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.BAD_REQUEST, "Verification Error", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<Map<String, Object>> handleForbiddenOperation(ForbiddenOperationException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(TicketPurchaseException.class)
    public ResponseEntity<Map<String, Object>> handleTicketPurchaseException(TicketPurchaseException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.CONFLICT, "Ticket Purchase Failed", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, WebRequest request) {
        Map<String, Object> error = buildErrorBody(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred", request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private Map<String, Object> buildErrorBody(HttpStatus status, String errorTitle, String message, WebRequest request) {
        Map<String, Object> error = new HashMap<>();
        error.put(KEY_TIMESTAMP, LocalDateTime.now());
        error.put(KEY_STATUS, status.value());
        error.put(KEY_ERROR, errorTitle);
        error.put(KEY_MESSAGE, message);
        error.put(KEY_PATH, request.getDescription(false).replace("uri=", ""));
        return error;
    }
}
