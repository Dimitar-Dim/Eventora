package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventRequestDTO;
import com.dimitar.eventora.model.Event;

import java.util.List;

public interface EventService {

    Event createEvent(EventRequestDTO dto);

    Event getEventById(Long id);

    Event updateEvent(Long id, EventRequestDTO dto);

    void deleteEvent(Long id);

    List<Event> getAllEvents();

    List<Event> getActiveEvents();

    Event deactivateEvent(Long id);
}
