package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.email.EmailAttachment;
import com.dimitar.eventora.email.EmailRequest;
import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailTemplate;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.entity.TicketEntity;
import com.dimitar.***REMOVED***Entity;
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
import com.dimitar.***REMOVED***Repository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    private static final String EVENT_NOT_ACTIVE_MESSAGE = "This event is not accepting ticket purchases right now";
    private static final String EVENT_SOLD_OUT_MESSAGE = "Sorry, this event is sold out";
    private static final String DEFAULT_ISSUED_TO = "Ticket Holder";
    private static final String TICKET_ENTITY_NULL_MESSAGE = "Ticket entity must not be null";
    private static final String EVENT_ENTITY_NULL_MESSAGE = "Event entity must not be null";
    private static final String USER_ID_NULL_MESSAGE = "User id must not be null";
    private static final DateTimeFormatter EVENT_DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a");

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;
    private final TicketMapper ticketMapper;
    private final PDFTicketService pdfTicketService;
    private final EmailService emailService;

    @Override
    @Transactional
    public TicketPurchaseSummary purchaseTicket(Long ***REMOVED***Id, String issuedTo) {
        Long resolvedEventId = Objects.requireNonNull(eventId, "Event id must not be null");
        Long resolvedUserId = Objects.requireNonNull(userId, USER_ID_NULL_MESSAGE);

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
        TicketPurchaseSummary summary = new TicketPurchaseSummary(ticket, updatedEventModel);

        dispatchTicketEmail(resolvedUserId, summary);
        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketPurchaseSummary> getTicketsForUser(Long userId) {
        Long resolvedUserId = Objects.requireNonNull(userId, USER_ID_NULL_MESSAGE);

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

    private void dispatchTicketEmail(Long userId, TicketPurchaseSummary summary) {
        Long resolvedUserId = Objects.requireNonNull(userId, USER_ID_NULL_MESSAGE);
        userRepository.findById(resolvedUserId).ifPresentOrElse(
                user -> sendEmailWithAttachment(user, summary),
            () -> log.warn("Skipping ticket email because user {} was not found", resolvedUserId)
        );
    }

    private void sendEmailWithAttachment(UserEntity user, TicketPurchaseSummary summary) {
        try {
            byte[] pdfBytes = pdfTicketService.generateTicketPdf(
                    summary.event().getName(),
                    summary.ticket().getIssuedTo(),
                    summary.ticket().getQrCode()
            );

            EmailAttachment attachment = new EmailAttachment(
                    "ticket-" + summary.ticket().getId() + ".pdf",
                    pdfBytes,
                    "application/pdf"
            );

            Map<String, Object> variables = new HashMap<>();
            variables.put("eventName", summary.event().getName());
            variables.put("attendee", summary.ticket().getIssuedTo());
            variables.put("ticketId", summary.ticket().getId());
            variables.put("eventDate", formatEventDate(summary.event().getEventDate()));

            emailService.send(new EmailRequest(
                    user.getEmail(),
                    EmailTemplate.TICKET_PURCHASE,
                    variables,
                    List.of(attachment)
            ));
        } catch (Exception ex) {
            log.warn("Failed to email ticket {} to {}", summary.ticket().getId(), user.getEmail(), ex);
        }
    }

    private String formatEventDate(LocalDateTime eventDate) {
        if (eventDate == null) {
            return "To be announced";
        }
        return eventDate.format(EVENT_DATE_FORMATTER);
    }
}
