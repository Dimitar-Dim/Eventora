package com.dimitar.***REMOVED***vice.Event;

import com.dimitar.eventora.dto.Event.EventRequest;
import com.dimitar.eventora.model.Event.Event;

import java.util.List;

public interface EventService {
    Event createEvent(EventRequest request, Long requesterId, boolean canOrganizeEvents);
    Event getEventById(Long id);
    Event updateEvent(Long id, EventRequest request, Long requesterId, boolean canManageAll);
    void deleteEvent(Long id, Long requesterId, boolean canManageAll);
    List<Event> getAllEvents();
    List<Event> getActiveEvents();
    Event deactivateEvent(Long id, Long requesterId, boolean canManageAll);
    List<Event> getEventsByOrganizer(Long organizerId);
}
