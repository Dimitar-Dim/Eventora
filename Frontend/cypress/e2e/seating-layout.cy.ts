describe('Seating Layout Features', () => {
  const mockFloorEvent = {
    id: 1,
    name: 'Floor Layout Event',
    description: 'Event with floor seating',
    eventDate: '2025-12-20T19:00:00',
    genre: 'ROCK',
    ticketPrice: 50.00,
    maxTickets: 100,
    availableTickets: 95,
    hasSeating: true,
    seatingLayout: 'FLOOR',
    standingCapacity: 0,
    seatedCapacity: 100,
    imageUrl: null,
    organizerId: 1,
    isActive: true
  }

  const mockBalconyEvent = {
    ...mockFloorEvent,
    id: 2,
    name: 'Balcony Layout Event',
    seatingLayout: 'FLOOR_BALCONY',
    seatedCapacity: 200
  }

  const mockStandingEvent = {
    ...mockFloorEvent,
    id: 3,
    name: 'Standing Only Event',
    hasSeating: false,
    seatingLayout: 'NONE',
    standingCapacity: 600,
    seatedCapacity: 0
  }

  describe('Floor seating layout', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/events', [mockFloorEvent]).as('getEvents')
      cy.intercept('GET', `**/api/events/${mockFloorEvent.id}`, mockFloorEvent).as('getEvent')
    })

    it('displays floor seating map', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Should show seating map
      cy.get('[data-cy="venue-map"]').should('be.visible')
      cy.contains(/floor/i).should('be.visible')
    })

    it('allows selecting floor seats', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Select multiple floor seats
      cy.get('[data-cy="seat-button"]').eq(0).click()
      cy.get('[data-cy="seat-button"]').eq(1).click()
      cy.get('[data-cy="seat-button"]').eq(2).click()
      
      // Should show selected count
      cy.contains(/3.*seat/i).should('be.visible')
    })
  })

  describe('Floor and balcony layout', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/events', [mockBalconyEvent]).as('getEvents')
      cy.intercept('GET', `**/api/events/${mockBalconyEvent.id}`, mockBalconyEvent).as('getEvent')
    })

    it('displays both floor and balcony sections', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.contains(/floor/i).should('be.visible')
      cy.contains(/balcony/i).should('be.visible')
    })

    it('allows selecting seats from different sections', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Select seats from both sections
      cy.get('[aria-label*="Floor"]').first().click()
      cy.get('[aria-label*="Balcony"]').first().click()
      
      cy.contains(/2.*seat/i).should('be.visible')
    })
  })

  describe('Standing only events', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/events', [mockStandingEvent]).as('getEvents')
      cy.intercept('GET', `**/api/events/${mockStandingEvent.id}`, mockStandingEvent).as('getEvent')
    })

    it('shows standing capacity info', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.contains(/standing/i).should('be.visible')
      cy.contains(/600/i).should('be.visible')
    })

    it('does not show seating map for standing events', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.get('[data-cy="venue-map"]').should('not.exist')
    })
  })

  describe('Seat name customization', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/events', [mockFloorEvent]).as('getEvents')
      cy.intercept('GET', `**/api/events/${mockFloorEvent.id}`, mockFloorEvent).as('getEvent')
    })

    it('allows adding names to selected seats', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Select a seat
      cy.get('[data-cy="seat-button"]').first().click()
      
      // Add name to seat
      cy.get('[data-cy="name-input"]').first().should('be.visible').type('John Doe')
      cy.get('[data-cy="name-input"]').first().should('have.value', 'John Doe')
    })
  })
})
