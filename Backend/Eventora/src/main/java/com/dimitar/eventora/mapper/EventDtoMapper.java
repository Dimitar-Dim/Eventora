package com.dimitar.eventora.mapper;

import com.dimitar.eventora.dto.EventRequest;
import com.dimitar.eventora.dto.EventResponse;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.model.Event;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class EventDtoMapper {

    public EventEntity toEntity(EventRequest request) {
        EventRequest safeRequest = Objects.requireNonNull(request, "Event request must not be null");
        EventEntity entity = new EventEntity();
        applyMutableFields(entity, safeRequest);
        entity.setAvailableTickets(safeRequest.maxTickets());
        entity.setOrganizerId(safeRequest.organizerId());
        entity.setIsActive(true);
        return entity;
    }

    public void updateEntity(EventRequest request, EventEntity target) {
        EventEntity safeTarget = Objects.requireNonNull(target, "Event entity must not be null");
        EventRequest safeRequest = Objects.requireNonNull(request, "Event request must not be null");
        applyMutableFields(safeTarget, safeRequest);
    }

    public EventResponse toResponse(Event event) {
        if (event == null) {
            return null;
        }

        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getEventDate(),
                event.getGenre(),
                event.getTicketPrice(),
                event.getMaxTickets(),
                event.getAvailableTickets(),
                event.getImageUrl(),
                event.getIsActive(),
                event.getOrganizerId(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    private void applyMutableFields(EventEntity target, EventRequest request) {
        target.setName(request.name());
        target.setDescription(request.description());
        target.setEventDate(request.eventDate());
        target.setGenre(request.genre());
        target.setTicketPrice(request.ticketPrice());
        target.setMaxTickets(request.maxTickets());
        target.setImageUrl(request.imageUrl());
    }
}
