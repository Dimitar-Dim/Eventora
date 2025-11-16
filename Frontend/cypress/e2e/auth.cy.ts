describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('loads login page', () => {
    cy.contains('Sign In').should('be.visible');
    cy.get('[data-cy="login-email-input"]').should('be.visible');
    cy.get('[data-cy="login-password-input"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.visible');
  });

  it('disables submit when empty', () => {
    cy.get('[data-cy="login-submit"]').should('be.disabled');
  });

  it('enables submit when filled', () => {
    cy.get('[data-cy="login-email-input"]').type('test@example.com');
    cy.get('[data-cy="login-password-input"]').type('password');
    cy.get('[data-cy="login-submit"]').should('not.be.disabled');
  });

  it('toggles password visibility', () => {
    cy.get('[data-cy="login-password-input"]').should('have.attr', 'type', 'password');
    cy.get('[data-cy="login-password-toggle"]').click();
    cy.get('[data-cy="login-password-input"]').should('have.attr', 'type', 'text');
  });

  it('shows error on invalid credentials', () => {
    cy.get('[data-cy="login-email-input"]').type('invalid@example.com');
    cy.get('[data-cy="login-password-input"]').type('wrong');
    cy.get('[data-cy="login-submit"]').click();
    cy.contains(/error|invalid|incorrect|failed/i, { timeout: 5000 }).should('be.visible');
  });

  it('navigates to register', () => {
    cy.contains('Create one').click();
    cy.url().should('include', '/register');
  });
});

describe('Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('loads register page', () => {
    cy.contains('Create Account').should('be.visible');
    cy.get('[data-cy="register-username-input"]').should('be.visible');
    cy.get('[data-cy="register-email-input"]').should('be.visible');
    cy.get('[data-cy="register-password-input"]').should('be.visible');
    cy.get('[data-cy="register-password-confirm-input"]').should('be.visible');
  });

  it('disables submit when incomplete', () => {
    cy.get('[data-cy="register-submit"]').should('be.disabled');
  });

  it('shows error when username too short', () => {
    cy.get('[data-cy="register-username-input"]').type('ab');
    cy.get('[data-cy="register-email-input"]').type('test@example.com');
    cy.get('[data-cy="register-password-input"]').type('password123');
    cy.get('[data-cy="register-password-confirm-input"]').type('password123');
    cy.get('[data-cy="register-submit"]').click();
    cy.contains(/at least 3 characters/i, { timeout: 5000 }).should('be.visible');
  });

  it('shows error when passwords do not match', () => {
    cy.get('[data-cy="register-username-input"]').type('user');
    cy.get('[data-cy="register-email-input"]').type('test@example.com');
    cy.get('[data-cy="register-password-input"]').type('password123');
    cy.get('[data-cy="register-password-confirm-input"]').type('different');
    cy.get('[data-cy="register-submit"]').click();
    cy.contains(/do not match|passwords/i, { timeout: 5000 }).should('be.visible');
  });

  it('enables submit with valid data', () => {
    cy.get('[data-cy="register-username-input"]').type('validuser');
    cy.get('[data-cy="register-email-input"]').type('valid@example.com');
    cy.get('[data-cy="register-password-input"]').type('password123');
    cy.get('[data-cy="register-password-confirm-input"]').type('password123');
    cy.get('[data-cy="register-submit"]').should('not.be.disabled');
  });

  it('navigates to login', () => {
    cy.contains('Sign in').click();
    cy.url().should('include', '/login');
  });
});
