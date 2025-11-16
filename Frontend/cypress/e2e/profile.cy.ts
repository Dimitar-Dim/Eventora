const profileResponse = {
  id: "7",
  username: "Ticket Fan",
  email: "fan@example.com",
  role: "user",
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-11-01T10:00:00.000Z",
};

const visitProfile = (tickets: unknown[]) => {
  cy.intercept("GET", "**/api/auth/profile", profileResponse).as("getProfile");
  cy.intercept("GET", "**/api/tickets/me", tickets).as("getTickets");

  cy.visit("/profile", {
    onBeforeLoad(win) {
      win.localStorage.setItem("accessToken", "ey.fake.token");
      win.localStorage.setItem("tokenType", "Bearer");
      win.localStorage.setItem("tokenExpiration", (Date.now() + 60_000).toString());
    },
  });

  cy.wait(["@getProfile", "@getTickets"]);
};

describe("Profile ticket history", () => {
  it("shows empty state when no tickets", () => {
    visitProfile([]);

    cy.contains("Ticket History").should("be.visible");
  cy.get('[data-cy="ticket-empty-state"]').should("be.visible");
    cy.contains("No tickets yet").should("be.visible");
  });

  it("renders fetched tickets", () => {
    const tickets = [
      {
        ticketId: 101,
        eventId: 1,
        eventName: "Indie Vibes",
        eventDate: "2025-03-10T18:00:00.000Z",
        issuedTo: "Ticket Fan",
        qrCode: "QR-101",
        status: "ACTIVE",
        ticketPrice: 49,
        purchasedAt: "2025-02-01T12:00:00.000Z",
        eventImageUrl: null,
      },
      {
        ticketId: 102,
        eventId: 2,
        eventName: "Jazz Lounge",
        eventDate: "2025-04-15T18:30:00.000Z",
        issuedTo: "Ticket Fan",
        qrCode: "QR-102",
        status: "USED",
        ticketPrice: 59,
        purchasedAt: "2025-02-05T20:00:00.000Z",
        eventImageUrl: null,
      },
    ];

    visitProfile(tickets);

  cy.get('[data-cy="ticket-card"]').should("have.length", 2);
    cy.contains("Indie Vibes").should("be.visible");
    cy.contains("Jazz Lounge").should("be.visible");
  });
});
