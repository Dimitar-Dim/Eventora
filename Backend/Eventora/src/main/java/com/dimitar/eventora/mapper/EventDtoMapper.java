package com.dimitar.eventora.mapper;

import com.dimitar.eventora.dto.EventRequest;
import com.dimitar.eventora.dto.EventResponse;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.SeatingLayout;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class EventDtoMapper {

    public EventEntity toEntity(EventRequest request) {
        EventRequest safeRequest = Objects.requireNonNull(request, "Event request must not be null");
        EventEntity entity = new EventEntity();
        applyMutableFields(entity, safeRequest);
        entity.setAvailableTickets(safeRequest.maxTickets());
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
            event.getStandingCapacity(),
            event.getSeatedCapacity(),
            event.getHasSeating(),
            event.getSeatingLayout(),
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
        Integer maxTickets = request.maxTickets();
        boolean hasSeating = Boolean.TRUE.equals(request.hasSeating());

        SeatingLayout layout = normalizeLayout(hasSeating, request.seatingLayout());
        int seatedCapacity = computeSeatedCapacity(layout);
        int standingCapacity = normalizeStandingCapacity(request.standingCapacity());

        int totalCapacity = seatedCapacity + standingCapacity;
        if (maxTickets != null && totalCapacity > 0 && maxTickets > totalCapacity) {
            throw new IllegalArgumentException("Max tickets cannot exceed combined seating and standing capacity");
        }

        target.setHasSeating(hasSeating);
        target.setSeatingLayout(layout);
        target.setSeatedCapacity(seatedCapacity);
        target.setStandingCapacity(standingCapacity);
        target.setMaxTickets(maxTickets);
        target.setImageUrl(request.imageUrl());
    }

    private SeatingLayout normalizeLayout(boolean hasSeating, SeatingLayout requested) {
        if (!hasSeating) {
            return SeatingLayout.NONE;
        }
        if (requested == null || requested == SeatingLayout.NONE) {
            return SeatingLayout.FLOOR; // default to floor seating when seating is enabled
        }
        return requested;
    }

    private int computeSeatedCapacity(SeatingLayout layout) {
        return switch (layout) {
            case NONE -> 0;
            case FLOOR -> 300;
            case FLOOR_BALCONY -> 600;
        };
    }

    private int normalizeStandingCapacity(Integer requested) {
        int value = requested == null ? 600 : requested;
        if (value < 0) {
            return 0;
        }
        return Math.min(value, 600);
    }
}
