package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.VerifyTicketResponse;
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
import com.dimitar.eventora.exception.UnauthorizedException;
import com.dimitar.eventora.mapper.EventMapper;
import com.dimitar.eventora.mapper.TicketMapper;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.Ticket;
import com.dimitar.eventora.model.TicketPurchaseSummary;
import com.dimitar.eventora.model.TicketStatus;
import com.dimitar.***REMOVED***Role;
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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
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

    private final Map<String, List<TicketPurchaseSummary>> pendingEmailBatches = new ConcurrentHashMap<>();
    private final Set<String> scheduledEmailFlushes = ConcurrentHashMap.newKeySet();
    private final ScheduledExecutorService emailBatchScheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r);
        t.setDaemon(true);
        t.setName("ticket-email-batcher");
        return t;
    });

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
                    .orElseThrow(() -> new TicketPurchaseException("We couldn't find your account. Please sign in again."));
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

        TicketEntity savedTicket = ticketRepository.save(Objects.requireNonNull(ticketEntity, "Ticket entity must not be null"));
        EventEntity updatedEvent = eventRepository.save(Objects.requireNonNull(event, "Event entity must not be null"));

        // Mark seat as purchased and broadcast to WebSocket clients
        if (seatMetadata.section() != null && seatMetadata.number() != null) {
            try {
                Integer seatNum = Integer.parseInt(seatMetadata.number());
                seatReservationService.markAsPurchased(resolvedEventId, seatMetadata.section(), seatNum, seatMetadata.row());
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
            throw new TicketPurchaseException("This event is not accepting ticket purchases right now");
        }

        if (event.getAvailableTickets() == null || event.getAvailableTickets() <= 0) {
            throw new TicketPurchaseException("Sorry, this event is sold out");
        }
    }

    private void decrementAvailability(EventEntity event) {
        int remaining = event.getAvailableTickets() - 1;
        if (remaining < 0) {
            throw new TicketPurchaseException("Sorry, this event is sold out");
        }
        event.setAvailableTickets(remaining);
    }

    private String resolveIssuedTo(String issuedTo) {
        if (issuedTo == null || issuedTo.isBlank()) {
            return "Ticket Holder";
        }
        return issuedTo.trim();
    }

    private SeatMetadata assignSeatMetadata(EventEntity event) {
        Objects.requireNonNull(event, "Event entity must not be null");
        long seatsAlreadyAssigned = ticketRepository.countByEventId(event.getId());
        int rowIndex = (int) (seatsAlreadyAssigned / SEATS_PER_ROW);
        int seatIndexInRow = (int) (seatsAlreadyAssigned % SEATS_PER_ROW) + 1;

        String seatRow = "R" + (rowIndex + 1);
        String seatNumber = String.format("%02d", seatIndexInRow);
        String seatSection = rowIndex < FLOOR_SECTION_ROWS ? "Floor" : "Balcony";

        return new SeatMetadata(seatSection, seatRow, seatNumber);
    }

    private void dispatchTicketEmail(String deliveryEmail, TicketPurchaseSummary summary) {
        String recipientEmail = Objects.requireNonNull(deliveryEmail, "Please provide the email address where we should deliver the ticket.");
        if (summary == null) {
            return;
        }

        pendingEmailBatches.merge(recipientEmail, List.of(summary), (existing, incoming) -> {
            var merged = new java.util.ArrayList<>(existing);
            merged.addAll(incoming);
            return merged;
        });

        if (scheduledEmailFlushes.add(recipientEmail)) {
            emailBatchScheduler.schedule(() -> flushEmailBatch(recipientEmail), 500, TimeUnit.MILLISECONDS);
        }
    }

    private void flushEmailBatch(String recipientEmail) {
        List<TicketPurchaseSummary> summaries = pendingEmailBatches.remove(recipientEmail);
        scheduledEmailFlushes.remove(recipientEmail);
        if (summaries == null || summaries.isEmpty()) {
            return;
        }
        sendEmailWithAttachments(recipientEmail, summaries);
    }

    private void sendEmailWithAttachments(String recipientEmail, List<TicketPurchaseSummary> summaries) {
        try {
            List<EmailAttachment> attachments = summaries.stream()
                    .map(summary -> new EmailAttachment(
                            buildAttachmentFileName(summary),
                            pdfTicketService.generateTicketPdf(
                                    summary.event().getName(),
                                    summary.ticket().getIssuedTo(),
                                    summary.ticket().getQrCode()
                            ),
                            "application/pdf"
                    ))
                    .toList();

            TicketPurchaseSummary first = summaries.get(0);

            Map<String, Object> variables = new HashMap<>();
            variables.put("eventName", first.event().getName());
            variables.put("attendee", buildAttendeeLabel(summaries));
            variables.put("ticketId", summaries.size() == 1 ? first.ticket().getId() : "Multiple tickets");
            variables.put("eventDate", formatEventDate(first.event().getEventDate()));

            emailService.send(new EmailRequest(
                    recipientEmail,
                    EmailTemplate.TICKET_PURCHASE,
                    variables,
                    attachments
            ));
        } catch (Exception ex) {
            log.warn("Failed to email tickets to {}", recipientEmail, ex);
        }
    }

    private String buildAttachmentFileName(TicketPurchaseSummary summary) {
        String eventName = sanitizeForFile(summary.event().getName());
        String holder = sanitizeForFile(summary.ticket().getIssuedTo());
        String base = (eventName.isBlank() ? "event" : eventName) + " - " + (holder.isBlank() ? "ticket" : holder);
        return base + ".pdf";
    }

    private String sanitizeForFile(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replaceAll("[\\\\/:*?\"<>|]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String buildAttendeeLabel(List<TicketPurchaseSummary> summaries) {
        if (summaries.isEmpty()) {
            return "";
        }
        String first = summaries.get(0).ticket().getIssuedTo();
        int remaining = summaries.size() - 1;
        if (remaining <= 0) {
            return first;
        }
        return first + " + " + remaining + " more";
    }

    private String formatEventDate(LocalDateTime eventDate) {
        if (eventDate == null) {
            return "To be announced";
        }
        return eventDate.format(EVENT_DATE_FORMATTER);
    }

    @Override
    @Transactional(readOnly = true)
    public VerifyTicketResponse verifyTicket(String qrCode, Long verifierId) {
        // Find the ticket by QR code
        TicketEntity ticket = ticketRepository.findByQrCode(qrCode)
                .orElse(null);
        
        if (ticket == null) {
            return VerifyTicketResponse.builder()
                    .verified(false)
                    .message("Ticket not found")
                    .build();
        }

        // Find the event
        Long eventId = ticket.getEventId();
        if (eventId == null) {
            return VerifyTicketResponse.builder()
                    .verified(false)
                    .message("Invalid ticket: no associated event")
                    .build();
        }

        EventEntity event = eventRepository.findById(eventId)
                .orElse(null);
        
        if (event == null) {
            return VerifyTicketResponse.builder()
                    .verified(false)
                    .message("Event not found")
                    .build();
        }

        // Find the verifier user
        if (verifierId == null) {
            throw new UnauthorizedException();
        }
        UserEntity verifier = userRepository.findById(verifierId)
                .orElseThrow(UnauthorizedException::new);

        // Check if verifier is admin or organizer of this event
        boolean isAdmin = verifier.getRole() == UserRole.ADMIN;
        boolean isEventOrganizer = Objects.equals(event.getOrganizerId(), verifierId);
        
        if (!isAdmin && !isEventOrganizer) {
            return VerifyTicketResponse.builder()
                    .verified(false)
                    .message("You are not authorized to verify tickets for this event")
                    .build();
        }

        // Check ticket status
        if (ticket.getStatus() == TicketStatus.USED) {
            return VerifyTicketResponse.builder()
                    .verified(false)
                    .message("Ticket has already been used")
                    .ticketId(ticket.getId())
                    .eventName(event.getName())
                    .issuedTo(ticket.getIssuedTo())
                    .seatInfo(buildSeatInfo(ticket))
                    .build();
        }

        if (ticket.getStatus() == TicketStatus.EXPIRED) {
            return VerifyTicketResponse.builder()
                    .verified(false)
                    .message("Ticket has expired")
                    .ticketId(ticket.getId())
                    .eventName(event.getName())
                    .issuedTo(ticket.getIssuedTo())
                    .seatInfo(buildSeatInfo(ticket))
                    .build();
        }

        // Mark ticket as used
        ticket.setStatus(TicketStatus.USED);
        ticket.setUsedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        return VerifyTicketResponse.builder()
                .verified(true)
                .message("Ticket verified successfully")
                .ticketId(ticket.getId())
                .eventName(event.getName())
                .issuedTo(ticket.getIssuedTo())
                .seatInfo(buildSeatInfo(ticket))
                .build();
    }

    private String buildSeatInfo(TicketEntity ticket) {
        if (ticket.getSeatSection() != null && ticket.getSeatRow() != null && ticket.getSeatNumber() != null) {
            return ticket.getSeatSection() + "-" + ticket.getSeatRow() + "-" + ticket.getSeatNumber();
        }
        return "Standing";
    }

    private String resolveDeliveryEmail(UserEntity purchasingUser, String deliveryEmail) {
        String normalizedEmail = normalizeEmail(deliveryEmail);

        if (normalizedEmail == null) {
            if (purchasingUser == null) {
                throw new TicketPurchaseException("Please provide the email address where we should deliver the ticket.");
            }

            String accountEmail = normalizeEmail(purchasingUser.getEmail());
            if (accountEmail == null) {
                throw new TicketPurchaseException("Your account must have an email address before purchasing tickets.");
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
            throw new TicketPurchaseException("Please provide a valid email address so we can deliver the ticket.");
        }
    }

    private record SeatMetadata(String section, String row, String number) {}
}
