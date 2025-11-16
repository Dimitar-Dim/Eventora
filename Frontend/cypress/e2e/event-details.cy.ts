describe('Event Details', () => {
  beforeEach(() => {
    cy.visit('/events');
  });

  it('loads events page', () => {
    cy.url().should('include', '/events');
    cy.get('[data-cy="search-input"]').should('be.visible');
  });

  it('searches for events', () => {
    cy.get('[data-cy="search-input"]').type('rock');
    cy.get('[data-cy="search-input"]').should('have.value', 'rock');
  });

  it('clears search', () => {
    cy.get('[data-cy="search-input"]').type('test');
    cy.get('[data-cy="search-input"]').clear();
    cy.get('[data-cy="search-input"]').should('have.value', '');
  });

  it('displays page content', () => {
    cy.get('[data-cy="search-input"]').should('be.visible');
  });

    it('opens event details', () => {
    cy.get('[data-cy="event-card"]').should('exist').and('be.visible');
    cy.get('[data-cy="event-card"]').first().click();
    cy.get('[data-cy="event-details-title"]').should('be.visible');
  });

  it('shows event information', () => {
    cy.get('[data-cy="event-card"]').should('exist').and('be.visible');
    cy.get('[data-cy="event-card"]').first().click();
    cy.get('[data-cy="event-title"]').should('be.visible');
  });
});
