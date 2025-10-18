package com.dimitar.eventora.controller;

import com.dimitar.eventora.dto.EventRequestDTO;
import com.dimitar.eventora.model.Event;
import com.dimitar.***REMOVED***vice.EventService;
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
    public ResponseEntity<Event> createEvent(@RequestBody EventRequestDTO dto) {
        Event event = eventService.createEvent(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Event>> getActiveEvents() {
        List<Event> events = eventService.getActiveEvents();
        return ResponseEntity.ok(events);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody EventRequestDTO dto) {
        Event event = eventService.updateEvent(id, dto);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Event> deactivateEvent(@PathVariable Long id) {
        Event event = eventService.deactivateEvent(id);
        return ResponseEntity.ok(event);
    }
}
