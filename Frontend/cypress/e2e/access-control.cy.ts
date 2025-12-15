describe('Organizer Access Control', () => {
  const mockOrganizerUser = {
    id: '1',
    username: 'organizer',
    email: 'organizer@example.com',
    role: 'ORGANIZER',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  }

  const mockRegularUser = {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    role: 'USER',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z'
  }

  const mockEvent = {
    id: 1,
    name: 'Test Event',
    description: 'Test description',
    eventDate: '2025-12-20T19:00:00',
    genre: 'ROCK',
    ticketPrice: 50.00,
    maxTickets: 100,
    availableTickets: 95,
    hasSeating: false,
    seatingLayout: 'NONE',
    standingCapacity: 100,
    seatedCapacity: 0,
    imageUrl: null,
    organizerId: 1,
    isActive: true
  }

  const setAuthStorage = (win: Window) => {
    win.localStorage.setItem('accessToken', 'fake.jwt.token')
    win.localStorage.setItem('tokenType', 'Bearer')
    win.localStorage.setItem('tokenExpiration', `${Date.now() + 60 * 60 * 1000}`)
  }

  describe('Organizer privileges', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/auth/profile', mockOrganizerUser).as('getProfile')
      cy.intercept('GET', '**/api/events', [mockEvent]).as('getEvents')
      cy.intercept('GET', '**/api/events/**', mockEvent).as('getEvent')
    })

    it('allows organizer to access create event page', () => {
      cy.visit('/create', {
        onBeforeLoad: setAuthStorage
      })
      
      cy.wait('@getProfile')
      cy.url().should('include', '/create')
      cy.get('[data-cy="event-name-input"]').should('be.visible')
    })

    it('allows organizer to edit their own event', () => {
      cy.visit('/events', {
        onBeforeLoad: setAuthStorage
      })
      
      cy.wait('@getProfile')
      cy.wait('@getEvents')
      
      cy.get('[data-cy="event-card"]').first().click()

      cy.get('[data-cy="edit-event-button"]').should('exist')
    })

    it('allows organizer to delete their own event', () => {
      cy.intercept('DELETE', `**/api/events/${mockEvent.id}`, {
        statusCode: 200,
        body: { message: 'Event deleted successfully' }
      }).as('deleteEvent')

      cy.visit('/events', {
        onBeforeLoad: setAuthStorage
      })
      
      cy.wait('@getProfile')
      cy.wait('@getEvents')
      
      cy.get('[data-cy="event-card"]').first().click()
      
      cy.get('[data-cy="delete-event-button"]').should('exist').click({ force: true })

      cy.get('[role="alertdialog"], [data-state="open"]').should('exist')
      cy.get('[data-cy="confirm-delete-event"]').should('exist').click({ force: true })
      cy.wait('@deleteEvent')
      
      cy.contains(/deleted/i).should('be.visible')
    })
  })

  describe('Regular user restrictions', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/auth/profile', mockRegularUser).as('getProfile')
      cy.intercept('GET', '**/api/events', [mockEvent]).as('getEvents')
      cy.intercept('GET', '**/api/events/**', mockEvent).as('getEvent')
    })

    it('pr***REMOVED*** from creating events', () => {
      cy.visit('/create', {
        onBeforeLoad: setAuthStorage
      })
      
      cy.wait('@getProfile')

      // Fill the minimal required fields
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().slice(0, 16)

      cy.get('[data-cy="event-name-input"]').type('Forbidden Event')
      cy.get('[data-cy="event-description-input"]').type('Should be blocked')
      cy.get('[data-cy="event-date-input"]').type(dateString)
      cy.get('[data-cy="event-genre-select"]').click()
      cy.get('[role="option"]').contains('Rock').click({ force: true })
      cy.get('[data-cy="event-ticket-price-input"]').type('10')
      cy.get('[data-cy="event-max-tickets-input"]').type('50')

      cy.get('[data-cy="create-event-submit"]').click()
      cy.contains(/organizer|admin|authorized|forbidden/i).should('be.visible')
    })

    it('hides edit/delete buttons from regular users', () => {
      cy.visit('/events', {
        onBeforeLoad: setAuthStorage
      })
      
      cy.wait('@getProfile')
      cy.wait('@getEvents')
      
      cy.get('[data-cy="event-card"]').first().click()
      
      // Should NOT see edit/delete buttons
      cy.get('[data-cy="edit-event-button"]').should('not.exist')
      cy.get('[data-cy="delete-event-button"]').should('not.exist')
    })
  })

  describe('Edit restrictions', () => {
    it('prevents editing events owned by other organizers', () => {
      const otherOrganizerEvent = { ...mockEvent, organizerId: 99 }
      
      cy.intercept('GET', '**/api/auth/profile', mockOrganizerUser).as('getProfile')
      cy.intercept('GET', '**/api/events', [otherOrganizerEvent]).as('getEvents')
      cy.intercept('GET', '**/api/events/**', otherOrganizerEvent).as('getEvent')
      cy.intercept('PUT', '**/api/events/**', {
        statusCode: 403,
        body: { message: 'You are not allowed to modify this event' }
      }).as('updateEvent')

      cy.visit('/events', {
        onBeforeLoad: setAuthStorage
      })
      
      cy.wait('@getProfile')
      cy.wait('@getEvents')
      
      cy.get('[data-cy="event-card"]').first().click()
      
      // Should not see edit button for others' events
      cy.get('[data-cy="edit-event-button"]').should('not.exist')
    })
  })

  describe('Guest restrictions', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/events', [mockEvent]).as('getEvents')
      cy.intercept('GET', '**/api/events/**', mockEvent).as('getEvent')
    })

    it('redirects guest to login when trying to create event', () => {
      cy.visit('/create')

      cy.location('pathname', { timeout: 20000 }).should('eq', '/login')
    })

    it('hides management buttons for guests', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      
      cy.get('[data-cy="event-card"]').first().click()
      
      // Should not see edit/delete buttons
      cy.get('[data-cy="edit-event-button"]').should('not.exist')
      cy.get('[data-cy="delete-event-button"]').should('not.exist')
    })
  })
})
