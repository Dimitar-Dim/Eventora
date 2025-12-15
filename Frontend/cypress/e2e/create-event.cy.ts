describe('Create Event', () => {
  beforeEach(() => {
    const mockOrganizerUser = {
      id: '1',
      username: 'organizer',
      email: 'organizer@example.com',
      role: 'ORGANIZER',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z'
    };

    const organizerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiT1JHQU5JWkVSIn0.signature';

    cy.intercept('GET', '**/api/auth/profile', mockOrganizerUser).as('getProfile');
    cy.intercept('POST', '**/api/events', {
      statusCode: 201,
      body: { id: 123, name: 'Test Event' }
    }).as('createEvent');

    cy.visit('/create', {
      onBeforeLoad(win) {
        win.localStorage.setItem('accessToken', organizerToken);
        win.localStorage.setItem('tokenType', 'Bearer');
        win.localStorage.setItem('tokenExpiration', `${Date.now() + 60 * 60 * 1000}`);
      }
    });

    cy.wait('@getProfile');
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
    cy.get('[data-cy="event-name-input"]').should('exist').should('be.enabled').type('Test Event', { delay: 0 });
    cy.get('[data-cy="event-description-input"]').should('exist').should('be.enabled').type('Test description', { delay: 0 });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    cy.get('[data-cy="event-date-input"]').should('exist').should('be.enabled').type(dateString, { delay: 0 });
    
    cy.get('[data-cy="event-genre-select"]').should('exist').click();
    cy.get('[role="option"]').contains('Rock').click({ force: true });
    
    cy.get('[data-cy="event-ticket-price-input"]').should('exist').should('be.enabled').type('25.50', { delay: 0 });
    cy.get('[data-cy="event-max-tickets-input"]').should('exist').should('be.enabled').type('100', { delay: 0 });
    cy.get('[data-cy="create-event-submit"]').click();
    cy.wait('@createEvent');
  });

  it('validates required fields', () => {
    cy.get('[data-cy="create-event-submit"]').click();
    cy.contains(/required|error/i).should('be.visible');
  });

  it('allows canceling', () => {
    cy.get('[data-cy="create-event-cancel"]').click();
    cy.url().should('not.include', '/create');
  });

  it('allows enabling seating and selecting layout', () => {
    cy.get('[data-cy="event-name-input"]').should('exist').should('be.enabled').type('Seated Event', { delay: 0 });
    cy.get('[data-cy="event-description-input"]').should('exist').should('be.enabled').type('Event with seating', { delay: 0 });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    cy.get('[data-cy="event-date-input"]').should('exist').should('be.enabled').type(dateString, { delay: 0 });
    
    cy.get('[data-cy="event-genre-select"]').should('exist').click();
    cy.get('[role="option"]').contains('Rock').click({ force: true });
    
    cy.get('[data-cy="event-ticket-price-input"]').should('exist').should('be.enabled').type('50.00', { delay: 0 });
    cy.get('[data-cy="event-max-tickets-input"]').should('exist').should('be.enabled').type('200', { delay: 0 });
    
    // Enable seating
    cy.get('[data-cy="event-has-seating-toggle"]').click();
    
    // Select seating layout
    cy.get('[data-cy="event-seating-layout-select"]').should('be.visible').click();
    cy.get('[role="option"]').contains(/floor/i).first().click();
    
    // Seated capacity should be visible
    cy.get('[data-cy="event-seated-capacity-input"]').should('be.visible');
  });

  it('validates standing capacity when seating is disabled', () => {
    cy.get('[data-cy="event-name-input"]').should('exist').should('be.enabled').type('Standing Event', { delay: 0 });
    cy.get('[data-cy="event-description-input"]').should('exist').should('be.enabled').type('Standing only', { delay: 0 });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    cy.get('[data-cy="event-date-input"]').should('exist').should('be.enabled').type(dateString, { delay: 0 });
    
    cy.get('[data-cy="event-genre-select"]').should('exist').click();
    cy.get('[role="option"]').contains('Rock').click({ force: true });
    
    cy.get('[data-cy="event-ticket-price-input"]').should('exist').should('be.enabled').type('30.00', { delay: 0 });
    cy.get('[data-cy="event-max-tickets-input"]').should('exist').should('be.enabled').type('500', { delay: 0 });
    
    // Standing capacity should be visible
    cy.get('[data-cy="event-standing-capacity-input"]').should('be.visible');
  });
});

