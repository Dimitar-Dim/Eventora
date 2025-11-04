package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventDTO;
import com.dimitar.eventora.model.Event;

import java.util.List;

public interface EventService {
    Event createEvent(EventDTO dto);
    Event getEventById(Long id);
    Event updateEvent(Long id, EventDTO dto);
    void deleteEvent(Long id);
    List<Event> getAllEvents();
    List<Event> getActiveEvents();
    Event deactivateEvent(Long id);
    List<Event> getEventsByOrganizer(Long organizerId);
}
