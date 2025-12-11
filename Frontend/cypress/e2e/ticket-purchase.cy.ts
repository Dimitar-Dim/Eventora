describe('Ticket purchase essentials', () => {
  const seatedEvent = {
    id: 1,
    name: 'Rock Concert',
    description: 'Amazing rock concert',
    eventDate: '2025-12-20T19:00:00',
    genre: 'ROCK',
    ticketPrice: 50.0,
    maxTickets: 100,
    availableTickets: 95,
    hasSeating: true,
    seatingLayout: 'FLOOR',
    standingCapacity: 500,
    seatedCapacity: 100,
    imageUrl: 'https://example.com/image.jpg',
    organizerId: 1,
    isActive: true
  }

  beforeEach(() => {
    cy.intercept('GET', '**/api/events', [seatedEvent]).as('getEvents')
    cy.intercept('GET', `**/api/events/${seatedEvent.id}`, seatedEvent).as('getEvent')
    cy.intercept('GET', `**/api/events/${seatedEvent.id}/purchased-seats`, []).as('getPurchasedSeats')
  })

  it('opens the purchase dialog from event details', () => {
    cy.visit('/events')
    cy.wait('@getEvents')

    cy.get('[data-cy="event-card"]').first().click()
    cy.contains('button', /open ticket window/i).click()
    cy.contains(/secure your ticket/i).should('be.visible')
  })

  it('requires delivery email before completing purchase', () => {
    cy.visit('/events')
    cy.wait('@getEvents')

    cy.get('[data-cy="event-card"]').first().click()
    cy.contains('button', /open ticket window/i).click()
  cy.wait('@getPurchasedSeats')

    // Select first available seat to unlock details step
    cy.get('button[aria-label^="Sector"]').first().click()
    cy.contains('button', /continue to details/i).click()

    // Details step requires email before purchase
    cy.contains('button', /purchase/i).should('be.visible').as('purchaseAction')
    cy.get('@purchaseAction').should('be.disabled')
    cy.contains(/email is required for delivery/i).should('be.visible')

    // Provide email and verify button unlocks
    cy.get('input[placeholder="you@example.com"]').type('buyer@example.com')
    cy.get('@purchaseAction').should('not.be.disabled')
    cy.contains(/email is required for delivery/i).should('not.exist')
  })
})
