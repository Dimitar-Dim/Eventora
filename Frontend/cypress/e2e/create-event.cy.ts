describe('Create Event', () => {
  beforeEach(() => {
    cy.visit('/create');
  });

  it('loads form fields', () => {
    cy.get('[data-cy="event-name-input"]').should('be.visible');
    cy.get('[data-cy="event-description-input"]').should('be.visible');
    cy.get('[data-cy="event-date-input"]').should('be.visible');
    cy.get('[data-cy="event-genre-select"]').should('be.visible');
    cy.get('[data-cy="event-ticket-price-input"]').should('be.visible');
    cy.get('[data-cy="event-max-tickets-input"]').should('be.visible');
  });

  it('fills and submits form', () => {
    cy.get('[data-cy="event-name-input"]').type('Test Event');
    cy.get('[data-cy="event-description-input"]').type('Test description');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    cy.get('[data-cy="event-date-input"]').type(dateString);
    
    cy.get('[data-cy="event-genre-select"]').click();
    cy.get('[role="option"]').contains('Rock').click({ force: true });
    
    cy.get('[data-cy="event-ticket-price-input"]').type('25.50');
    cy.get('[data-cy="event-max-tickets-input"]').type('100');
    cy.get('[data-cy="create-event-submit"]').click();
  });

  it('validates required fields', () => {
    cy.get('[data-cy="create-event-submit"]').click();
    cy.contains(/required|error/i).should('be.visible');
  });

  it('allows canceling', () => {
    cy.get('[data-cy="create-event-cancel"]').click();
    cy.url().should('not.include', '/create');
  });
});
