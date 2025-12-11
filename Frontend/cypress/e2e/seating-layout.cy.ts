describe('Event details essentials', () => {
  const activeEvent = {
    id: 1,
    name: 'Showcase Night',
    description: 'Event with curated artists',
    eventDate: '2025-12-20T19:00:00',
    genre: 'ROCK',
    ticketPrice: 50.0,
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

  const soldOutEvent = { ...activeEvent, id: 2, availableTickets: 0 }

  it('opens an event card and shows key details', () => {
    cy.intercept('GET', '**/api/events', [activeEvent]).as('getEvents')

    cy.visit('/events')
    cy.wait('@getEvents')

    cy.get('[data-cy="event-card"]').first().click()
    cy.get('[data-cy="event-details-title"]').should('contain.text', 'Showcase Night')
    cy.get('[data-cy="event-genre"]').should('contain.text', 'ROCK')
    cy.get('[data-cy="event-details-price"]').should('contain.text', '€50')
  })

  it('surfaces sold out state in details', () => {
    cy.intercept('GET', '**/api/events', [soldOutEvent]).as('getEvents')

    cy.visit('/events')
    cy.wait('@getEvents')

    cy.get('[data-cy="event-card"]').first().click()
    cy.get('[data-cy="event-available-tickets"]').should('contain.text', 'Sold Out')
    cy.get('[data-cy="event-available-tickets"]').should('contain.text', '0')
  })
})
