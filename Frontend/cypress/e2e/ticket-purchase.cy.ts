describe('Ticket Purchase Flow', () => {
  const mockEvent = {
    id: 1,
    name: 'Rock Concert',
    description: 'Amazing rock concert',
    eventDate: '2025-12-20T19:00:00',
    genre: 'ROCK',
    ticketPrice: 50.00,
    maxTickets: 100,
    availableTickets: 95,
    hasSeating: true,
    seatingLayout: 'FLOOR',
    standingCapacity: 0,
    seatedCapacity: 100,
    imageUrl: 'https://example.com/image.jpg',
    organizerId: 1,
    isActive: true
  }

  const mockPurchaseResponse = {
    ticketId: 123,
    eventId: 1,
    eventName: 'Rock Concert',
    issuedTo: 'John Doe',
    qrCode: 'QR-123',
    status: 'ACTIVE',
    remainingTickets: 94,
    pricePaid: 50.00,
    purchasedAt: new Date().toISOString(),
    seatSection: 'Floor-A',
    seatRow: '1',
    seatNumber: '1',
    deliveryEmail: 'test@example.com'
  }

  beforeEach(() => {
    cy.intercept('GET', '**/api/events', [mockEvent]).as('getEvents')
    cy.intercept('GET', `**/api/events/${mockEvent.id}`, mockEvent).as('getEvent')
  })

  describe('Guest checkout', () => {
    it('requires email for guest ticket purchase', () => {
      cy.intercept('POST', `**/api/events/${mockEvent.id}/tickets`, {
        statusCode: 409,
        body: {
          message: 'Please provide a valid email address so we can deliver the ticket.'
        }
      }).as('purchaseTicket')

      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Try to purchase without email
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="purchase-button"]').should('be.visible').click()
      
      // Should show error about email
      cy.contains(/email.*required/i).should('be.visible')
    })

    it('allows guest to purchase ticket with valid email', () => {
      cy.intercept('POST', `**/api/events/${mockEvent.id}/tickets`, mockPurchaseResponse).as('purchaseTicket')

      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Fill in email
      cy.get('[data-cy="email-input"]').should('be.visible').type('guest@example.com')
      
      // Fill in name
      cy.get('[data-cy="name-input"]').first().type('Guest User')
      
      // Select seat
      cy.get('[data-cy="seat-button"]').first().click()
      
      // Purchase
      cy.get('[data-cy="purchase-button"]').should('be.visible').click()
      cy.wait('@purchaseTicket')
      
      // Check success message
      cy.contains(/ticket.*confirmed/i).should('be.visible')
    })
  })

  describe('Authenticated user checkout', () => {
    beforeEach(() => {
      // Mock authenticated state
      cy.visit('/events', {
        onBeforeLoad(win) {
          win.localStorage.setItem('accessToken', 'ey.fake.token')
          win.localStorage.setItem('tokenType', 'Bearer')
          win.localStorage.setItem('tokenExpiration', (Date.now() + 60_000).toString())
        }
      })
    })

    it('allows authenticated user to purchase with account email', () => {
      cy.intercept('GET', '**/api/auth/profile', {
        id: 7,
        username: 'testuser',
        email: 'user@example.com',
        role: 'USER'
      }).as('getProfile')

      cy.intercept('POST', `**/api/events/${mockEvent.id}/tickets`, {
        ...mockPurchaseResponse,
        deliveryEmail: 'user@example.com'
      }).as('purchaseTicket')

      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // User email should be pre-filled or not required
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="purchase-button"]').should('be.visible').click()
      cy.wait('@purchaseTicket')
      
      cy.contains(/ticket.*confirmed/i).should('be.visible')
    })

    it('allows authenticated user to override email', () => {
      cy.intercept('GET', '**/api/auth/profile', {
        id: 7,
        username: 'testuser',
        email: 'user@example.com',
        role: 'USER'
      }).as('getProfile')

      cy.intercept('POST', `**/api/events/${mockEvent.id}/tickets`, {
        ...mockPurchaseResponse,
        deliveryEmail: 'other@example.com'
      }).as('purchaseTicket')

      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Override with different email
      cy.get('[data-cy="email-input"]').clear().type('other@example.com')
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="purchase-button"]').click()
      cy.wait('@purchaseTicket')
      
      cy.contains(/ticket.*confirmed/i).should('be.visible')
    })
  })

  describe('Seat selection', () => {
    it('requires at least one seat to be selected', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.get('[data-cy="email-input"]').type('test@example.com')
      cy.get('[data-cy="purchase-button"]').should('be.visible').click()
      
      cy.contains(/select.*seat/i).should('be.visible')
    })

    it('allows selecting and deselecting seats', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      // Select a seat
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="seat-button"]').first().should('have.class', 'bg-green-500')
      
      // Deselect the seat
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="seat-button"]').first().should('not.have.class', 'bg-green-500')
    })
  })

  describe('Sold out event', () => {
    it('shows sold out message when no tickets available', () => {
      const soldOutEvent = { ...mockEvent, availableTickets: 0 }
      cy.intercept('GET', '**/api/events', [soldOutEvent]).as('getEvents')
      cy.intercept('GET', `**/api/events/${soldOutEvent.id}`, soldOutEvent).as('getEvent')

      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.contains(/sold out/i).should('be.visible')
      cy.get('[data-cy="purchase-button"]').should('be.disabled')
    })
  })

  describe('Error handling', () => {
    it('shows error message on purchase failure', () => {
      cy.intercept('POST', `**/api/events/${mockEvent.id}/tickets`, {
        statusCode: 500,
        body: { message: 'Purchase failed' }
      }).as('purchaseTicket')

      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.get('[data-cy="email-input"]').type('test@example.com')
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="purchase-button"]').click()
      cy.wait('@purchaseTicket')
      
      cy.contains(/failed|error/i).should('be.visible')
    })

    it('validates email format', () => {
      cy.visit('/events')
      cy.wait('@getEvents')
      cy.get('[data-cy="event-card"]').first().click()
      cy.wait('@getEvent')
      
      cy.get('[data-cy="email-input"]').type('invalid-email')
      cy.get('[data-cy="seat-button"]').first().click()
      cy.get('[data-cy="purchase-button"]').click()
      
      cy.contains(/valid email/i).should('be.visible')
    })
  })
})
