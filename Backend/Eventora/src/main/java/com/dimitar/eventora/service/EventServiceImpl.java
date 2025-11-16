package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventDTO;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.exception.EventNotFound;
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

    @Override
    @Transactional
    public Event createEvent(EventDTO dto) {
        EventEntity entity = new EventEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setEventDate(dto.getEventDate());
        entity.setGenre(dto.getGenre());
        entity.setTicketPrice(dto.getTicketPrice());
        entity.setMaxTickets(dto.getMaxTickets());
        entity.setAvailableTickets(dto.getMaxTickets());
        entity.setImageUrl(dto.getImageUrl());
        entity.setOrganizerId(dto.getOrganizerId());
        entity.setIsActive(true);

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
    public Event updateEvent(Long id, EventDTO dto) {
        Long eventId = requireEventId(id);
        EventEntity entity = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFound(id));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setEventDate(dto.getEventDate());
        entity.setGenre(dto.getGenre());
        entity.setTicketPrice(dto.getTicketPrice());
        entity.setMaxTickets(dto.getMaxTickets());
        entity.setImageUrl(dto.getImageUrl());

        EventEntity updatedEntity = eventRepository.save(entity);
        return eventMapper.toModel(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Long eventId = requireEventId(id);
        EventEntity entity = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFound(id));
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
    public Event deactivateEvent(Long id) {
        Long eventId = requireEventId(id);
        EventEntity entity = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFound(id));
        entity.setIsActive(false);
        EventEntity updatedEntity = eventRepository.save(entity);
        return eventMapper.toModel(updatedEntity);
    }

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
}
