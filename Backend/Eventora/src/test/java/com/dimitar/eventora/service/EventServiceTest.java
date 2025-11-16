package com.dimitar.***REMOVED***vice;

import com.dimitar.eventora.dto.EventDTO;
import com.dimitar.eventora.entity.EventEntity;
import com.dimitar.eventora.exception.EventNotFound;
import com.dimitar.eventora.mapper.EventMapper;
import com.dimitar.eventora.model.Event;
import com.dimitar.eventora.model.Genre;
import com.dimitar.eventora.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
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
@DisplayName("EventService Tests")
@SuppressWarnings({"null", "NullAway"})
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Spy
    private EventMapper eventMapper = new EventMapper();

    @InjectMocks
    private EventServiceImpl eventService;

    private EventDTO validEventRequestDTO;
    private EventEntity validEventEntity;

    @BeforeEach
    void setUp() {
        validEventRequestDTO = new EventDTO();
        validEventRequestDTO.setName("Spring Concert");
        validEventRequestDTO.setDescription("An amazing spring concert featuring local artists");
        validEventRequestDTO.setEventDate(LocalDateTime.of(2025, 6, 15, 19, 0));
        validEventRequestDTO.setGenre(Genre.Rock);
        validEventRequestDTO.setTicketPrice(new BigDecimal("49.99"));
        validEventRequestDTO.setMaxTickets(500);
        validEventRequestDTO.setImageUrl("https://example.com/concert.jpg");
        validEventRequestDTO.setOrganizerId(1L);

        validEventEntity = buildEventEntity();
    }

    @Test
    @DisplayName("Should create event successfully with valid data")
    void createEvent_ValidData_SavesSuccessfully() {
        when(eventRepository.save(any(EventEntity.class))).thenReturn(validEventEntity);

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

        verify(eventRepository, times(1)).save(any(EventEntity.class));
    }

    @Test
    @DisplayName("Should initialize available tickets to max tickets")
    void createEvent_ValidData_InitializesAvailableTicketsToMaxTickets() {
        ArgumentCaptor<EventEntity> eventCaptor = ArgumentCaptor.forClass(EventEntity.class);
        when(eventRepository.save(any(EventEntity.class))).thenReturn(validEventEntity);

        // Act
        eventService.createEvent(validEventRequestDTO);

        // Assert
        verify(eventRepository).save(eventCaptor.capture());
        EventEntity capturedEvent = eventCaptor.getValue();
        assertEquals(capturedEvent.getMaxTickets(), capturedEvent.getAvailableTickets());
    }


    @Test
    @DisplayName("Should set isActive to true on creation")
    void createEvent_ValidData_SetsIsActiveToTrue() {
        ArgumentCaptor<EventEntity> eventCaptor = ArgumentCaptor.forClass(EventEntity.class);
        when(eventRepository.save(any(EventEntity.class))).thenReturn(validEventEntity);

        // Act
        eventService.createEvent(validEventRequestDTO);

        // Assert
        verify(eventRepository).save(eventCaptor.capture());
        EventEntity capturedEvent = eventCaptor.getValue();
        assertTrue(capturedEvent.getIsActive());
    }



    @Test
    @DisplayName("Should get event by id successfully")
    void getEventById_ValidId_ReturnsEvent() {
        Long eventId = 1L;
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(validEventEntity));

        // Act
        Event result = eventService.getEventById(eventId);

        // Assert
        assertNotNull(result);
        assertEquals(validEventEntity.getId(), result.getId());
        assertEquals(validEventEntity.getName(), result.getName());
        verify(eventRepository, times(1)).findById(eventId);
    }

    @Test
    @DisplayName("Should throw EventNotFound when event id is invalid")
    void getEventById_InvalidId_ThrowsEventNotFoundException() {
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        assertThrows(EventNotFound.class, () -> eventService.getEventById(invalidId));
        verify(eventRepository, times(1)).findById(invalidId);
    }

    @Test
    @DisplayName("Should throw EventNotFound when event id is null")
    void getEventById_NullId_ThrowsIllegalArgumentException() {
        assertThrows(EventNotFound.class, () -> eventService.getEventById(null));

        verify(eventRepository, never()).findById(anyLong());
    }


    @Test
    void updateEvent_ValidData_UpdatesSuccessfully() {
        // Arrange
        Long eventId = 1L;
        EventDTO updateDTO = new EventDTO();
        updateDTO.setName("Updated Concert");
        updateDTO.setDescription("Updated description");
        updateDTO.setEventDate(LocalDateTime.of(2025, 7, 20, 20, 0));
        updateDTO.setGenre(Genre.Jazz);
        updateDTO.setTicketPrice(new BigDecimal("59.99"));
        updateDTO.setMaxTickets(600);
        updateDTO.setImageUrl("https://example.com/updated.jpg");
        updateDTO.setOrganizerId(1L);

        EventEntity existingEvent = buildEventEntity();
        LocalDateTime originalCreatedAt = existingEvent.getCreatedAt();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

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
        verify(eventRepository, times(1)).save(any(EventEntity.class));
    }


    @Test
    @DisplayName("Should throw EventNotFound when updating non-existent event")
    void updateEvent_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.updateEvent(invalidId, validEventRequestDTO);
        });

        verify(eventRepository, times(1)).findById(invalidId);
        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    @Test
    @DisplayName("Should throw EventNotFound when updating with null id")
    void updateEvent_NullId_ThrowsIllegalArgumentException() {
        // Arrange - Service will pass null to repository which throws
        
        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.updateEvent(null, validEventRequestDTO);
        });

        verify(eventRepository, never()).findById(anyLong());
        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    @Test
    @DisplayName("Should deactivate event on delete")
    void deleteEvent_ValidId_DeactivatesEvent() {
        // Arrange
        Long eventId = 1L;
        EventEntity existingEvent = buildEventEntity();
        existingEvent.setIsActive(true);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        eventService.deleteEvent(eventId);

        // Assert
        ArgumentCaptor<EventEntity> eventCaptor = ArgumentCaptor.forClass(EventEntity.class);
        verify(eventRepository).save(eventCaptor.capture());
        EventEntity capturedEvent = eventCaptor.getValue();
        assertFalse(capturedEvent.getIsActive());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(EventEntity.class));
        verify(eventRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should throw EventNotFound when deleting non-existent event")
    void deleteEvent_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.deleteEvent(invalidId);
        });

        verify(eventRepository, times(1)).findById(invalidId);
        verify(eventRepository, never()).save(any(EventEntity.class));
        verify(eventRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should throw EventNotFound when deleting with null id")
    void deleteEvent_NullId_ThrowsIllegalArgumentException() {
        // Arrange - Service will pass null to repository which throws
        
        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.deleteEvent(null);
        });

        verify(eventRepository, never()).findById(anyLong());
        verify(eventRepository, never()).save(any(EventEntity.class));
    }


    @Test
    @DisplayName("Should return all events when they exist")
    void getAllEvents_EventsExist_ReturnsAllEvents() {
        // Arrange
        EventEntity event1 = buildEventEntity();
        event1.setId(1L);
        event1.setName("Event 1");

        EventEntity event2 = buildEventEntity();
        event2.setId(2L);
        event2.setName("Event 2");

        EventEntity event3 = buildEventEntity();
        event3.setId(3L);
        event3.setName("Event 3");
        event3.setIsActive(false);

        List<EventEntity> allEvents = Arrays.asList(event1, event2, event3);
        when(eventRepository.findAll()).thenReturn(allEvents);

        // Act
        List<Event> result = eventService.getAllEvents();

        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no events exist")
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
    @DisplayName("Should return only active events when they exist")
    void getActiveEvents_ActiveEventsExist_ReturnsOnlyActiveEvents() {
        // Arrange
        EventEntity activeEvent1 = buildEventEntity();
        activeEvent1.setId(1L);
        activeEvent1.setName("Active Event 1");
        activeEvent1.setIsActive(true);

        EventEntity activeEvent2 = buildEventEntity();
        activeEvent2.setId(2L);
        activeEvent2.setName("Active Event 2");
        activeEvent2.setIsActive(true);

        EventEntity inactiveEvent = buildEventEntity();
        inactiveEvent.setId(3L);
        inactiveEvent.setName("Inactive Event");
        inactiveEvent.setIsActive(false);

        List<EventEntity> allEvents = Arrays.asList(activeEvent1, activeEvent2, inactiveEvent);
        when(eventRepository.findAll()).thenReturn(allEvents);

        // Act
        List<Event> result = eventService.getActiveEvents();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no active events exist")
    void getActiveEvents_NoActiveEvents_ReturnsEmptyList() {
        // Arrange
        EventEntity inactiveEvent1 = buildEventEntity();
        inactiveEvent1.setIsActive(false);

        EventEntity inactiveEvent2 = buildEventEntity();
        inactiveEvent2.setIsActive(false);

        List<EventEntity> allInactiveEvents = Arrays.asList(inactiveEvent1, inactiveEvent2);
        when(eventRepository.findAll()).thenReturn(allInactiveEvents);

        // Act
        List<Event> result = eventService.getActiveEvents();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(eventRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no events exist at all")
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
    @DisplayName("Should set IsActive to false when deactivating event")
    void deactivateEvent_ValidId_SetsIsActiveToFalse() {
        // Arrange
        Long eventId = 1L;
        EventEntity activeEvent = buildEventEntity();
        activeEvent.setIsActive(true);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(activeEvent));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Event result = eventService.deactivateEvent(eventId);

        // Assert
        assertNotNull(result);
        assertFalse(result.getIsActive());

        ArgumentCaptor<EventEntity> eventCaptor = ArgumentCaptor.forClass(EventEntity.class);
        verify(eventRepository).save(eventCaptor.capture());
        EventEntity capturedEvent = eventCaptor.getValue();
        assertFalse(capturedEvent.getIsActive());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(EventEntity.class));
    }

    @Test
    @DisplayName("Should remain inactive when deactivating already inactive event")
    void deactivateEvent_AlreadyInactive_RemainsInactive() {
        // Arrange
        Long eventId = 1L;
        EventEntity inactiveEvent = buildEventEntity();
        inactiveEvent.setIsActive(false);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(inactiveEvent));
        when(eventRepository.save(any(EventEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Event result = eventService.deactivateEvent(eventId);

        // Assert
        assertNotNull(result);
        assertFalse(result.getIsActive());

        verify(eventRepository, times(1)).findById(eventId);
        verify(eventRepository, times(1)).save(any(EventEntity.class));
    }

    @Test
    @DisplayName("Should throw EventNotFound when deactivating non-existent event")
    void deactivateEvent_InvalidId_ThrowsEventNotFoundException() {
        // Arrange
        Long invalidId = 999L;
        when(eventRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.deactivateEvent(invalidId);
        });

        verify(eventRepository, times(1)).findById(invalidId);
        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    @Test
    @DisplayName("Should throw EventNotFound when deactivating with null id")
    void deactivateEvent_NullId_ThrowsIllegalArgumentException() {
        // Arrange - Service will pass null to repository which throws
        
        // Act & Assert
        assertThrows(EventNotFound.class, () -> {
            eventService.deactivateEvent(null);
        });

        verify(eventRepository, never()).findById(anyLong());
        verify(eventRepository, never()).save(any(EventEntity.class));
    }

    private EventEntity buildEventEntity() {
        EventEntity event = new EventEntity();
        event.setId(1L);
        event.setName("Spring Concert");
        event.setDescription("An amazing spring concert featuring local artists");
        event.setEventDate(LocalDateTime.of(2025, 6, 15, 19, 0));
        event.setGenre(Genre.Rock);
        event.setTicketPrice(new BigDecimal("49.99"));
        event.setMaxTickets(500);
        event.setAvailableTickets(500);
        event.setImageUrl("https://example.com/concert.jpg");
        event.setIsActive(true);
        event.setOrganizerId(1L);
        return event;
    }
}
