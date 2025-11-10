package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventDTO;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.exception.EventNotFound;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

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
        return convertEntityToDomain(savedEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .map(this::convertEntityToDomain)
                .orElseThrow(() -> new EventNotFound(id));
    }

    @Override
    @Transactional
    public Event updateEvent(Long id, EventDTO dto) {
        EventEntity entity = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFound(id));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setEventDate(dto.getEventDate());
        entity.setGenre(dto.getGenre());
        entity.setTicketPrice(dto.getTicketPrice());
        entity.setMaxTickets(dto.getMaxTickets());
        entity.setImageUrl(dto.getImageUrl());

        EventEntity updatedEntity = eventRepository.save(entity);
        return convertEntityToDomain(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        EventEntity entity = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFound(id));
        entity.setIsActive(false);
        eventRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::convertEntityToDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getActiveEvents() {
        return eventRepository.findAll().stream()
                .filter(EventEntity::getIsActive)
                .map(this::convertEntityToDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Event deactivateEvent(Long id) {
        EventEntity entity = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFound(id));
        entity.setIsActive(false);
        EventEntity updatedEntity = eventRepository.save(entity);
        return convertEntityToDomain(updatedEntity);
    }

    @Transactional(readOnly = true)
    public List<Event> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId).stream()
                .map(this::convertEntityToDomain)
                .collect(Collectors.toList());
    }

    private Event convertEntityToDomain(EventEntity entity) {
        Event event = new Event();
        event.setId(entity.getId());
        event.setName(entity.getName());
        event.setDescription(entity.getDescription());
        event.setEventDate(entity.getEventDate());
        event.setGenre(entity.getGenre());
        event.setTicketPrice(entity.getTicketPrice());
        event.setMaxTickets(entity.getMaxTickets());
        event.setAvailableTickets(entity.getAvailableTickets());
        event.setImageUrl(entity.getImageUrl());
        event.setCreatedAt(entity.getCreatedAt());
        event.setUpdatedAt(entity.getUpdatedAt());
        event.setIsActive(entity.getIsActive());
        event.setOrganizerId(entity.getOrganizerId());
        return event;
    }
}
