beforeEach(() => {
  // Default stub: any spec that doesn't intercept profile gets an immediate 401
  // so the auth context clears the token and moves on without hanging on the
  // unreachable Tailscale IP (100.110.129.21:8080).  Specs that need a valid
  // profile (e.g. profile.cy.ts, access-control.cy.ts) register their own
  // intercept AFTER this one — Cypress last-registered-wins, so theirs wins.
  cy.intercept('GET', '**/api/auth/profile', { statusCode: 401 }).as('globalAuthProfile')
})

const app = window.top as Window | null;

if (!app || !app.document || !app.document.head) {
} else if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');

  app.document.head.appendChild(style);
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', 'http://localhost:3000/events');
});

Cypress.Commands.add('logout', () => {
  cy.get('button:contains("Logout")').click();
  cy.url().should('eq', 'http://localhost:3000/login');
});
