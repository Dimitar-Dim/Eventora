beforeEach(() => {
  // Requests with Authorization/Content-Type headers send a CORS preflight OPTIONS first.
  // Cypress only intercepts the method you register, so without this the OPTIONS goes to
  // the unreachable Tailscale host (100.110.129.21:8080) and blocks the real request.
  // Origin must be specific (not *) because requiresAuth routes use credentials:"include".
  cy.intercept('OPTIONS', '**/api/**', {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  })

  // Default profile stub — specs that need a real user register their own intercept
  // after this one (Cypress last-registered-wins).
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
