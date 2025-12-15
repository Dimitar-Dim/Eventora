const AUTH_TOKEN_KEY = 'accessToken';
const AUTH_TOKEN_TYPE_KEY = 'tokenType';
const AUTH_TOKEN_EXPIRATION_KEY = 'tokenExpiration';

const mockUser = {
  id: '1',
  username: 'Organizer One',
  email: 'organizer@example.com',
  role: 'organizer',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z'
};

const setAuthStorage = (win: Window) => {
  win.localStorage.setItem(AUTH_TOKEN_KEY, 'fake.jwt.token');
  win.localStorage.setItem(AUTH_TOKEN_TYPE_KEY, 'Bearer');
  win.localStorage.setItem(AUTH_TOKEN_EXPIRATION_KEY, `${Date.now() + 60 * 60 * 1000}`);
};

describe('Edit Event Page', () => {
  const eventId = 123;

  const visitEditPage = () => {
    cy.visit(`/edit/${eventId}`, {
      onBeforeLoad: setAuthStorage
    });
  };

  beforeEach(() => {
    cy.intercept('GET', `**/api/auth/profile`, { body: mockUser }).as('getProfile');
    cy.intercept('GET', `**/api/events/${eventId}`, { fixture: 'event-detail.json' }).as('getEvent');
  });

  it('loads existing event details into the form', () => {
    visitEditPage();
    cy.wait('@getProfile');
    cy.wait('@getEvent');

    cy.get('[data-cy="edit-title"]').should('contain.text', 'Edit Event');
    cy.get('[data-cy="edit-name-input"]').should('have.value', 'City Lights Festival');
    cy.get('[data-cy="edit-description-input"]').should('contain.value', 'Multi-stage city music festival');
    cy.get('[data-cy="edit-price-input"]').should('have.value', '49.99');
    cy.get('[data-cy="edit-max-tickets-input"]').should('have.value', '500');
  });

  it('submits updated event data and shows success toast', () => {
    cy.intercept('PUT', `**/api/events/${eventId}`, (req) => {
      expect(req.body.name).to.equal('Updated City Lights');
      expect(req.body.genre).to.equal('Jazz');
      req.reply({
        statusCode: 200,
        body: {
          ...req.body,
          id: eventId,
          availableTickets: req.body.maxTickets,
          isActive: true,
          organizerId: 1,
          createdAt: '2025-05-01T10:00:00.000Z',
          updatedAt: new Date().toISOString()
        }
      });
    }).as('updateEvent');

    visitEditPage();
    cy.wait('@getProfile');
    cy.wait('@getEvent');

    cy.get('[data-cy="edit-name-input"]').clear().type('Updated City Lights');
    cy.get('[data-cy="edit-genre-select"]').click();
    cy.get('[role="option"]').contains('Jazz').click();
    cy.get('[data-cy="edit-price-input"]').clear().type('59.99');

    cy.get('[data-cy="edit-submit"]').click();

    cy.wait('@updateEvent');
    cy.contains(/Event updated successfully/i, { timeout: 5000 }).should('be.visible');
  });

  it('allows toggling seating options', () => {
    visitEditPage();
    cy.wait('@getProfile');
    cy.wait('@getEvent');

    cy.get('[data-cy="edit-has-seating-toggle"]').should('exist');
    
    cy.get('[data-cy="edit-has-seating-toggle"]').click();
    
    // Should show seating layout options
    cy.get('[data-cy="edit-seating-layout-select"]').should('be.visible');
  });

  it('allows selecting different seating layouts', () => {
    visitEditPage();
    cy.wait('@getProfile');
    cy.wait('@getEvent');

    cy.get('[data-cy="edit-has-seating-toggle"]').click();
    
    cy.get('[data-cy="edit-seating-layout-select"]').click();
    cy.get('[role="option"]').contains(/floor/i).first().click();
    
    // Should update capacity fields
    cy.get('[data-cy="edit-seated-capacity-input"]').should('be.visible');
  });
});
