CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('GUEST', 'USER', 'ORGANIZER', 'ADMIN')) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Event" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    duration_minutes INT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Ticket" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES "Event"(id) ON DELETE CASCADE,
    user_id UUID REFERENCES "User"(id) ON DELETE SET NULL,
    qr_code VARCHAR(255) UNIQUE,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'USED', 'CANCELLED')) DEFAULT 'ACTIVE',
    issued_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);