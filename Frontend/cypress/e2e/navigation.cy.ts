describe('Homepage Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage', () => {
    cy.get('nav').should('exist');
  });

  it('should navigate to login page', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should navigate to register page', () => {
    cy.visit('/register');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should display navigation menu', () => {
    cy.get('nav').should('be.visible');
  });
});
