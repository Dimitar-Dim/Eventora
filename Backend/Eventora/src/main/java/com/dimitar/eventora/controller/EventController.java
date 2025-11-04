package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.EventDTO;
import com.dimitar.eventora.model.Event;
import com.dimitar.***REMOVED***vice.EventService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody EventDTO dto) {
        Event event = eventService.createEvent(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id, 
                                             @Valid @RequestBody EventDTO dto) {
        Event event = eventService.updateEvent(id, dto);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Event> deactivateEvent(@PathVariable @Positive(message = "Event ID must be positive") Long id) {
        Event event = eventService.deactivateEvent(id);
        return ResponseEntity.ok(event);
    }
}
