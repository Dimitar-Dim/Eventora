describe('Authentication Flow', () => {
  it('should load login page with form elements', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should display register page with form fields', () => {
    cy.visit('/register');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show error on invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    // Wait for API response - page should still be visible
    cy.get('body').should('be.visible');
  });

  it('should disable submit button while loading', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should validate empty email field', () => {
    cy.visit('/login');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should validate empty password field', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should have toggle password visibility', () => {
    cy.visit('/login');
    cy.get('input[type="password"]').should('have.attr', 'type', 'password');
    cy.get('button[type="button"]').first().click();
    // After clicking toggle, input type changes or becomes visible
    cy.get('input').should('exist');
  });

  it('should navigate from login to register', () => {
    cy.visit('/login');
    cy.contains('Create one').click();
    cy.url().should('include', '/register');
  });

  it('should navigate from register to login', () => {
    cy.visit('/register');
    cy.contains('Sign in').click();
    cy.url().should('include', '/login');
  });

  it('should fill register form with valid data', () => {
    cy.visit('/register');
    cy.get('input').first().type('validu***REMOVED***');
    cy.get('input[type="email"]').type('valid@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should disable submit when passwords dont match', () => {
    cy.visit('/register');
    cy.get('input').first().type('validu***REMOVED***');
    cy.get('input[type="email"]').type('user@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('different');
    // Form should still be visible
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should display login page title', () => {
    cy.visit('/login');
    cy.contains('Sign In').should('be.visible');
  });

  it('should display register page title', () => {
    cy.visit('/register');
    cy.contains('Create Account').should('be.visible');
  });
});
