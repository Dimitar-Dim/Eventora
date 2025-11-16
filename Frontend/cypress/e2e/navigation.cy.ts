describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads homepage with navigation', () => {
    cy.get('[data-cy="navigation"]').should('be.visible');
  });

  it('navigates to login', () => {
    cy.get('[data-cy="nav-login"]').click();
    cy.url().should('include', '/login');
  });

  it('navigates to register', () => {
    cy.get('[data-cy="nav-register"]').click();
    cy.url().should('include', '/register');
  });

  it('navigates to events', () => {
    cy.get('[data-cy="nav-events"]').click();
    cy.url().should('include', '/events');
  });

  it('navigates to home', () => {
    cy.visit('/events');
    cy.get('[data-cy="nav-home"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
