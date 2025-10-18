package com.dimitar.eventora.exception;

public class EventNotFound extends RuntimeException {
    public EventNotFound(Long id) {
        super("Event with ID " + id + " not found");
    }

    public EventNotFound(String message) {
        super(message);
    }
}
