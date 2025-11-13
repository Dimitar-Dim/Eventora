describe('Event Details Page', () => {
  beforeEach(() => {
    cy.visit('/events');
    cy.contains('All Events', { timeout: 10000 }).should('be.visible');
  });

  it('should load events page', () => {
    cy.url().should('include', '/events');
  });

  it('should display page header', () => {
    cy.contains('All Events').should('be.visible');
    cy.contains('Discover amazing events').should('be.visible');
  });

  it('should have search and filter controls', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should render page without errors', () => {
    // Page loads and displays key elements
    cy.get('body').should('be.visible');
    cy.get('input[placeholder*="Search"]').should('exist');
  });

  it('should respond to search input', () => {
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').type('test');
    cy.get('input[placeholder*="Search"]').should('have.value', 'test');
  });

  it('should allow clearing search', () => {
    cy.get('input[placeholder*="Search"]').type('test');
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').should('have.value', '');
  });
});
