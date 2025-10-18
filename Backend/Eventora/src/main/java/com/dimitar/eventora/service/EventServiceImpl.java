package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventRequestDTO;
import com.dimitar.eventora.exception.EventNotFound;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Override
    @Transactional
    public Event createEvent(EventRequestDTO dto) {
        validateEventRequestDTO(dto);

        Event event = new Event();
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setGenre(dto.getGenre());
        event.setTicketPrice(dto.getTicketPrice());
        event.setMaxTickets(dto.getMaxTickets());
        event.setAvailableTickets(dto.getMaxTickets());
        event.setImageUrl(dto.getImageUrl());
        event.setOrganizerId(dto.getOrganizerId());
        event.setIsActive(true);

        Event savedEvent = eventRepository.save(event);
        return savedEvent;
    }

    @Override
    @Transactional(readOnly = true)
    public Event getEventById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Event ID cannot be null");
        }

        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFound(id));
    }

    @Override
    @Transactional
    public Event updateEvent(Long id, EventRequestDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("Event ID cannot be null");
        }

        validateEventRequestDTO(dto);

        Event event = getEventById(id);

        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setGenre(dto.getGenre());
        event.setTicketPrice(dto.getTicketPrice());
        event.setMaxTickets(dto.getMaxTickets());
        event.setImageUrl(dto.getImageUrl());

        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Event ID cannot be null");
        }

        Event event = getEventById(id);
        event.setIsActive(false);
        eventRepository.save(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getActiveEvents() {
        return eventRepository.findAll().stream()
                .filter(Event::getIsActive)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Event deactivateEvent(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Event ID cannot be null");
        }

        Event event = getEventById(id);
        event.setIsActive(false);
        return eventRepository.save(event);
    }

    private void validateEventRequestDTO(EventRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Event request DTO cannot be null");
        }

        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Event name cannot be null or empty");
        }

        if (dto.getEventDate() == null) {
            throw new IllegalArgumentException("Event date cannot be null");
        }

        if (dto.getTicketPrice() == null) {
            throw new IllegalArgumentException("Ticket price cannot be null");
        }

        if (dto.getTicketPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Ticket price cannot be negative");
        }

        if (dto.getMaxTickets() == null) {
            throw new IllegalArgumentException("Max tickets cannot be null");
        }

        if (dto.getMaxTickets() <= 0) {
            throw new IllegalArgumentException("Max tickets must be greater than zero");
        }

        if (dto.getOrganizerId() == null) {
            throw new IllegalArgumentException("Organizer ID cannot be null");
        }
    }
}
