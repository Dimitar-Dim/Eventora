package com.dimitar.eventora.mapper;

import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.model.Event.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toModel(EventEntity entity) {
        if (entity == null) {
            return null;
        }

        return Event.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .eventDate(entity.getEventDate())
                .genre(entity.getGenre())
                .ticketPrice(entity.getTicketPrice())
                .maxTickets(entity.getMaxTickets())
                .availableTickets(entity.getAvailableTickets())
                .imageUrl(entity.getImageUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .isActive(entity.getIsActive())
                .organizerId(entity.getOrganizerId())
                .hasSeating(entity.getHasSeating())
                .seatingLayout(entity.getSeatingLayout())
                .seatedCapacity(entity.getSeatedCapacity())
                .standingCapacity(entity.getStandingCapacity())
                .build();
    }
}
