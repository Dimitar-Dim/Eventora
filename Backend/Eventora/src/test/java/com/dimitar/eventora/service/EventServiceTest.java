package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventRequestDTO;
import com.dimitar.eventora.exception.EventNotFound;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventServiceImpl eventService;

    private EventRequestDTO validEventRequestDTO;
    private Event validEvent;

    @BeforeEach
    void setUp() {
        validEventRequestDTO = new EventRequestDTO();
        validEventRequestDTO.setName("Spring Concert");
        validEventRequestDTO.setDescription("An amazing spring concert featuring local artists");
        validEventRequestDTO.setEventDate(LocalDateTime.of(2025, 6, 15, 19, 0));
        validEventRequestDTO.setGenre(Genre.Rock);
        validEventRequestDTO.setTicketPrice(new BigDecimal("49.99"));
        validEventRequestDTO.setMaxTickets(500);
        validEventRequestDTO.setImageUrl("https://example.com/concert.jpg");
        validEventRequestDTO.setOrganizerId(1L);

        validEvent = buildEvent();
    }

    @Test
    void createEvent_ValidData_SavesSuccessfully() {
        // Arrange
        when(eventRepository.save(any(Event.class))).thenReturn(validEvent);

        // Act
        Event result = eventService.createEvent(validEventRequestDTO);

        // Assert
        assertNotNull(result);
        assertEquals(validEventRequestDTO.getName(), result.getName());
        assertEquals(validEventRequestDTO.getDescription(), result.getDescription());
        assertEquals(validEventRequestDTO.getEventDate(), result.getEventDate());
        assertEquals(validEventRequestDTO.getGenre(), result.getGenre());
        assertEquals(validEventRequestDTO.getTicketPrice(), result.getTicketPrice());
        assertEquals(validEventRequestDTO.getMaxTickets(), result.getMaxTickets());
        assertEquals(validEventRequestDTO.getImageUrl(), result.getImageUrl());
        assertEquals(validEventRequestDTO.getOrganizerId(), result.getOrganizerId());

        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void createEvent_ValidData_InitializesAvailableTicketsToMaxTickets() {
        // Arrange
        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        when(eventRepository.save(any(Event.class))).thenReturn(validEvent);

        // Act
        eventService.createEvent(validEventRequestDTO);

        // Assert
        verify(eventRepository).save(eventCaptor.capture());
        Event capturedEvent = eventCaptor.getValue();
        assertEquals(capturedEvent.getMaxTickets(), capturedEvent.getAvailableTickets());
    }

    @Test
    void createEvent_ValidData_InitializesTimestamps() {
        // Arrange
        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        when(eventRepository.save(any(Event.class))).thenReturn(validEvent);

        // Act
        eventService.createEvent(validEventRequestDTO);

        // Assert
        verify(eventRepository).save(eventCaptor.capture());
        Event capturedEvent = eventCaptor.getValue();
        assertNotNull(capturedEvent.getCreatedAt());
        assertNotNull(capturedEvent.getUpdatedAt());
    }

    @Test
    void createEvent_ValidData_SetsIsActiveToTrue() {
        // Arrange
        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        when(eventRepository.save(any(Event.class))).thenReturn(validEvent);

        // Act
        eventService.createEvent(validEventRequestDTO);

        // Assert
        verify(eventRepository).save(eventCaptor.capture());
        Event capturedEvent = eventCaptor.getValue();
        assertTrue(capturedEvent.getIsActive());
    }

    @Test
    void createEvent_NullName_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setName(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_EmptyName_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setName("");

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_NullEventDate_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setEventDate(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_NullTicketPrice_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setTicketPrice(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_NegativeTicketPrice_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setTicketPrice(new BigDecimal("-10.00"));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_NullMaxTickets_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setMaxTickets(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_NegativeMaxTickets_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setMaxTickets(-10);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_ZeroMaxTickets_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setMaxTickets(0);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_NullUserId_ThrowsIllegalArgumentException() {
        // Arrange
        validEventRequestDTO.setOrganizerId(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void getEventById_ValidId_ReturnsEvent() {
        // Arrange
        Long eventId = 1L;
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(validEvent));

        // Act
        Event result = eventService.getEventById(eventId);

        // Assert
        assertNotNull(result);
        assertEquals(validEvent.getId(), result.getId());
        assertEquals(validEvent.getName(), result.getName());
        verify(eventRepository, times(1)).findById(eventId);
    }

    @Test
    void getEventById_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.getEventById(invalidId);
        });

        verify(eventRepository, times(1)).findById(invalidId);
    }

    @Test
    void getEventById_NullId_ThrowsIllegalArgumentException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.getEventById(null);
        });

        verify(eventRepository, never()).findById(anyLong());
    }


    @Test
    void updateEvent_ValidData_UpdatesSuccessfully() {
        // Arrange
        Long eventId = 1L;
        EventRequestDTO updateDTO = new EventRequestDTO();
        updateDTO.setName("Updated Concert");
        updateDTO.setDescription("Updated description");
        updateDTO.setEventDate(LocalDateTime.of(2025, 7, 20, 20, 0));
        updateDTO.setGenre(Genre.Jazz);
        updateDTO.setTicketPrice(new BigDecimal("59.99"));
        updateDTO.setMaxTickets(600);
        updateDTO.setImageUrl("https://example.com/updated.jpg");
        updateDTO.setOrganizerId(1L);

        Event existingEvent = buildEvent();
        LocalDateTime originalCreatedAt = existingEvent.getCreatedAt();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Event result = eventService.updateEvent(eventId, updateDTO);

        // Assert
        assertNotNull(result);
        assertEquals(updateDTO.getName(), result.getName());
        assertEquals(updateDTO.getDescription(), result.getDescription());
        assertEquals(updateDTO.getEventDate(), result.getEventDate());
        assertEquals(updateDTO.getGenre(), result.getGenre());
        assertEquals(updateDTO.getTicketPrice(), result.getTicketPrice());
        assertEquals(updateDTO.getMaxTickets(), result.getMaxTickets());
        assertEquals(updateDTO.getImageUrl(), result.getImageUrl());
        assertEquals(originalCreatedAt, result.getCreatedAt()); // createdAt should not change

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void updateEvent_ValidData_UpdatesUpdatedAtTimestamp() {
        // Arrange
        Long eventId = 1L;
        Event existingEvent = buildEvent();
        LocalDateTime originalUpdatedAt = existingEvent.getUpdatedAt();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            e.setUpdatedAt(LocalDateTime.now().plusSeconds(1));
            return e;
        });

        // Act
        Event result = eventService.updateEvent(eventId, validEventRequestDTO);

        // Assert
        assertNotNull(result.getUpdatedAt());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void updateEvent_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.updateEvent(invalidId, validEventRequestDTO);
        });

        verify(eventRepository, times(1)).findById(invalidId);
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void updateEvent_NullId_ThrowsIllegalArgumentException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.updateEvent(null, validEventRequestDTO);
        });

        verify(eventRepository, never()).findById(anyLong());
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void updateEvent_InvalidData_ThrowsIllegalArgumentException() {
        // Arrange
        Long eventId = 1L;
        validEventRequestDTO.setName(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.updateEvent(eventId, validEventRequestDTO);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }


    @Test
    void deleteEvent_ValidId_DeactivatesEvent() {
        // Arrange
        Long eventId = 1L;
        Event existingEvent = buildEvent();
        existingEvent.setIsActive(true);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        eventService.deleteEvent(eventId);

        // Assert
        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(eventCaptor.capture());
        Event capturedEvent = eventCaptor.getValue();
        assertFalse(capturedEvent.getIsActive());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(Event.class));
        verify(eventRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteEvent_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.deleteEvent(invalidId);
        });

        verify(eventRepository, times(1)).findById(invalidId);
        verify(eventRepository, never()).save(any(Event.class));
        verify(eventRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteEvent_NullId_ThrowsIllegalArgumentException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.deleteEvent(null);
        });

        verify(eventRepository, never()).findById(anyLong());
        verify(eventRepository, never()).save(any(Event.class));
    }


    @Test
    void getAllEvents_EventsExist_ReturnsAllEvents() {
        // Arrange
        Event event1 = buildEvent();
        event1.setId(1L);
        event1.setName("Event 1");

        Event event2 = buildEvent();
        event2.setId(2L);
        event2.setName("Event 2");

        Event event3 = buildEvent();
        event3.setId(3L);
        event3.setName("Event 3");
        event3.setIsActive(false);

        List<Event> allEvents = Arrays.asList(event1, event2, event3);
        when(eventRepository.findAll()).thenReturn(allEvents);

        // Act
        List<Event> result = eventService.getAllEvents();

        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());
        assertTrue(result.contains(event1));
        assertTrue(result.contains(event2));
        assertTrue(result.contains(event3));

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    void getAllEvents_NoEvents_ReturnsEmptyList() {
        // Arrange
        when(eventRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Event> result = eventService.getAllEvents();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(eventRepository, times(1)).findAll();
    }


    @Test
    void getActiveEvents_ActiveEventsExist_ReturnsOnlyActiveEvents() {
        // Arrange
        Event activeEvent1 = buildEvent();
        activeEvent1.setId(1L);
        activeEvent1.setName("Active Event 1");
        activeEvent1.setIsActive(true);

        Event activeEvent2 = buildEvent();
        activeEvent2.setId(2L);
        activeEvent2.setName("Active Event 2");
        activeEvent2.setIsActive(true);

        Event inactiveEvent = buildEvent();
        inactiveEvent.setId(3L);
        inactiveEvent.setName("Inactive Event");
        inactiveEvent.setIsActive(false);

        List<Event> allEvents = Arrays.asList(activeEvent1, activeEvent2, inactiveEvent);
        when(eventRepository.findAll()).thenReturn(allEvents);

        // Act
        List<Event> result = eventService.getActiveEvents();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains(activeEvent1));
        assertTrue(result.contains(activeEvent2));
        assertFalse(result.contains(inactiveEvent));

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    void getActiveEvents_NoActiveEvents_ReturnsEmptyList() {
        // Arrange
        Event inactiveEvent1 = buildEvent();
        inactiveEvent1.setIsActive(false);

        Event inactiveEvent2 = buildEvent();
        inactiveEvent2.setIsActive(false);

        List<Event> allInactiveEvents = Arrays.asList(inactiveEvent1, inactiveEvent2);
        when(eventRepository.findAll()).thenReturn(allInactiveEvents);

        // Act
        List<Event> result = eventService.getActiveEvents();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    void getActiveEvents_NoEventsAtAll_ReturnsEmptyList() {
        // Arrange
        when(eventRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<Event> result = eventService.getActiveEvents();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(eventRepository, times(1)).findAll();
    }


    @Test
    void deactivateEvent_ValidId_SetsIsActiveToFalse() {
        // Arrange
        Long eventId = 1L;
        Event activeEvent = buildEvent();
        activeEvent.setIsActive(true);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(activeEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Event result = eventService.deactivateEvent(eventId);

        // Assert
        assertNotNull(result);
        assertFalse(result.getIsActive());

        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(eventCaptor.capture());
        Event capturedEvent = eventCaptor.getValue();
        assertFalse(capturedEvent.getIsActive());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void deactivateEvent_AlreadyInactive_RemainsInactive() {
        // Arrange
        Long eventId = 1L;
        Event inactiveEvent = buildEvent();
        inactiveEvent.setIsActive(false);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(inactiveEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Event result = eventService.deactivateEvent(eventId);

        // Assert
        assertNotNull(result);
        assertFalse(result.getIsActive());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void deactivateEvent_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.deactivateEvent(invalidId);
        });

        verify(eventRepository, times(1)).findById(invalidId);
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void deactivateEvent_NullId_ThrowsIllegalArgumentException() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            eventService.deactivateEvent(null);
        });

        verify(eventRepository, never()).findById(anyLong());
        verify(eventRepository, never()).save(any(Event.class));
    }

    private Event buildEvent() {
        Event event = new Event();
        event.setId(1L);
        event.setName("Spring Concert");
        event.setDescription("An amazing spring concert featuring local artists");
        event.setEventDate(LocalDateTime.of(2025, 6, 15, 19, 0));
        event.setGenre(Genre.Rock);
        event.setTicketPrice(new BigDecimal("49.99"));
        event.setMaxTickets(500);
        event.setAvailableTickets(500);
        event.setImageUrl("https://example.com/concert.jpg");
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setIsActive(true);
        event.setOrganizerId(1L);
        return event;
    }
}
