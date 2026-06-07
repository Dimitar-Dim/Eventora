beforeEach(() => {
  // Any GET/POST with a custom header (Content-Type, Authorization) triggers a CORS
  // preflight OPTIONS before the real request.  Cypress only intercepts the method you
  // specify, so OPTIONS falls through to the network.  On the GitHub Actions runner the
  // backend is only reachable at localhost:8080, but the frontend is compiled with
  // NEXT_PUBLIC_API_URL=http://100.110.129.21:8080 (Tailscale IP), so every preflight
  // to that host hangs until TCP timeout.  After the CORS preflight cache expires
  // (~5 min) the browser starts blocking the real GET/POST — which is why specs 8-10
  // fail even though the same intercept pattern works for specs 1-7.
  //
  // Fix: intercept all OPTIONS to /api/** and immediately return a permissive CORS
  // response.  Individual tests still intercept their specific GETs/POSTs as before.
  cy.intercept('OPTIONS', '**/api/**', {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  })

  // Also stub the profile GET so specs that never intercept it (auth, event-details,
  // events, navigation) don't open a hanging connection to the unreachable host.
  // Specs that need a real profile response register their own cy.intercept for this
  // URL after this one — Cypress last-registered-wins, so theirs takes priority.
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
