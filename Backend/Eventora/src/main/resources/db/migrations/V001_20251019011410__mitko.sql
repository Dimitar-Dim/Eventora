DROP TABLE IF EXISTS "Ticket" CASCADE;
DROP TABLE IF EXISTS "Event" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Event" (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    genre VARCHAR(50),
    ticket_price NUMERIC(10,2) NOT NULL,
    max_tickets INTEGER NOT NULL,
    available_tickets INTEGER NOT NULL,
    image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    organizer_id BIGINT NOT NULL REFERENCES "User"(id)
);

CREATE TABLE "Ticket" (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES "Event"(id),
    user_id BIGINT NOT NULL REFERENCES "User"(id),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO "User" (username, email, password_hash) VALUES ('admin', 'admin@eventora.com', 'hash');

CREATE INDEX idx_event_organizer_id ON "Event"(organizer_id);
CREATE INDEX idx_ticket_event_id ON "Ticket"(event_id);
CREATE INDEX idx_ticket_user_id ON "Ticket"(user_id);