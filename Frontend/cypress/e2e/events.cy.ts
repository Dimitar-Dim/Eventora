describe('Events', () => {
  beforeEach(() => {
    const mockEvent = {
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

    cy.intercept('GET', '**/api/events', [mockEvent]).as('getEvents')
    cy.visit('/events')
    cy.wait('@getEvents')
  });

  it('loads events page', () => {
    cy.url().should('include', '/events');
    cy.get('[data-cy="search-input"]').should('be.visible');
  });

  it('searches events', () => {
    cy.get('[data-cy="search-input"]').type('jazz');
    cy.get('[data-cy="search-input"]').should('have.value', 'jazz');
  });

  it('clears search', () => {
    cy.get('[data-cy="search-input"]').type('test');
    cy.get('[data-cy="search-input"]').clear();
    cy.get('[data-cy="search-input"]').should('have.value', '');
  });

  it('displays page content', () => {
    cy.get('[data-cy="search-input"]').should('be.visible');
  });

  it('navigates to event details', () => {
    cy.get('[data-cy="event-card"]').should('exist').and('be.visible');
    cy.get('[data-cy="event-card"]').first().click();
    cy.get('[data-cy="event-details-title"]').should('be.visible');
  });
});
