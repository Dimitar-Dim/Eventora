package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.email.EmailAttachment;
import com.dimitar.eventora.email.EmailRequest;
import com.dimitar.eventora.email.EmailService;
import com.dimitar.eventora.email.EmailTemplate;
import com.dimitar.eventora.email.EmailVerifier;
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
import com.dimitar.***REMOVED***vationService;
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
    private static final String USER_ID_REQUIRED_MESSAGE = "User id must not be null";
    private static final String USER_NOT_FOUND_MESSAGE = "We couldn't find your account. Please sign in again.";
    private static final String DELIVERY_EMAIL_REQUIRED_MESSAGE = "Please provide the email address where we should deliver the ticket.";
    private static final String DELIVERY_EMAIL_INVALID_MESSAGE = "Please provide a valid email address so we can deliver the ticket.";
    private static final String ACCOUNT_EMAIL_REQUIRED_MESSAGE = "Your account must have an email address before purchasing tickets.";
    private static final int SEATS_PER_ROW = 20;
    private static final int FLOOR_SECTION_ROWS = 5;
    private static final DateTimeFormatter EVENT_DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a");

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;
    private final TicketMapper ticketMapper;
    private final PDFTicketService pdfTicketService;
    private final EmailService emailService;
    private final EmailVerifier emailVerifier;
    private final SeatReservationService seatReservationService;

    @Override
    @Transactional
    public TicketPurchaseSummary purchaseTicket(Long ***REMOVED***Id, String issuedTo, String deliveryEmail,
                                                 String seatSection, String seatRow, String seatNumber) {
        Long resolvedEventId = Objects.requireNonNull(eventId, "Event id must not be null");

        EventEntity event = eventRepository.findById(resolvedEventId)
                .orElseThrow(() -> new EventNotFound(resolvedEventId));

        UserEntity purchasingUser = null;
        if (userId != null) {
            Long resolvedUserId = userId;
            purchasingUser = userRepository.findById(resolvedUserId)
                    .orElseThrow(() -> new TicketPurchaseException(USER_NOT_FOUND_MESSAGE));
        }

        validateEventState(event);
        decrementAvailability(event);

        // Use provided seat info if available, otherwise auto-assign
        SeatMetadata seatMetadata;
        if (seatSection != null && seatRow != null && seatNumber != null) {
            seatMetadata = new SeatMetadata(seatSection, seatRow, seatNumber);
        } else {
            seatMetadata = assignSeatMetadata(event);
        }
        String resolvedDeliveryEmail = resolveDeliveryEmail(purchasingUser, deliveryEmail);

        TicketEntity ticketEntity = TicketEntity.builder()
                .eventId(resolvedEventId)
                .userId(purchasingUser != null ? purchasingUser.getId() : null)
                .deliveryEmail(resolvedDeliveryEmail)
                .issuedTo(resolveIssuedTo(issuedTo))
                .qrCode(UUID.randomUUID().toString())
                .status(TicketStatus.ACTIVE)
                .seatSection(seatMetadata.section())
                .seatRow(seatMetadata.row())
                .seatNumber(seatMetadata.number())
                .build();

        TicketEntity savedTicket = ticketRepository.save(Objects.requireNonNull(ticketEntity, TICKET_ENTITY_NULL_MESSAGE));
        EventEntity updatedEvent = eventRepository.save(Objects.requireNonNull(event, EVENT_ENTITY_NULL_MESSAGE));

        // Mark seat as purchased and broadcast to WebSocket clients
        if (seatMetadata.section() != null && seatMetadata.number() != null) {
            try {
                Integer seatNum = Integer.parseInt(seatMetadata.number());
                seatReservationService.markAsPurchased(resolvedEventId, seatMetadata.section(), seatNum);
            } catch (NumberFormatException e) {
                log.warn("Failed to parse seat number for WebSocket broadcast: {}", seatMetadata.number());
            }
        }

        Ticket ticket = ticketMapper.toModel(savedTicket);
        Event updatedEventModel = eventMapper.toModel(updatedEvent);
        TicketPurchaseSummary summary = new TicketPurchaseSummary(ticket, updatedEventModel);

        dispatchTicketEmail(resolvedDeliveryEmail, summary);
        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketPurchaseSummary> getTicketsForUser(Long userId) {
        Long resolvedUserId = Objects.requireNonNull(userId, USER_ID_REQUIRED_MESSAGE);

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

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPurchasedSeatsForEvent(Long eventId) {
        List<TicketEntity> tickets = ticketRepository.findAllByEventId(eventId);
        
        return tickets.stream()
                .filter(ticket -> ticket.getSeatSection() != null && ticket.getSeatNumber() != null)
                .map(ticket -> {
                    Map<String, Object> seatInfo = new HashMap<>();
                    seatInfo.put("seatSection", ticket.getSeatSection());
                    seatInfo.put("seatRow", ticket.getSeatRow());
                    seatInfo.put("seatNumber", ticket.getSeatNumber());
                    return seatInfo;
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

    private SeatMetadata assignSeatMetadata(EventEntity event) {
        Objects.requireNonNull(event, EVENT_ENTITY_NULL_MESSAGE);
        long seatsAlreadyAssigned = ticketRepository.countByEventId(event.getId());
        int rowIndex = (int) (seatsAlreadyAssigned / SEATS_PER_ROW);
        int seatIndexInRow = (int) (seatsAlreadyAssigned % SEATS_PER_ROW) + 1;

        String seatRow = "R" + (rowIndex + 1);
        String seatNumber = String.format("%02d", seatIndexInRow);
        String seatSection = rowIndex < FLOOR_SECTION_ROWS ? "Floor" : "Balcony";

        return new SeatMetadata(seatSection, seatRow, seatNumber);
    }

    private void dispatchTicketEmail(String deliveryEmail, TicketPurchaseSummary summary) {
        String recipientEmail = Objects.requireNonNull(deliveryEmail, DELIVERY_EMAIL_REQUIRED_MESSAGE);
        sendEmailWithAttachment(recipientEmail, summary);
    }

    private void sendEmailWithAttachment(String recipientEmail, TicketPurchaseSummary summary) {
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
                    recipientEmail,
                    EmailTemplate.TICKET_PURCHASE,
                    variables,
                    List.of(attachment)
            ));
        } catch (Exception ex) {
            log.warn("Failed to email ticket {} to {}", summary.ticket().getId(), recipientEmail, ex);
        }
    }

    private String formatEventDate(LocalDateTime eventDate) {
        if (eventDate == null) {
            return "To be announced";
        }
        return eventDate.format(EVENT_DATE_FORMATTER);
    }

    private String resolveDeliveryEmail(UserEntity purchasingUser, String deliveryEmail) {
        String normalizedEmail = normalizeEmail(deliveryEmail);

        if (normalizedEmail == null) {
            if (purchasingUser == null) {
                throw new TicketPurchaseException(DELIVERY_EMAIL_REQUIRED_MESSAGE);
            }

            String accountEmail = normalizeEmail(purchasingUser.getEmail());
            if (accountEmail == null) {
                throw new TicketPurchaseException(ACCOUNT_EMAIL_REQUIRED_MESSAGE);
            }

            return verifyOrThrow(accountEmail);
        }

        return verifyOrThrow(normalizedEmail);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String verifyOrThrow(String email) {
        try {
            emailVerifier.verifyDeliverability(email);
            return email;
        } catch (IllegalArgumentException ex) {
            throw new TicketPurchaseException(DELIVERY_EMAIL_INVALID_MESSAGE);
        }
    }

    private record SeatMetadata(String section, String row, String number) {}
}
