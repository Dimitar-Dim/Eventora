package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventRequest;
import com.dimitar.eventora.model.Event;

import java.util.List;

public interface EventService {
    Event createEvent(EventRequest request);
    Event getEventById(Long id);
    Event updateEvent(Long id, EventRequest request);
    void deleteEvent(Long id);
    List<Event> getAllEvents();
    List<Event> getActiveEvents();
    Event deactivateEvent(Long id);
    List<Event> getEventsByOrganizer(Long organizerId);
}
