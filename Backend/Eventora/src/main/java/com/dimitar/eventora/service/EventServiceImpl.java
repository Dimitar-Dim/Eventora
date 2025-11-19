package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventRequest;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.exception.EventNotFound;
import com.dimitar.eventora.exception.ForbiddenOperationException;
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.mapper.EventDtoMapper;
import com.dimitar.eventora.mapper.EventMapper;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.lang.NonNull;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final EventDtoMapper eventDtoMapper;

    @Override
    @Transactional
    public Event createEvent(EventRequest request) {
        EventEntity entity = eventDtoMapper.toEntity(request);
        @SuppressWarnings("null")
        EventEntity savedEntity = eventRepository.save(entity);
        return eventMapper.toModel(savedEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Event getEventById(Long id) {
        Long eventId = requireEventId(id);
        return eventRepository.findById(eventId)
                .map(eventMapper::toModel)
                .orElseThrow(() -> new EventNotFound(id));
    }

    @Override
    @Transactional
    public Event updateEvent(Long id, EventRequest request, Long requesterId, boolean canManageAll) {
        Long eventId = requireEventId(id);
        Long userId = requireUserId(requesterId);
        EventEntity entity = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFound(id));

        ensureOwnership(entity, userId, canManageAll);

        eventDtoMapper.updateEntity(request, entity);

        @SuppressWarnings("null")
        EventEntity updatedEntity = eventRepository.save(entity);
        return eventMapper.toModel(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id, Long requesterId, boolean canManageAll) {
        Long eventId = requireEventId(id);
        Long userId = requireUserId(requesterId);
        EventEntity entity = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFound(id));
        ensureOwnership(entity, userId, canManageAll);
        entity.setIsActive(false);
        eventRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(eventMapper::toModel)
        .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getActiveEvents() {
        return eventRepository.findAll().stream()
                .filter(EventEntity::getIsActive)
                .map(eventMapper::toModel)
        .toList();
    }

    @Override
    @Transactional
    public Event deactivateEvent(Long id, Long requesterId, boolean canManageAll) {
        Long eventId = requireEventId(id);
        Long userId = requireUserId(requesterId);
        EventEntity entity = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFound(id));
        ensureOwnership(entity, userId, canManageAll);
        entity.setIsActive(false);
        EventEntity updatedEntity = eventRepository.save(entity);
        return eventMapper.toModel(updatedEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId).stream()
                .map(eventMapper::toModel)
                .toList();
    }

    private @NonNull Long requireEventId(Long id) {
        if (id == null) {
            throw new EventNotFound("Event id must not be null");
        }
        return id;
    }

    private @NonNull Long requireUserId(Long requesterId) {
        if (requesterId == null) {
            throw new UnauthorizedException("User must be authenticated to perform this action");
        }
        return requesterId;
    }

    private void ensureOwnership(EventEntity entity, Long requesterId, boolean canManageAll) {
        if (canManageAll) {
            return;
        }

        Long ownerId = entity.getOrganizerId();
        if (ownerId == null || !ownerId.equals(requesterId)) {
            throw new ForbiddenOperationException("You are not allowed to modify this event");
        }
    }
}
