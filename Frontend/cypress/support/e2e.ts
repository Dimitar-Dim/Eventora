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
