package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.entity.TicketEntity;
import com.dimitar.eventora.exception.EventNotFound;
import com.dimitar.eventora.exception.TicketPurchaseException;
import com.dimitar.eventora.mapper.EventMapper;
import com.dimitar.eventora.mapper.TicketMapper;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.Ticket;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.eventora.model.TicketStatus;
import com.dimitar.eventora.repository.EventRepository;
import com.dimitar.eventora.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private static final String EVENT_NOT_ACTIVE_MESSAGE = "This event is not accepting ticket purchases right now";
    private static final String EVENT_SOLD_OUT_MESSAGE = "Sorry, this event is sold out";
    private static final String DEFAULT_ISSUED_TO = "Ticket Holder";
    private static final String TICKET_ENTITY_NULL_MESSAGE = "Ticket entity must not be null";
    private static final String EVENT_ENTITY_NULL_MESSAGE = "Event entity must not be null";

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final EventMapper eventMapper;
    private final TicketMapper ticketMapper;

    @Override
    @Transactional
    public TicketPurchaseSummary purchaseTicket(Long ***REMOVED***Id, String issuedTo) {
        Long resolvedEventId = Objects.requireNonNull(eventId, "Event id must not be null");
        Long resolvedUserId = Objects.requireNonNull(userId, "User id must not be null");

        EventEntity event = eventRepository.findById(resolvedEventId)
                .orElseThrow(() -> new EventNotFound(resolvedEventId));

        validateEventState(event);
        decrementAvailability(event);

        TicketEntity ticketEntity = TicketEntity.builder()
                .eventId(resolvedEventId)
                .userId(resolvedUserId)
                .issuedTo(resolveIssuedTo(issuedTo))
                .qrCode(UUID.randomUUID().toString())
                .status(TicketStatus.ACTIVE)
                .build();

        TicketEntity savedTicket = ticketRepository.save(Objects.requireNonNull(ticketEntity, TICKET_ENTITY_NULL_MESSAGE));
        EventEntity updatedEvent = eventRepository.save(Objects.requireNonNull(event, EVENT_ENTITY_NULL_MESSAGE));

        Ticket ticket = ticketMapper.toModel(savedTicket);
        Event updatedEventModel = eventMapper.toModel(updatedEvent);

        return new TicketPurchaseSummary(ticket, updatedEventModel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketPurchaseSummary> getTicketsForUser(Long userId) {
        Long resolvedUserId = Objects.requireNonNull(userId, "User id must not be null");

        List<TicketEntity> ticketEntities = ticketRepository.findAllByUserIdOrderByCreatedAtDesc(resolvedUserId);
        if (ticketEntities.isEmpty()) {
            return List.of();
        }

        Set<Long> eventIds = ticketEntities.stream()
                .map(TicketEntity::getEventId)
                .collect(Collectors.toSet());

    List<Long> eventIdList = new ArrayList<>(eventIds);

    Map<Long, EventEntity> eventsById = eventRepository.findAllById(eventIdList).stream()
                .collect(Collectors.toMap(EventEntity::getId, Function.identity()));

        return ticketEntities.stream()
                .map(ticketEntity -> {
                    EventEntity event = eventsById.get(ticketEntity.getEventId());
                    if (event == null) {
                        throw new EventNotFound(ticketEntity.getEventId());
                    }

                    Ticket ticket = ticketMapper.toModel(ticketEntity);
                    Event eventModel = eventMapper.toModel(event);
                    return new TicketPurchaseSummary(ticket, eventModel);
                })
                .toList();
    }

    private void validateEventState(EventEntity event) {
        if (!Boolean.TRUE.equals(event.getIsActive())) {
            throw new TicketPurchaseException(EVENT_NOT_ACTIVE_MESSAGE);
        }

        if (event.getAvailableTickets() == null || event.getAvailableTickets() <= 0) {
            throw new TicketPurchaseException(EVENT_SOLD_OUT_MESSAGE);
        }
    }

    private void decrementAvailability(EventEntity event) {
        int remaining = event.getAvailableTickets() - 1;
        if (remaining < 0) {
            throw new TicketPurchaseException(EVENT_SOLD_OUT_MESSAGE);
        }
        event.setAvailableTickets(remaining);
    }

    private String resolveIssuedTo(String issuedTo) {
        if (issuedTo == null || issuedTo.isBlank()) {
            return DEFAULT_ISSUED_TO;
        }
        return issuedTo.trim();
    }
}
