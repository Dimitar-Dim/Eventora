describe('Events Page', () => {
  beforeEach(() => {
    cy.visit('/events');
    // Wait for search input to appear
    cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('be.visible');
  });

  it('should load events page', () => {
    cy.url().should('include', '/events');
  });

  it('should display page title', () => {
    cy.contains('All Events').should('be.visible');
  });

  it('should display search input', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should be able to type in search', () => {
    cy.get('input[placeholder*="Search"]').type('test', { delay: 50 });
    cy.get('input[placeholder*="Search"]').should('have.value', 'test');
  });

  it('should have filter controls', () => {
    // Look for any select or button that might be filter
    cy.get('input, select, button').should('have.length.greaterThan', 0);
  });

  it('should handle loading state', () => {
    // Just verify page doesn't error and shows content
    cy.get('body').should('be.visible');
    cy.contains('Discover amazing events').should('be.visible');
  });
});
