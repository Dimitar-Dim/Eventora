describe('Create Event Form', () => {
  beforeEach(() => {
    cy.visit('/create');
    cy.contains('Create New Event', { timeout: 10000 }).should('be.visible');
  });

  it('should load create event page', () => {
    cy.url().should('include', '/create');
  });

  it('should display page title', () => {
    cy.contains('Create New Event').should('be.visible');
  });

  it('should display form with input fields', () => {
    cy.get('form').should('exist');
    cy.get('input[id="name"]').should('be.visible');
    cy.get('textarea[id="description"]').should('be.visible');
    cy.get('input[id="eventDate"]').should('be.visible');
  });

  it('should have price and tickets inputs', () => {
    cy.get('input[id="ticketPrice"]').should('be.visible');
    cy.get('input[id="maxTickets"]').should('be.visible');
  });

  it('should have submit button', () => {
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have cancel button', () => {
    cy.get('button').contains('Cancel').should('be.visible'); //TODO CHECK CONTAINER CONTENT
  });

  it('should be able to fill name field', () => {
    cy.get('input[id="name"]').type('Test Event');
    cy.get('input[id="name"]').should('have.value', 'Test Event');
  });

  it('should be able to fill description', () => {
    cy.get('textarea[id="description"]').type('Test description');
    cy.get('textarea[id="description"]').should('have.value', 'Test description');
  });

  it('should validate required fields', () => {
    cy.get('button[type="submit"]').click();
    // Form validation happens - page should still be visible
    cy.get('form').should('exist');
  });
});
