describe('Edit Event Page', () => {
  const eventId = 123;

  beforeEach(() => {
    cy.intercept('GET', `**/api/events/${eventId}`, { fixture: 'event-detail.json' }).as('getEvent');
  });

  it('loads existing event details into the form', () => {
    cy.visit(`/edit/${eventId}`);
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

    cy.visit(`/edit/${eventId}`);
    cy.wait('@getEvent');

    cy.get('[data-cy="edit-name-input"]').clear().type('Updated City Lights');
    cy.get('[data-cy="edit-genre-select"]').click();
    cy.get('[role="option"]').contains('Jazz').click();
    cy.get('[data-cy="edit-price-input"]').clear().type('59.99');

    cy.get('[data-cy="edit-submit"]').click();

    cy.wait('@updateEvent');
    cy.contains('Event updated successfully', { timeout: 5000 }).should('be.visible');
  });
});
